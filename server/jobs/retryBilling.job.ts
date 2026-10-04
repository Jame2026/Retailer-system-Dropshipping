import { prisma } from '../database/client.js';
import { OrderStatus } from '@prisma/client';
import { orderService } from '../services/order.service.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export async function runRetryBillingJob() {
  logger.info('Executing failed billing retry job...');

  const failedOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.FAILED_BILLING,
      retryCount: {
        lt: CONSTANTS.MAX_RETRY_ATTEMPTS,
      },
    },
    take: 20,
  });

  if (failedOrders.length === 0) {
    logger.debug('No orders currently stuck in FAILED_BILLING');
    return { retried: 0 };
  }

  logger.info({ count: failedOrders.length }, `Attempting retry for ${failedOrders.length} failed billing orders`);

  let retrySuccessCount = 0;

  for (const order of failedOrders) {
    try {
      const updated = await orderService.dispatchOrderToSupplier(order.id);
      if (updated.status === OrderStatus.DISPATCHED_TO_SUPPLIER) {
        retrySuccessCount++;
      }
    } catch (error: any) {
      logger.error({ orderId: order.id, error: error.message }, 'Retry billing attempt failed');
    }
  }

  return { attempted: failedOrders.length, success: retrySuccessCount };
}
