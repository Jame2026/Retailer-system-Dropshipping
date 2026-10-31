import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { manualOrderOverrideSchema, updateOrderAddressSchema } from '../validators/order.validator.js';
import { prisma } from '../database/client.js';

export class OrderController {
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

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      let order = await prisma.order.findUnique({
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

      if (order.supplierOrderId && order.supplierType === 'CJ' && order.status !== 'DELIVERED') {
        try {
          const synced = await orderService.syncCjOrderStatus(order.id);
          if (synced) {
            order = {
              ...order,
              ...synced,
              items: (synced as any).items || (order as any).items || [],
            };
          }
        } catch {
          // Keep current order state
        }
      }

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const rawItems = (order as any).items || [];
      const enrichedItems = rawItems.map((item: any) => {
        let imageUrl = item.imageUrl || item.skuMapping?.productImage;
        if (!imageUrl) {
          const t = (item.title || '').toLowerCase();
          if (t.includes('lamp') || t.includes('charger') || t.includes('speaker')) {
            imageUrl = 'https://cf.cjdropshipping.com/667bbd9d-e23d-453c-8f31-bd355107f90f.jpg';
          } else if (t.includes('pant') || t.includes('dress') || t.includes('cloth')) {
            imageUrl = 'https://cf.cjdropshipping.com/saleyee-import/4e022bc55ce0462b8086380cc4b06aa9.jpg';
          } else {
            imageUrl = 'https://cf.cjdropshipping.com/667bbd9d-e23d-453c-8f31-bd355107f90f.jpg';
          }
        }
        return { ...item, imageUrl };
      });

      return res.status(200).json({
        success: true,
        data: { ...order, items: enrichedItems },
      });
    } catch (error) {
      return next(error);
    }
  }

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

  async syncCjStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await orderService.syncCjOrderStatus(id);

      return res.status(200).json({
        success: true,
        message: 'CJ Order status synchronized',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validated = updateOrderAddressSchema.parse(req.body);
      const updated = await orderService.updateOrderAddress(id, validated);
      return res.status(200).json({ success: true, message: 'Address updated', data: updated });
    } catch (error) {
      return next(error);
    }
  }

  async simulateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const order = await orderService.handleShopifyOrderPaid(payload);

      return res.status(201).json({
        success: true,
        message: 'Simulated order created successfully',
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const orderController = new OrderController();
