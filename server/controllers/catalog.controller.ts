import { Request, Response, NextFunction } from 'express';
import { mappingService } from '../services/mapping.service.js';
import { pricingService } from '../services/pricing.service.js';
import { catalogService } from '../services/catalog.service.js';
import {
  createSkuMappingSchema,
  pricingFormulaSchema,
  savePricingRulesSchema,
} from '../validators/catalog.validator.js';
import { prisma } from '../database/client.js';
import { env } from '../config/env.js';

export class CatalogController {

  async getStorefrontProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        tag,
        search,
        minPrice,
        maxPrice,
        brand,
        sortBy,
        page,
        limit,
      } = req.query;

      const data = await catalogService.getStorefrontProducts({
        category: category ? String(category) : undefined,
        tag: tag ? String(tag) : undefined,
        search: search ? String(search) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        brand: brand ? String(brand) : undefined,
        sortBy: (sortBy as any) || 'featured',
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      });

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async getStorefrontProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const product = await catalogService.getStorefrontProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      return next(error);
    }
  }

  async getStorefrontMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const meta = await catalogService.getStorefrontMeta();
      return res.status(200).json({ success: true, data: meta });
    } catch (error) {
      return next(error);
    }
  }

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

  async getPricingRules(_req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await prisma.appSetting.findMany();
      const m: Record<string, any> = {};
      rows.forEach((s) => { try { m[s.key] = JSON.parse(s.value); } catch { m[s.key] = s.value; } });
      return res.status(200).json({
        success: true,
        data: {
          globalMultiplier: Number(m['pricing.globalMultiplier']) || 2.5,
          shippingBuffer: Number(m['pricing.shippingBuffer']) || 3.0,
          charmPricingEnabled: m['pricing.charmPricingEnabled'] !== undefined ? Boolean(m['pricing.charmPricingEnabled']) : true,
          charmCents: Number(m['pricing.charmCents']) || 0.99,
          minMarginPercent: Number(m['pricing.minMarginPercent']) || 40.0,
          holdDurationMinutes: Number(m['orders.holdDurationMinutes']) || 30,
          autoDispatchEnabled: m['orders.autoDispatchEnabled'] !== undefined ? Boolean(m['orders.autoDispatchEnabled']) : true,
          maxAutoFulfillAmount: Number(m['orders.maxAutoFulfillAmount']) || 300.0,
          lowBalanceThreshold: Number(m['billing.lowBalanceThreshold']) || 100.0,
          currencySymbol: String(m['system.currencySymbol'] || '$'),
          shopifyDomain: String(m['shopify.domain'] || 'your-store.myshopify.com'),
          cjApiKey: String(m['cj.apiKey'] || env.CJ_API_KEY || ''),
          cjEmail: String(m['cj.email'] || env.CJ_API_EMAIL || 'partner@example.com'),
          zendropKey: String(m['zendrop.apiKey'] || env.ZENDROP_API_KEY || ''),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async savePricingRules(req: Request, res: Response, next: NextFunction) {
    try {
      const v = savePricingRulesSchema.parse(req.body);
      const entries: Record<string, any> = {
        'pricing.globalMultiplier': v.globalMultiplier, 'pricing.shippingBuffer': v.shippingBuffer,
        'pricing.charmPricingEnabled': v.charmPricingEnabled, 'pricing.charmCents': v.charmCents ?? 0.99,
        'pricing.minMarginPercent': v.minMarginPercent, 'orders.holdDurationMinutes': v.holdDurationMinutes ?? 30,
        'orders.autoDispatchEnabled': v.autoDispatchEnabled ?? true, 'orders.maxAutoFulfillAmount': v.maxAutoFulfillAmount ?? 300.0,
        'billing.lowBalanceThreshold': v.lowBalanceThreshold ?? 100.0, 'system.currencySymbol': v.currencySymbol ?? '$',
        'shopify.domain': v.shopifyDomain ?? 'your-store.myshopify.com',
        'cj.apiKey': v.cjApiKey, 'cj.email': v.cjEmail, 'zendrop.apiKey': v.zendropKey,
      };
      for (const [key, val] of Object.entries(entries)) {
        if (val !== undefined) await prisma.appSetting.upsert({ where: { key }, update: { value: JSON.stringify(val) }, create: { key, value: JSON.stringify(val) } });
      }
      pricingService.setGlobalRules(v.globalMultiplier, v.shippingBuffer, v.charmPricingEnabled, v.charmCents ?? 0.99);
      let updatedCount = 0;
      if (v.applyToExistingMappings) {
        updatedCount = await pricingService.applyGlobalPricing(v.globalMultiplier, v.shippingBuffer, v.charmPricingEnabled, v.charmCents ?? 0.99);
      }
      return res.status(200).json({
        success: true,
        message: v.applyToExistingMappings ? `Pricing rules saved and applied to ${updatedCount} products.` : 'Settings saved successfully.',
        updatedCount,
        data: v,
      });
    } catch (error) {
      return next(error);
    }
  }

  async calculatePricePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = pricingFormulaSchema.parse(req.body);
      const result = pricingService.calculateSellingPrice({
        baseCost: validated.baseCost,
        shippingCost: validated.shippingCost,
        multiplier: validated.multiplier,
        buffer: validated.buffer,
        charmPricing: validated.charmPricing,
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
