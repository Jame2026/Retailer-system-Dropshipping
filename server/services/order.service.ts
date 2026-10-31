import { prisma } from '../database/client.js';
import { OrderStatus, SupplierType } from '@prisma/client';
import { CONSTANTS } from '../config/constants.js';
import { ShopifyOrderWebhookPayload } from '../types/order.types.js';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { logger } from '../utils/logger.js';
import { orderDispatcher } from './order.dispatcher.js';
import { ingestShopifyOrder } from './order.ingest.js';

export class OrderService {
  async handleShopifyOrderPaid(payload: ShopifyOrderWebhookPayload) {
    return ingestShopifyOrder(payload);
  }

  async handleShopifyOrderCancelled(shopifyOrderId: string, reason?: string) {
    const order = await prisma.order.findUnique({ where: { shopifyOrderId } });
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
    return prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date(), manualReviewNotes: `Shopify: ${reason || 'Cancelled'}` },
    });
  }

  async dispatchOrderToSupplier(orderId: string, forceSupplier?: SupplierType) {
    return orderDispatcher.dispatchOrderToSupplier(orderId, forceSupplier);
  }

  async manualOverride(orderId: string, action: string, targetSupplier?: SupplierType, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    switch (action) {
      case 'RELEASE_NOW':
      case 'RETRY_DISPATCH':
      case 'SWITCH_SUPPLIER':
        return await this.dispatchOrderToSupplier(orderId, targetSupplier);
      case 'CANCEL':
        return await this.handleShopifyOrderCancelled(order.shopifyOrderId, notes);
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

  async syncCjOrderStatus(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { fulfillments: true, items: { include: { skuMapping: true } } },
    });
    if (!order || !order.supplierOrderId || order.supplierType !== SupplierType.CJ) {
      return order;
    }

    const detail = await cjOrder.getOrderDetail(order.supplierOrderId);
    if (!detail) return order;

    const dataToUpdate: any = {};
    if (detail.trackNumber) {
      dataToUpdate.status = OrderStatus.SHIPPED;
      const existingFulfillment = order.fulfillments.find((f) => f.trackingNumber === detail.trackNumber);
      if (!existingFulfillment) {
        await prisma.fulfillment.create({
          data: {
            orderId: order.id,
            supplierType: SupplierType.CJ,
            trackingNumber: detail.trackNumber,
            trackingCompany: detail.logisticName || 'USPS',
            status: detail.orderStatus || 'IN_TRANSIT',
            syncedToShopify: false,
          },
        });
      }
    } else if (detail.orderStatus === 'IN_PROCESS' || detail.orderStatus === 'PROCESSING') {
      dataToUpdate.status = OrderStatus.SUPPLIER_PROCESSING;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      return await prisma.order.update({
        where: { id: order.id },
        data: dataToUpdate,
        include: { fulfillments: true, items: { include: { skuMapping: true } } },
      });
    }

    return order;
  }

  async updateOrderAddress(orderId: string, address: {
    shippingName: string;
    shippingAddress1: string;
    shippingAddress2?: string | null;
    shippingCity: string;
    shippingProvince: string;
    shippingZip: string;
    customerPhone?: string | null;
  }) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        shippingName: address.shippingName,
        shippingAddress1: address.shippingAddress1,
        shippingAddress2: address.shippingAddress2 || null,
        shippingCity: address.shippingCity,
        shippingProvince: address.shippingProvince,
        shippingZip: address.shippingZip,
        customerPhone: address.customerPhone || null,
      },
    });
  }

  async getOrders(params: { status?: OrderStatus | string; search?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || CONSTANTS.DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      if (params.status === 'PROCESSING' || params.status === 'DISPATCHED_TO_SUPPLIER') {
        where.status = {
          in: [OrderStatus.DISPATCHED_TO_SUPPLIER, OrderStatus.PROCESSING, OrderStatus.SUPPLIER_PROCESSING],
        };
      } else {
        where.status = params.status as OrderStatus;
      }
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { shopifyOrderNumber: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { shippingName: { contains: q, mode: 'insensitive' } },
        { supplierOrderId: { contains: q, mode: 'insensitive' } },
        { items: { some: { OR: [{ storeSku: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }] } } },
      ];
    }

    const [orders, total, allCount, pendingHold, processing, shipped, failedBilling, manualReview, cancelled, revAgg] =
      await Promise.all([
        prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { items: true, fulfillments: true } }),
        prisma.order.count({ where }),
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.PENDING_HOLD } }),
        prisma.order.count({ where: { status: { in: [OrderStatus.DISPATCHED_TO_SUPPLIER, OrderStatus.PROCESSING, OrderStatus.SUPPLIER_PROCESSING] } } }),
        prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
        prisma.order.count({ where: { status: OrderStatus.FAILED_BILLING } }),
        prisma.order.count({ where: { status: OrderStatus.MANUAL_REVIEW } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        prisma.order.aggregate({ _sum: { totalPrice: true } }),
      ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      totalRevenue: Number(revAgg._sum.totalPrice || 0),
      counts: {
        ALL: allCount,
        PENDING_HOLD: pendingHold,
        PROCESSING: processing,
        SHIPPED: shipped,
        FAILED_BILLING: failedBilling,
        MANUAL_REVIEW: manualReview,
        CANCELLED: cancelled,
      },
    };
  }
}

export const orderService = new OrderService();

