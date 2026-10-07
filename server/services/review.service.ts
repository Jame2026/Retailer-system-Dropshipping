import { prisma } from '../database/client.js';

export interface CreateReviewInput {
  [key: string]: any;
}

export interface UpdateReviewInput {
  [key: string]: any;
}

export class ReviewService {
  /**
   * Get all reviews
   */
  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const model = (prisma as any).review;

    if (!model) {
      throw new Error('Model Review is not defined in Prisma schema yet.');
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
   * Get single review by ID
   */
  async getById(id: string) {
    const model = (prisma as any).review;
    return model.findUnique({ where: { id } });
  }

  /**
   * Create new review
   */
  async create(data: CreateReviewInput) {
    const model = (prisma as any).review;
    return model.create({ data });
  }

  /**
   * Update existing review
   */
  async update(id: string, data: UpdateReviewInput) {
    const model = (prisma as any).review;
    return model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete review
   */
  async delete(id: string) {
    const model = (prisma as any).review;
    return model.delete({ where: { id } });
  }
}

export const reviewService = new ReviewService();
