import './config/env.js';
import cron from 'node-cron';
import { processHoldBufferQueue } from './jobs/holdBuffer.worker.js';
import { runTrackingSyncJob } from './jobs/trackingSync.job.js';
import { runRetryBillingJob } from './jobs/retryBilling.job.js';
import { logger } from './utils/logger.js';
import prisma from './database/client.js';

async function startWorker() {
  logger.info('⚙️ Starting Dropshipping Background Worker Service...');

  // 1. Hold Buffer Release Worker (Runs every 2 minutes)
  cron.schedule('*/2 * * * *', async () => {
    try {
      await processHoldBufferQueue();
    } catch (err: any) {
      logger.error({ error: err.message }, 'Cron error in holdBuffer.worker');
    }
  });
  logger.info('⏰ Scheduled holdBuffer.worker (every 2 mins)');

  // 2. Tracking Sync Job (Runs every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    try {
      await runTrackingSyncJob();
    } catch (err: any) {
      logger.error({ error: err.message }, 'Cron error in trackingSync.job');
    }
  });
  logger.info('⏰ Scheduled trackingSync.job (every 15 mins)');

  // 3. Retry Billing Job (Runs every hour)
  cron.schedule('0 * * * *', async () => {
    try {
      await runRetryBillingJob();
    } catch (err: any) {
      logger.error({ error: err.message }, 'Cron error in retryBilling.job');
    }
  });
  logger.info('⏰ Scheduled retryBilling.job (every hour)');

  // Keep process alive
  const shutdown = async () => {
    logger.info('Shutting down background workers...');
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startWorker().catch((error) => {
  logger.error({ error: error.message }, 'Failed to start background worker');
  process.exit(1);
});
