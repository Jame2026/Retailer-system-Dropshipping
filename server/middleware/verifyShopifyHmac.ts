import { Request, Response, NextFunction } from 'express';
import { verifyShopifyWebhookHmac } from '../utils/crypto.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

export function verifyShopifyHmac(req: RequestWithRawBody, res: Response, next: NextFunction) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
  const topic = req.headers['x-shopify-topic'] as string;
  const shopDomain = req.headers['x-shopify-shop-domain'] as string;

  if (!hmacHeader) {
    logger.warn({ topic, shopDomain }, 'Rejecting webhook: Missing x-shopify-hmac-sha256 header');
    return res.status(401).json({ error: 'Unauthorized: Missing HMAC signature' });
  }

  // Get raw body buffer from request
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

  const isValid = verifyShopifyWebhookHmac(rawBody, hmacHeader, env.SHOPIFY_WEBHOOK_SECRET);

  if (!isValid) {
    logger.warn({ topic, shopDomain }, 'Rejecting webhook: Invalid HMAC signature');
    return res.status(401).json({ error: 'Unauthorized: Invalid HMAC signature' });
  }

  return next();
}
