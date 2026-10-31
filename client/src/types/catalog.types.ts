import { SupplierType } from './order.types.js';

export interface SkuMapping {
  id: string;
  storeSku: string;
  productName: string;
  productImage?: string | null;
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
  charmPricing?: boolean;
}

export interface PricingRulesDTO {
  globalMultiplier: number;
  shippingBuffer: number;
  charmPricingEnabled: boolean;
  charmCents?: number;
  minMarginPercent: number;
  holdDurationMinutes?: number;
  autoDispatchEnabled?: boolean;
  maxAutoFulfillAmount?: number;
  lowBalanceThreshold?: number;
  currencySymbol?: string;
  shopifyDomain?: string;
  cjApiKey?: string;
  cjEmail?: string;
  zendropKey?: string;
  applyToExistingMappings?: boolean;
}

export interface PricingRulesSaveResponse {
  data: PricingRulesDTO;
  updatedCount?: number;
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
  productName?: string;
  productImage?: string;
  targetPrice?: number;
  estimatedDailyOrders?: number;
  notes?: string;
  supplierType?: 'CJ' | 'ZENDROP' | 'CUSTOM';
}

export interface CjCategory {
  categoryId: string;
  categoryName: string;
  categoryNameEn?: string;
  categoryLevel?: number;
  parentId?: string;
}

export interface CjProductListItem {
  id: string;
  pid?: string;
  sku: string;
  title: string;
  productName?: string;
  price: number;
  wholesaleCost: number;
  image: string;
  productImage?: string;
  category?: string;
  tag?: string;
  isTrending?: boolean;
  isPopular?: boolean;
  retailPrice?: number;
  sellPrice?: number;
}

export interface CjProductVariant {
  vid: string;
  pid?: string;
  variantSku: string;
  variantName: string;
  variantImage?: string;
  variantPrice?: number;
  inventory?: number | string;
}

export interface CjProductDetail {
  pid: string;
  productName: string;
  productNameEn?: string;
  productSku: string;
  productImage: string;
  productImageSet?: string[];
  sellPrice: number;
  categoryName?: string;
  productWeight?: number;
  variants: CjProductVariant[];
}

export interface CjAccountInfo {
  connected: boolean;
  openId: number | string | null;
  balance: {
    amount: number;
    noWithdrawalAmount: number;
    freezeAmount: number;
  };
}

export interface CjProductListResult {
  items: CjProductListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
