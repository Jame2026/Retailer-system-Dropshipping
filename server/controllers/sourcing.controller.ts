import { Request, Response, NextFunction } from 'express';
import { cjSourcing } from '../integrations/cj/cj.sourcing.js';
import { cjProductService } from '../integrations/cj/cj.product.js';
import { createSourcingQuerySchema } from '../validators/catalog.validator.js';
import { prisma } from '../database/client.js';

export class SourcingController {
  /**
   * Submit 1-click sourcing request
   */
  async submitSourcingRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSourcingQuerySchema.parse(req.body);

      // 1. Record in DB
      const sourcingRecord = await prisma.sourcingRequest.create({
        data: {
          productUrl: validated.productUrl,
          targetPrice: validated.targetPrice,
          estimatedDailyOrders: validated.estimatedDailyOrders,
          notes: validated.notes,
          supplierType: validated.supplierType as any,
          status: 'PENDING',
        },
      });

      // 2. Dispatch to CJ Sourcing API if CJ
      let cjResponse = null;
      if (validated.supplierType === 'CJ') {
        try {
          cjResponse = await cjSourcing.createSourcingQuery({
            productUrl: validated.productUrl,
            targetPrice: validated.targetPrice,
            estimatedDailyOrders: validated.estimatedDailyOrders,
            notes: validated.notes,
          });
        } catch (err: any) {
          // Logged but do not fail the request
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Sourcing request submitted successfully',
        data: {
          request: sourcingRecord,
          supplierResponse: cjResponse,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List live products from CJ Dropshipping API (/product/listV2)
   */
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
        countryCode: countryCode ? String(countryCode) : 'US',
      });

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get live CJ product categories (/product/getCategory)
   */
  async getCjCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cjProductService.getCategories();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get live CJ global warehouse list (/product/globalWarehouseList)
   */
  async getCjWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cjProductService.getGlobalWarehouses();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search CJ supplier catalog for 1-click product importing
   */
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

  /**
   * Get CJ product details for 1-click import into store (/product/query)
   */
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
}

export const sourcingController = new SourcingController();

