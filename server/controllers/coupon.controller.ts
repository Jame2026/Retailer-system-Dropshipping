import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service.js';

export class CouponController {
  /**
   * GET /api/coupons
   */
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await couponService.getAll(page, limit);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/coupons/:id
   */
  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await couponService.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Coupon not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/coupons
   */
  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await couponService.create(req.body);
      return res.status(201).json({ success: true, message: 'Coupon created successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/coupons/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await couponService.update(id, req.body);
      return res.status(200).json({ success: true, message: 'Coupon updated successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/coupons/:id
   */
  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await couponService.delete(id);
      return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

export const couponController = new CouponController();
