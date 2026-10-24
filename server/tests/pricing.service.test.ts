import { test, describe } from 'node:test';
import assert from 'node:assert';
import { pricingService } from '../services/pricing.service.js';

describe('PricingService Unit Tests', () => {
  test('should calculate selling price with default markup and buffer', () => {

    const result = pricingService.calculateSellingPrice({
      baseCost: 10,
      shippingCost: 5,
      multiplier: 2.5,
      buffer: 3.0,
    });

    assert.strictEqual(result.sellingPrice, 40.5);
    assert.strictEqual(result.profitMarginUsd, 25.5);
    assert.ok(result.marginPercent > 0);
  });

  test('should convert price to .99 charm price correctly', () => {
    const rounded = pricingService.toCharmPrice(44.25);
    assert.strictEqual(rounded, 44.99);
  });

  test('should throw error on negative base cost', () => {
    assert.throws(() => {
      pricingService.calculateSellingPrice({
        baseCost: -5,
        shippingCost: 2,
      });
    }, /Invalid pricing parameters/);
  });
});
