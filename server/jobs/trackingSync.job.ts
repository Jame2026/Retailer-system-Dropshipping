import { fulfillmentService } from '../services/fulfillment.service.js';
import { logger } from '../utils/logger.js';

export async function runTrackingSyncJob() {
  logger.info('Executing tracking sync cron job...');
  try {
    const result = await fulfillmentService.syncPendingFulfillments();
    logger.info(result, 'Tracking sync job cycle finished');
    return result;
  } catch (error: any) {
    logger.error({ error: error.message }, 'Tracking sync job failed');
    throw error;
  }
}
