import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';

export class ReviewController {

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await reviewService.getAll(page, limit);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await reviewService.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.create(req.body);
      return res.status(201).json({ success: true, message: 'Review created successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await reviewService.update(id, req.body);
      return res.status(200).json({ success: true, message: 'Review updated successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await reviewService.delete(id);
      return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

export const reviewController = new ReviewController();
