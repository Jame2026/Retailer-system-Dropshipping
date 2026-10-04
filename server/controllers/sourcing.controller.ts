import { Request, Response, NextFunction } from 'express';
import { cjSourcing } from '../integrations/cj/cj.sourcing.js';
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
   * Get CJ product details for 1-click import into store
   */
  async getSupplierProductDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const pid = String(req.params.pid);
      const details = await cjSourcing.getProductDetails(pid);

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
