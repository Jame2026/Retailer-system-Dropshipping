import { prisma } from '../database/client.js';
import { FulfillmentStatus, OrderStatus, SupplierType } from '@prisma/client';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { zendropClient } from '../integrations/zendrop/zendrop.client.js';
import { shopifyFulfillment } from '../integrations/shopify/shopify.fulfillment.js';
import { logger } from '../utils/logger.js';

export class FulfillmentService {
  /**
   * Sync tracking for orders dispatched to suppliers
   */
  async syncPendingFulfillments() {
    logger.info('Running supplier tracking sync cycle...');

    const dispatchedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.DISPATCHED_TO_SUPPLIER, OrderStatus.SUPPLIER_PROCESSING],
        },
        supplierOrderId: { not: null },
      },
      include: { fulfillments: true },
    });

    let syncCount = 0;

    for (const order of dispatchedOrders) {
      if (!order.supplierOrderId) continue;

      try {
        let trackingInfo = null;

        if (order.supplierType === SupplierType.CJ) {
          trackingInfo = await cjOrder.getTrackingInfo(order.supplierOrderId);
        } else if (order.supplierType === SupplierType.ZENDROP) {
          trackingInfo = await zendropClient.getTrackingInfo(order.supplierOrderId);
        }

        if (trackingInfo && trackingInfo.trackingNumber) {
          // 1. Create or update fulfillment record
          const fulfillment = await prisma.fulfillment.upsert({
            where: {
              id: order.fulfillments[0]?.id || 'non-existing-id',
            },
            create: {
              orderId: order.id,
              supplierType: order.supplierType || SupplierType.CJ,
              trackingNumber: trackingInfo.trackingNumber,
              trackingCompany: trackingInfo.logisticName || 'USPS',
              trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingInfo.trackingNumber}`,
              status: FulfillmentStatus.IN_TRANSIT,
            },
            update: {
              trackingNumber: trackingInfo.trackingNumber,
              trackingCompany: trackingInfo.logisticName || 'USPS',
              status: FulfillmentStatus.IN_TRANSIT,
            },
          });

          // 2. Push to Shopify if not yet synced
          if (!fulfillment.syncedToShopify) {
            await shopifyFulfillment.createFulfillment(order.shopifyOrderId, {
              trackingNumber: trackingInfo.trackingNumber,
              trackingCompany: trackingInfo.logisticName || 'USPS',
              trackingUrl: fulfillment.trackingUrl || undefined,
              notifyCustomer: true,
            });

            await prisma.fulfillment.update({
              where: { id: fulfillment.id },
              data: {
                syncedToShopify: true,
                syncedAt: new Date(),
              },
            });
          }

          // 3. Mark order as SHIPPED
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.SHIPPED,
            },
          });

          syncCount++;
          logger.info(
            { orderId: order.id, trackingNumber: trackingInfo.trackingNumber },
            'Synced tracking number to Shopify and marked order as SHIPPED'
          );
        }
      } catch (error: any) {
        logger.error(
          { orderId: order.id, error: error.message },
          'Error syncing tracking for order'
        );
      }
    }

    return { processed: dispatchedOrders.length, synced: syncCount };
  }
}

export const fulfillmentService = new FulfillmentService();
