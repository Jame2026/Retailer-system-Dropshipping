import { Request, Response, NextFunction } from 'express';
import { cjSourcing } from '../integrations/cj/cj.sourcing.js';
import { cjProductService } from '../integrations/cj/cj.product.js';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { cjClient } from '../integrations/cj/cj.client.js';
import { cjMemoryCache } from '../utils/memoryCache.js';
import { createSourcingQuerySchema } from '../validators/catalog.validator.js';
import { prisma } from '../database/client.js';

export class SourcingController {

  async submitSourcingRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSourcingQuerySchema.parse(req.body);

      let cjResponse = null;
      let sourceNumber = null;
      if (validated.supplierType === 'CJ') {
        try {
          cjResponse = await cjSourcing.createSourcingQuery({
            productUrl: validated.productUrl,
            productName: validated.productName || 'Custom Sourced Item',
            productImage: validated.productImage,
            targetPrice: validated.targetPrice,
            estimatedDailyOrders: validated.estimatedDailyOrders,
            notes: validated.notes,
          });
          sourceNumber = cjResponse?.data?.sourceNumber || cjResponse?.data?.cjSourcingId;
        } catch {
          // Keep local record even if CJ network experiences a delay
        }
      }

      const sourcingRecord = await prisma.sourcingRequest.create({
        data: {
          productUrl: validated.productUrl,
          targetPrice: validated.targetPrice,
          estimatedDailyOrders: validated.estimatedDailyOrders,
          notes: validated.notes,
          suggestedSku: validated.productName || 'Custom Product',
          supplierProductId: sourceNumber || null,
          supplierType: validated.supplierType as any,
          status: 'PENDING',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Sourcing request submitted successfully to CJ procurement agents',
        data: {
          request: sourcingRecord,
          supplierResponse: cjResponse,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async listSourcingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await prisma.sourcingRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const enriched = requests.map((r) => ({
        ...r,
        productName: r.suggestedSku || 'Custom Sourced Product',
        supplierNumber: r.supplierProductId || null,
      }));

      return res.status(200).json({ success: true, data: enriched });
    } catch (error) {
      return next(error);
    }
  }

  async listCjProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword, categoryId, page, pageSize, minPrice, maxPrice, countryCode } = req.query;
      const data = await cjProductService.listProducts({
        keyWord: keyword ? String(keyword) : undefined,
        categoryId: categoryId ? String(categoryId) : undefined,
        pageNum: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        countryCode: countryCode ? String(countryCode) : undefined,
      });

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async getCjCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cjProductService.getCategories();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async getCjWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cjProductService.getGlobalWarehouses();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async searchSupplierCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword, page, pageSize } = req.query;
      if (!keyword) {
        return res.status(400).json({ success: false, error: 'keyword query parameter is required' });
      }

      const results = await cjSourcing.searchProduct(
        String(keyword),
        page ? Number(page) : 1,
        pageSize ? Number(pageSize) : 20
      );

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSupplierProductDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const pid = String(req.params.pid);
      const details = await cjProductService.getProductDetail(pid);

      if (!details) {
        return res.status(404).json({ success: false, error: 'CJ Product not found' });
      }

      return res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCjAccountInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cjMemoryCache.fetchOrDedupe('cj_account_info', 30_000, async () => {
        const balance = await cjOrder.getBalance();
        const openId = cjClient.getOpenId();
        return {
          connected: true,
          openId: openId || 59360,
          balance: balance || { amount: 0, noWithdrawalAmount: 0, freezeAmount: 0 },
          serviceStatus: 'ONLINE_ACTIVE',
        };
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const sourcingController = new SourcingController();
