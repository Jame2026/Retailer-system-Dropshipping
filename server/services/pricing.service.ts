import { CONSTANTS } from '../config/constants.js';
import prisma from '../database/client.js';

export interface PricingCalculationInput {
  baseCost: number;
  shippingCost?: number;
  multiplier?: number;
  buffer?: number;
  charmPricing?: boolean;
}

export interface PricingCalculationResult {
  sellingPrice: number;
  baseCost: number;
  shippingCost: number;
  multiplier: number;
  buffer: number;
  profitMarginUsd: number;
  marginPercent: number;
}

export class PricingService {
  private globalMultiplier: number = CONSTANTS.DEFAULT_MARKUP_MULTIPLIER;
  private globalBuffer: number = CONSTANTS.DEFAULT_SHIPPING_BUFFER_USD;
  private charmPricingEnabled = true;
  private charmCents: number = 0.99;

  setGlobalRules(multiplier: number, buffer: number, charmPricing = true, charmCents = 0.99) {
    if (multiplier > 0) this.globalMultiplier = multiplier;
    if (buffer >= 0) this.globalBuffer = buffer;
    this.charmPricingEnabled = charmPricing;
    if (charmCents >= 0 && charmCents <= 0.99) this.charmCents = charmCents;
  }

  getGlobalRules() {
    return {
      globalMultiplier: this.globalMultiplier,
      shippingBuffer: this.globalBuffer,
      charmPricingEnabled: this.charmPricingEnabled,
      charmCents: this.charmCents,
    };
  }

  async initialize() {
    try {
      const settings = await prisma.appSetting.findMany({
        where: { key: { startsWith: 'pricing.' } },
      });
      for (const s of settings) {
        try {
          const val = JSON.parse(s.value);
          if (s.key === 'pricing.globalMultiplier' && typeof val === 'number') this.globalMultiplier = val;
          if (s.key === 'pricing.shippingBuffer' && typeof val === 'number') this.globalBuffer = val;
          if (s.key === 'pricing.charmPricingEnabled' && typeof val === 'boolean') this.charmPricingEnabled = val;
          if (s.key === 'pricing.charmCents' && typeof val === 'number') this.charmCents = val;
        } catch {}
      }
    } catch {}
  }

  calculateSellingPrice(input: PricingCalculationInput): PricingCalculationResult {
    const baseCost = Number(input.baseCost) || 0;
    const shippingCost = Number(input.shippingCost) || 0;
    const multiplier = input.multiplier !== undefined ? Number(input.multiplier) : this.globalMultiplier;
    const buffer = input.buffer !== undefined ? Number(input.buffer) : this.globalBuffer;

    if (baseCost < 0 || shippingCost < 0 || multiplier <= 0 || buffer < 0) {
      throw new Error('Invalid pricing parameters provided');
    }

    const useCharm = input.charmPricing ?? (input.multiplier === undefined ? this.charmPricingEnabled : false);
    const totalCost = baseCost + shippingCost;
    let rawSellingPrice = totalCost * multiplier + buffer;
    if (useCharm) {
      rawSellingPrice = this.toCharmPrice(rawSellingPrice);
    }

    const sellingPrice = Math.round(rawSellingPrice * 100) / 100;
    const profitMarginUsd = Math.round((sellingPrice - totalCost) * 100) / 100;
    const marginPercent = sellingPrice > 0 ? Math.round((profitMarginUsd / sellingPrice) * 10000) / 100 : 0;

    return {
      sellingPrice,
      baseCost,
      shippingCost,
      multiplier,
      buffer,
      profitMarginUsd,
      marginPercent,
    };
  }

  toCharmPrice(price: number, charmCents = this.charmCents): number {
    return Math.floor(price) + charmCents;
  }

  async applyGlobalPricing(
    multiplier: number,
    buffer: number,
    charmPricing: boolean,
    charmCents = 0.99
  ): Promise<number> {
    this.setGlobalRules(multiplier, buffer, charmPricing, charmCents);
    const mappings = await prisma.skuMapping.findMany();
    let updatedCount = 0;

    for (const m of mappings) {
      const calc = this.calculateSellingPrice({
        baseCost: m.primaryCostPrice,
        shippingCost: m.primaryShippingCost,
        multiplier,
        buffer,
        charmPricing,
      });

      await prisma.skuMapping.update({
        where: { id: m.id },
        data: {
          markupMultiplier: multiplier,
          shippingBufferUsd: buffer,
          calculatedSellingPrice: calc.sellingPrice,
        },
      });

      await prisma.productVariant.updateMany({
        where: { skuMappingId: m.id },
        data: { price: calc.sellingPrice },
      });

      updatedCount++;
    }

    return updatedCount;
  }
}

export const pricingService = new PricingService();

