import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './database/client.js';

const PORT = env.PORT || 4000;

async function connectWithRetry(retries = 5, delayMs = 1500) {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$connect();
      logger.info(' Connected to PostgreSQL database via Prisma');
      return;
    } catch (err: any) {
      if (i === retries) throw err;
      logger.warn(`Waiting for database to be ready (attempt ${i}/${retries})...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function bootstrap() {
  try {
    await connectWithRetry();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Retailer Dropshipping Server running on port ${PORT} [${env.NODE_ENV}]`);
      logger.info(`🌐 Base URL: ${env.APP_URL}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Server shut down cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
