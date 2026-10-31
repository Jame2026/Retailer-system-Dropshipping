import { z } from 'zod';

export const createSkuMappingSchema = z.object({
  storeSku: z.string().min(1, 'Store SKU is required'),
  productName: z.string().min(1, 'Product name is required'),
  primarySupplier: z.enum(['CJ', 'ZENDROP', 'CUSTOM']).default('CJ'),
  primarySupplierSku: z.string().min(1, 'Primary supplier SKU is required'),
  primarySupplierPid: z.string().optional(),
  primarySupplierVid: z.string().optional(),
  primaryCostPrice: z.number().positive('Primary cost price must be positive'),
  primaryShippingCost: z.number().min(0).default(0.0),

  backupSupplier: z.enum(['CJ', 'ZENDROP', 'CUSTOM']).optional(),
  backupSupplierSku: z.string().optional(),
  backupSupplierPid: z.string().optional(),
  backupSupplierVid: z.string().optional(),
  backupCostPrice: z.number().positive().optional(),
  backupShippingCost: z.number().min(0).optional(),

  markupMultiplier: z.number().positive().default(2.5),
  shippingBufferUsd: z.number().min(0).default(3.0),
  calculatedSellingPrice: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export const updateSkuMappingSchema = createSkuMappingSchema.partial();

export const pricingFormulaSchema = z.object({
  baseCost: z.number().positive(),
  shippingCost: z.number().min(0).default(0),
  multiplier: z.number().positive().default(2.5),
  buffer: z.number().min(0).default(3.0),
  charmPricing: z.boolean().optional(),
});

export const savePricingRulesSchema = z.object({
  globalMultiplier: z.number().positive().default(2.5),
  shippingBuffer: z.number().min(0).default(3.0),
  charmPricingEnabled: z.boolean().default(true),
  charmCents: z.number().min(0).max(0.99).optional().default(0.99),
  minMarginPercent: z.number().min(0).max(100).default(40.0),
  holdDurationMinutes: z.number().int().min(0).max(1440).optional().default(30),
  autoDispatchEnabled: z.boolean().optional().default(true),
  maxAutoFulfillAmount: z.number().min(0).optional().default(300.0),
  lowBalanceThreshold: z.number().min(0).optional().default(100.0),
  currencySymbol: z.string().max(5).optional().default('$'),
  shopifyDomain: z.string().optional(),
  cjApiKey: z.string().optional(),
  cjEmail: z.string().optional(),
  zendropKey: z.string().optional(),
  applyToExistingMappings: z.boolean().optional().default(false),
});

export const createSourcingQuerySchema = z.object({
  productUrl: z.string().url('Must be a valid URL'),
  productName: z.string().optional(),
  productImage: z.string().optional(),
  targetPrice: z.number().positive().optional(),
  estimatedDailyOrders: z.number().int().positive().optional(),
  notes: z.string().optional(),
  supplierType: z.enum(['CJ', 'ZENDROP', 'CUSTOM']).default('CJ'),
});
