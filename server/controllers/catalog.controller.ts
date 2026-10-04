import { Request, Response, NextFunction } from 'express';
import { mappingService } from '../services/mapping.service.js';
import { pricingService } from '../services/pricing.service.js';
import {
  createSkuMappingSchema,
  pricingFormulaSchema,
} from '../validators/catalog.validator.js';
import { prisma } from '../database/client.js';

export class CatalogController {
  /**
   * Get all SKU mappings
   */
  async getMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const data = await mappingService.listMappings(
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Upsert a SKU Mapping
   */
  async saveMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSkuMappingSchema.parse(req.body);
      const mapping = await mappingService.upsertMapping(validated as any);

      return res.status(200).json({
        success: true,
        message: 'SKU mapping saved successfully',
        data: mapping,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete a SKU mapping
   */
  async deleteMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await prisma.skuMapping.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'SKU mapping deleted successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Test / Preview pricing calculation formula
   */
  async calculatePricePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = pricingFormulaSchema.parse(req.body);
      const result = pricingService.calculateSellingPrice({
        baseCost: validated.baseCost,
        shippingCost: validated.shippingCost,
        multiplier: validated.multiplier,
        buffer: validated.buffer,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const catalogController = new CatalogController();
