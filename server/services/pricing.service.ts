import { CONSTANTS } from '../config/constants.js';

export interface PricingCalculationInput {
  baseCost: number;
  shippingCost?: number;
  multiplier?: number;
  buffer?: number;
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
  /**
   * Calculates Selling Price using the formula:
   * Selling Price = ((Base Cost + Shipping Cost) * Multiplier) + Buffer
   */
  calculateSellingPrice(input: PricingCalculationInput): PricingCalculationResult {
    const baseCost = Number(input.baseCost) || 0;
    const shippingCost = Number(input.shippingCost) || 0;
    const multiplier = input.multiplier !== undefined ? Number(input.multiplier) : CONSTANTS.DEFAULT_MARKUP_MULTIPLIER;
    const buffer = input.buffer !== undefined ? Number(input.buffer) : CONSTANTS.DEFAULT_SHIPPING_BUFFER_USD;

    if (baseCost < 0 || shippingCost < 0 || multiplier <= 0 || buffer < 0) {
      throw new Error('Invalid pricing parameters provided');
    }

    const totalCost = baseCost + shippingCost;
    const rawSellingPrice = totalCost * multiplier + buffer;
    
    // Round to 2 decimal places (or standard .99 retail charm pricing if preferred)
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

  /**
   * Round to retail .99 ending
   */
  toCharmPrice(price: number): number {
    return Math.floor(price) + 0.99;
  }
}

export const pricingService = new PricingService();
