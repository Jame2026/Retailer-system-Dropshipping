import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { logger } from '../utils/logger.js';
import { shopifyOrderWebhookSchema } from '../validators/order.validator.js';
import { prisma } from '../database/client.js';

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
      const event = req.body;
      const sign = req.headers['sign'] as string;
      logger.info({ type: event?.type, messageId: event?.messageId, hasSign: !!sign }, 'Received CJ Dropshipping webhook push');

      // Registration test message verification (must reply 200 within 3 seconds)
      if (event?.messageId === 'wallet-registration-check' || event?.openId && !event?.type) {
        return res.status(200).json({
          code: 200,
          result: true,
          message: 'Webhook registration validated successfully',
        });
      }

      const { type, params } = event || {};

      if (type === 'LOGISTIC' && params) {
        const orderIdOrNum = params.orderId || params.storeOrderNumbers?.[0];
        const trackingNum = params.trackingNumber;
        const logisticName = params.logisticName || 'USPS';

        if (orderIdOrNum && trackingNum) {
          logger.info({ orderIdOrNum, trackingNum, logisticName }, 'CJ LOGISTIC update received, updating order');
          // Try to find matching order in database
          const order = await prisma.order.findFirst({
            where: {
              OR: [
                { supplierOrderId: orderIdOrNum },
                { shopifyOrderNumber: orderIdOrNum },
              ],
            },
            include: { fulfillments: true },
          });

          if (order) {
            await prisma.fulfillment.upsert({
              where: { id: order.fulfillments[0]?.id || 'no-id' },
              create: {
                orderId: order.id,
                supplierType: 'CJ',
                trackingNumber: trackingNum,
                trackingCompany: logisticName,
                trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNum}`,
                status: 'IN_TRANSIT',
              },
              update: {
                trackingNumber: trackingNum,
                trackingCompany: logisticName,
                status: 'IN_TRANSIT',
              },
            });

            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'SHIPPED' },
            });
          }
        }
      } else if (type === 'ORDER' && params) {
        const orderNum = params.orderNumber;
        const cjOrderId = params.cjOrderId;
        const orderStatus = params.orderStatus;
        const trackNumber = params.trackNumber;

        logger.info({ orderNum, cjOrderId, orderStatus, trackNumber }, 'CJ ORDER webhook event processed');
      }

      return res.status(200).json({
        code: 200,
        result: true,
        message: 'ok',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const webhookController = new WebhookController();
