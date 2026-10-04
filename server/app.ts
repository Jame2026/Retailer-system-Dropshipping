import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { RequestWithRawBody } from './middleware/verifyShopifyHmac.js';

export function createApp(): Express {
  const app = express();

  // Basic CORS support
  app.use(cors());

  // Capture raw body for Shopify webhook HMAC verification
  app.use(
    express.json({
      verify: (req: RequestWithRawBody, res: Response, buf: Buffer) => {
        if (req.originalUrl.startsWith('/webhooks/shopify')) {
          req.rawBody = buf;
        }
      },
    })
  );

  app.use(express.urlencoded({ extended: true }));

  // Root Routes
  app.use('/', routes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
