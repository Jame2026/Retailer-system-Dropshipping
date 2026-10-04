import { prisma } from '../database/client.js';
import { OrderStatus } from '@prisma/client';
import { orderService } from '../services/order.service.js';
import { logger } from '../utils/logger.js';

export async function processHoldBufferQueue() {
  logger.info('Running hold buffer release worker...');

  const now = new Date();

  // Find orders whose hold time has expired and are still in PENDING_HOLD
  const eligibleOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING_HOLD,
      holdExpiresAt: {
        lte: now,
      },
    },
    take: 50,
  });

  if (eligibleOrders.length === 0) {
    logger.debug('No expired hold orders pending release');
    return { released: 0 };
  }

  logger.info({ count: eligibleOrders.length }, `Releasing ${eligibleOrders.length} orders to supplier`);

  let releasedCount = 0;

  for (const order of eligibleOrders) {
    try {
      // 1. Mark as released / processing
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PROCESSING,
          releasedAt: now,
        },
      });

      // 2. Dispatch to supplier
      await orderService.dispatchOrderToSupplier(order.id);
      releasedCount++;
    } catch (error: any) {
      logger.error({ orderId: order.id, error: error.message }, 'Failed releasing buffered order to supplier');
    }
  }

  return { released: releasedCount };
}
