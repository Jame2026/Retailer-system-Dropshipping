import { prisma } from '../database/client.js';
import { OrderStatus, SupplierType } from '@prisma/client';
import { CONSTANTS } from '../config/constants.js';
import { ShopifyOrderWebhookPayload } from '../types/order.types.js';
import { normalizeAddress } from '../utils/addressNormalizer.js';
import { mappingService } from './mapping.service.js';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { zendropClient } from '../integrations/zendrop/zendrop.client.js';
import { logger } from '../utils/logger.js';

export class OrderService {
  /**
   * Process incoming Shopify Order Webhook (orders/paid or orders/create)
   */
  async handleShopifyOrderPaid(payload: ShopifyOrderWebhookPayload) {
    const shopifyOrderId = String(payload.admin_graphql_api_id || payload.id);
    const existingOrder = await prisma.order.findUnique({
      where: { shopifyOrderId },
      include: { items: true },
    });

    if (existingOrder) {
      logger.info({ shopifyOrderId }, 'Order already exists in database, skipping duplicate ingestion');
      return existingOrder;
    }

    const rawShipping = payload.shipping_address || {
      name: payload.name || 'Valued Customer',
      address1: '123 Main St',
      city: 'Austin',
      province: 'Texas',
      province_code: 'TX',
      zip: '78701',
      country: 'United States',
      country_code: 'US',
    };

    const normalizedAddress = normalizeAddress(rawShipping);
    const holdHours = CONSTANTS.HOLD_BUFFER_HOURS;
    const holdExpiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);

    const initialStatus = normalizedAddress.isValid
      ? OrderStatus.PENDING_HOLD
      : OrderStatus.MANUAL_REVIEW;

    const notes = normalizedAddress.isValid
      ? null
      : `Address validation failed: ${normalizedAddress.validationErrors.join('; ')}`;

    // Create order with line items
    const createdOrder = await prisma.order.create({
      data: {
        shopifyOrderId,
        shopifyOrderNumber: String(payload.name || payload.order_number),
        shopifyCreatedAt: new Date(payload.created_at || Date.now()),
        customerEmail: payload.email || 'no-email@customer.com',
        customerPhone: payload.phone || normalizedAddress.phone,

        shippingName: normalizedAddress.name,
        shippingAddress1: normalizedAddress.address1,
        shippingAddress2: normalizedAddress.address2,
        shippingCity: normalizedAddress.city,
        shippingProvince: normalizedAddress.stateName,
        shippingProvinceCode: normalizedAddress.stateCode,
        shippingZip: normalizedAddress.zipCode,
        shippingCountry: normalizedAddress.country,
        shippingCountryCode: normalizedAddress.countryCode,

        currency: payload.currency || 'USD',
        totalPrice: Number(payload.total_price) || 0,
        subtotalPrice: Number(payload.subtotal_price) || 0,
        financialStatus: payload.financial_status || 'paid',

        status: initialStatus,
        holdExpiresAt,
        manualReviewNotes: notes,

        items: {
          create: await Promise.all(
            payload.line_items.map(async (item) => {
              const skuMapping = await prisma.skuMapping.findUnique({
                where: { storeSku: item.sku },
              });
              return {
                shopifyLineItemId: String(item.id),
                shopifyProductId: item.product_id ? String(item.product_id) : null,
                shopifyVariantId: String(item.variant_id),
                title: item.title,
                variantTitle: item.variant_title || null,
                storeSku: item.sku,
                quantity: item.quantity,
                price: Number(item.price) || 0,
                skuMappingId: skuMapping ? skuMapping.id : null,
              };
            })
          ),
        },
      },
      include: { items: true },
    });

    logger.info(
      { orderId: createdOrder.id, shopifyOrderNumber: createdOrder.shopifyOrderNumber, status: createdOrder.status },
      'Ingested new Shopify order into dropshipping pipeline'
    );

    return createdOrder;
  }

  /**
   * Handle Shopify Order Cancelled webhook
   */
  async handleShopifyOrderCancelled(shopifyOrderId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { shopifyOrderId },
    });

    if (!order) {
      logger.warn({ shopifyOrderId }, 'Cancelled webhook received for unknown order');
      return null;
    }

    if (order.supplierOrderId && order.supplierType === SupplierType.CJ) {
      try {
        await cjOrder.cancelOrder(order.supplierOrderId);
      } catch (err: any) {
        logger.error({ orderId: order.id, err: err.message }, 'Failed to cancel order with CJ supplier');
      }
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        manualReviewNotes: `Shopify cancellation: ${reason || 'Cancelled by customer/store'}`,
      },
    });

    logger.info({ orderId: order.id }, 'Order successfully marked as CANCELLED');
    return updated;
  }

  /**
   * Dispatches an order to the supplier (CJ Dropshipping or Zendrop)
   */
  async dispatchOrderToSupplier(orderId: string, forceSupplier?: SupplierType) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { skuMapping: true } } },
    });

    if (!order) throw new Error(`Order ${orderId} not found`);

    if (order.status === OrderStatus.DISPATCHED_TO_SUPPLIER || order.status === OrderStatus.SHIPPED) {
      logger.info({ orderId }, 'Order already dispatched, skipping');
      return order;
    }

    // Resolve supplier products
    const resolvedItems: Array<{
      item: (typeof order.items)[0];
      supplier: SupplierType;
      sku: string;
      vid?: string;
    }> = [];

    for (const item of order.items) {
      const resolved = await mappingService.resolveSku(item.storeSku, forceSupplier === SupplierType.ZENDROP);
      if (!resolved) {
        // Unmapped SKU, send to manual review
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.MANUAL_REVIEW,
            lastErrorReason: `Unmapped SKU: ${item.storeSku}`,
          },
        });
        logger.warn({ orderId, storeSku: item.storeSku }, 'Unmapped SKU found during dispatch, moved to MANUAL_REVIEW');
        return order;
      }

      resolvedItems.push({
        item,
        supplier: forceSupplier || resolved.supplier,
        sku: resolved.supplierSku,
        vid: resolved.supplierVid || undefined,
      });
    }

    const targetSupplier = forceSupplier || resolvedItems[0]?.supplier || SupplierType.CJ;

    try {
      if (targetSupplier === SupplierType.CJ) {
        const cjResponse = await cjOrder.createOrder({
          orderNumber: order.shopifyOrderNumber,
          shippingCountryCode: order.shippingCountryCode,
          shippingCountry: order.shippingCountry,
          shippingProvince: order.shippingProvince,
          shippingCity: order.shippingCity,
          shippingAddress: order.shippingAddress2
            ? `${order.shippingAddress1} ${order.shippingAddress2}`
            : order.shippingAddress1,
          shippingCustomerName: order.shippingName,
          shippingZip: order.shippingZip,
          shippingPhone: order.customerPhone || '+10000000000',
          products: resolvedItems.map((ri) => ({
            sku: ri.sku,
            vid: ri.vid,
            quantity: ri.item.quantity,
          })),
        });

        if (cjResponse.result && cjResponse.data) {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.DISPATCHED_TO_SUPPLIER,
              supplierType: SupplierType.CJ,
              supplierOrderId: cjResponse.data.orderId,
              supplierOrderNumber: cjResponse.data.orderNum,
              supplierTotalCost: cjResponse.data.orderAmount,
              dispatchedAt: new Date(),
              lastErrorReason: null,
            },
          });
          logger.info({ orderId, cjOrderId: cjResponse.data.orderId }, 'Order successfully dispatched to CJ');
          return updated;
        } else {
          throw new Error(cjResponse.message || 'CJ API returned failure status');
        }
      } else {
        // Zendrop fallback
        const zendropResponse = await zendropClient.createOrder({
          order_id: order.shopifyOrderNumber,
          shipping_address: {
            name: order.shippingName,
            address1: order.shippingAddress1,
            address2: order.shippingAddress2 || undefined,
            city: order.shippingCity,
            province: order.shippingProvince,
            zip: order.shippingZip,
            country: order.shippingCountryCode,
            phone: order.customerPhone || undefined,
          },
          line_items: resolvedItems.map((ri) => ({
            sku: ri.sku,
            quantity: ri.item.quantity,
          })),
        });

        if (zendropResponse.success) {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.DISPATCHED_TO_SUPPLIER,
              supplierType: SupplierType.ZENDROP,
              supplierOrderId: zendropResponse.order_id,
              supplierTotalCost: zendropResponse.total,
              dispatchedAt: new Date(),
              lastErrorReason: null,
            },
          });
          return updated;
        } else {
          throw new Error(zendropResponse.error || 'Zendrop API returned error');
        }
      }
    } catch (error: any) {
      logger.error({ orderId, error: error.message }, 'Failed to dispatch order to supplier');
      const isBillingFailure = error.message.toLowerCase().includes('balance') || error.message.toLowerCase().includes('payment');
      
      const newStatus = isBillingFailure ? OrderStatus.FAILED_BILLING : OrderStatus.MANUAL_REVIEW;

      return await prisma.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          retryCount: { increment: 1 },
          lastErrorReason: error.message,
        },
      });
    }
  }

  /**
   * Manual admin override for orders
   */
  async manualOverride(orderId: string, action: string, targetSupplier?: SupplierType, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    switch (action) {
      case 'RELEASE_NOW':
        return await this.dispatchOrderToSupplier(orderId, targetSupplier);
      case 'CANCEL':
        return await this.handleShopifyOrderCancelled(order.shopifyOrderId, notes);
      case 'RETRY_DISPATCH':
        return await this.dispatchOrderToSupplier(orderId, targetSupplier);
      case 'SET_MANUAL_REVIEW':
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.MANUAL_REVIEW,
            manualReviewNotes: notes || 'Flagged for manual review by admin',
          },
        });
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  /**
   * Get orders list with filters
   */
  async getOrders(params: { status?: OrderStatus; search?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || CONSTANTS.DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { shopifyOrderNumber: { contains: params.search, mode: 'insensitive' } },
        { customerEmail: { contains: params.search, mode: 'insensitive' } },
        { shippingName: { contains: params.search, mode: 'insensitive' } },
        { supplierOrderId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, fulfillments: true },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const orderService = new OrderService();
