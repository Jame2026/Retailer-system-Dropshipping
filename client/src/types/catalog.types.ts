import { SupplierType } from './order.types.js';

export interface SkuMapping {
  id: string;
  storeSku: string;
  productName: string;
  primarySupplier: SupplierType;
  primarySupplierSku: string;
  primarySupplierPid?: string | null;
  primarySupplierVid?: string | null;
  primaryCostPrice: number;
  primaryShippingCost: number;

  backupSupplier?: SupplierType | null;
  backupSupplierSku?: string | null;
  backupSupplierPid?: string | null;
  backupSupplierVid?: string | null;
  backupCostPrice?: number | null;
  backupShippingCost?: number;

  markupMultiplier: number;
  shippingBufferUsd: number;
  calculatedSellingPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingFormulaInput {
  baseCost: number;
  shippingCost: number;
  multiplier: number;
  buffer: number;
}

export interface PricingFormulaResult {
  sellingPrice: number;
  baseCost: number;
  shippingCost: number;
  multiplier: number;
  buffer: number;
  profitMarginUsd: number;
  marginPercent: number;
}

export interface SourcingRequestDTO {
  productUrl: string;
  targetPrice?: number;
  estimatedDailyOrders?: number;
  notes?: string;
  supplierType?: 'CJ' | 'ZENDROP' | 'CUSTOM';
}
