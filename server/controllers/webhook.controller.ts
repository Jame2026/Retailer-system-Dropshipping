import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../database/client.js';

export class WebhookController {

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
                { orderNumber: orderIdOrNum },
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
