import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { RequestWithRawBody } from './middleware/verifyShopifyHmac.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());

  app.use(
    express.json({
      limit: '1mb',
      verify: (req: RequestWithRawBody, res: Response, buf: Buffer) => {
        if (req.originalUrl.startsWith('/webhooks/shopify') || req.originalUrl.startsWith('/webhooks/cj')) {
          req.rawBody = buf;
        }
      },
    })
  );

  app.use(express.urlencoded({ extended: true }));

  app.use('/', routes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
