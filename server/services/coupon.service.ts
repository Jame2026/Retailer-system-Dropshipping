import { prisma } from '../database/client.js';

export interface CreateCouponInput {
  [key: string]: any;
}

export interface UpdateCouponInput {
  [key: string]: any;
}

export class CouponService {
  /**
   * Get all coupons
   */
  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const model = (prisma as any).coupon;

    if (!model) {
      throw new Error('Model Coupon is not defined in Prisma schema yet.');
    }

    const [items, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      model.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get single coupon by ID
   */
  async getById(id: string) {
    const model = (prisma as any).coupon;
    return model.findUnique({ where: { id } });
  }

  /**
   * Create new coupon
   */
  async create(data: CreateCouponInput) {
    const model = (prisma as any).coupon;
    return model.create({ data });
  }

  /**
   * Update existing coupon
   */
  async update(id: string, data: UpdateCouponInput) {
    const model = (prisma as any).coupon;
    return model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete coupon
   */
  async delete(id: string) {
    const model = (prisma as any).coupon;
    return model.delete({ where: { id } });
  }
}

export const couponService = new CouponService();
