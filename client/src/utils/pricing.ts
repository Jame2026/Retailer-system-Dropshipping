import {
  DEFAULT_MARKUP_MULTIPLIER,
  DEFAULT_SHIPPING_BUFFER_USD,
} from '../config/constants.js';

/**
 * Calculates suggested retail price from wholesale factory cost.
 * Formula: wholesaleCost * multiplier + buffer
 */
export function calculateRetailPrice(
  wholesaleCost: number | string | undefined | null,
  multiplier = DEFAULT_MARKUP_MULTIPLIER,
  buffer = DEFAULT_SHIPPING_BUFFER_USD
): number {
  const cost = Number(wholesaleCost) || 0;
  const retail = cost * multiplier + buffer;
  return Math.round(retail * 100) / 100;
}
