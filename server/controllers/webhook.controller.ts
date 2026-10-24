import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { logger } from '../utils/logger.js';
import { shopifyOrderWebhookSchema } from '../validators/order.validator.js';

export class WebhookController {

  async handleShopifyOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const topic = req.headers['x-shopify-topic'] as string;
      logger.info({ topic }, 'Received Shopify Webhook event');

      const validatedPayload = shopifyOrderWebhookSchema.parse(req.body);
      const order = await orderService.handleShopifyOrderPaid(validatedPayload as any);

      return res.status(200).json({
        success: true,
        message: 'Order webhook processed successfully',
        orderId: order.id,
      });
    } catch (error) {
      return next(error);
    }
  }

  async handleShopifyCancelled(req: Request, res: Response, next: NextFunction) {
    try {
      const shopifyOrderId = String(req.body.admin_graphql_api_id || req.body.id);
      const cancelReason = req.body.cancel_reason;

      logger.info({ shopifyOrderId, cancelReason }, 'Received Shopify order cancellation event');

      const cancelled = await orderService.handleShopifyOrderCancelled(shopifyOrderId, cancelReason);

      return res.status(200).json({
        success: true,
        message: 'Cancellation processed',
        order: cancelled,
      });
    } catch (error) {
      return next(error);
    }
  }

  async handleSupplierWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const supplierEvent = req.body;
      logger.info({ supplierEvent }, 'Received supplier package status webhook');

      return res.status(200).json({
        code: 200,
        result: true,
        message: 'Supplier webhook received',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const webhookController = new WebhookController();
