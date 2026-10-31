import { prisma } from '../database/client.js';
import { OrderStatus, SupplierType } from '@prisma/client';
import { mappingService } from './mapping.service.js';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { cjProductService } from '../integrations/cj/cj.product.js';
import { zendropClient } from '../integrations/zendrop/zendrop.client.js';
import { logger } from '../utils/logger.js';

export class OrderDispatcher {
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

    const resolvedItems: Array<{
      item: (typeof order.items)[0];
      supplier: SupplierType;
      sku: string;
      vid?: string;
    }> = [];

    for (const item of order.items) {
      const resolved = await mappingService.resolveSku(item.storeSku, forceSupplier === SupplierType.ZENDROP);
      if (!resolved) {
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
        for (const ri of resolvedItems) {
          if (!ri.vid) {
            if (ri.item.shopifyVariantId && /^\d{15,}$/.test(ri.item.shopifyVariantId)) {
              ri.vid = ri.item.shopifyVariantId;
            } else {
              try {
                const pidOrSku = ri.sku.replace(/^CJ-/, '');
                const detail = await cjProductService.getProductDetail(pidOrSku);
                if (detail?.variants?.length) {
                  const match = detail.variants.find((v) => v.variantSku === ri.sku || v.variantSku === ri.item.storeSku);
                  ri.vid = match ? match.vid : detail.variants[0].vid;
                }
              } catch {
                // Fallback
              }
            }
          }
        }

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
          email: order.customerEmail || 'customer@example.com',
          fromCountryCode: 'CN',
          logisticName: 'CJPacket Fast US',
          payType: 3,
          isSandbox: 1,
          products: resolvedItems.map((ri) => ({
            vid: ri.vid || ri.sku,
            quantity: ri.item.quantity,
            ...(ri.sku && !ri.vid ? { sku: ri.sku } : {}),
          })),
        });

        if (cjResponse.result && cjResponse.data) {
          const supplierCost = cjResponse.data.orderAmount ||
            ((cjResponse.data.productAmount || 0) + (cjResponse.data.postageAmount || 0)) ||
            null;

          const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.DISPATCHED_TO_SUPPLIER,
              supplierType: SupplierType.CJ,
              supplierOrderId: cjResponse.data.orderId,
              supplierOrderNumber: cjResponse.data.orderNum || cjResponse.data.orderNumber || cjResponse.data.cjOrderCode,
              supplierTotalCost: supplierCost,
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
}

export const orderDispatcher = new OrderDispatcher();
