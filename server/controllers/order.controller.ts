import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { manualOrderOverrideSchema } from '../validators/order.validator.js';
import { prisma } from '../database/client.js';

export class OrderController {
  /**
   * Get paginated orders list with status and search filters
   */
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await orderService.getOrders({
        status: status as any,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get single order inspection details
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              skuMapping: true,
            },
          },
          fulfillments: true,
          billingTransactions: true,
        },
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin manual override (release now, retry dispatch, switch supplier, cancel)
   */
  async manualOverride(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = manualOrderOverrideSchema.parse(req.body);
      const updated = await orderService.manualOverride(
        validated.orderId,
        validated.action,
        validated.targetSupplier as any,
        validated.notes
      );

      return res.status(200).json({
        success: true,
        message: `Action ${validated.action} executed successfully`,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Manually retry dispatch for a failed order
   */
  async retryOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await orderService.dispatchOrderToSupplier(id);

      return res.status(200).json({
        success: true,
        message: 'Order dispatch triggered',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const orderController = new OrderController();
