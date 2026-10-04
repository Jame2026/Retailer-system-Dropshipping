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
  isActive: z.boolean().default(true),
});

export const updateSkuMappingSchema = createSkuMappingSchema.partial();

export const pricingFormulaSchema = z.object({
  baseCost: z.number().positive(),
  shippingCost: z.number().min(0).default(0),
  multiplier: z.number().positive().default(2.5),
  buffer: z.number().min(0).default(3.0),
});

export const createSourcingQuerySchema = z.object({
  productUrl: z.string().url('Must be a valid URL'),
  targetPrice: z.number().positive().optional(),
  estimatedDailyOrders: z.number().int().positive().optional(),
  notes: z.string().optional(),
  supplierType: z.enum(['CJ', 'ZENDROP', 'CUSTOM']).default('CJ'),
});
