export type OrderStatus =
  | 'PENDING_HOLD'
  | 'HOLD_EXPIRED'
  | 'PROCESSING'
  | 'DISPATCHED_TO_SUPPLIER'
  | 'FAILED_BILLING'
  | 'SUPPLIER_PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'MANUAL_REVIEW';

export type SupplierType = 'CJ' | 'ZENDROP' | 'CUSTOM';

export interface OrderItem {
  id: string;
  orderId: string;
  shopifyLineItemId: string;
  shopifyProductId?: string | null;
  shopifyVariantId: string;
  title: string;
  variantTitle?: string | null;
  storeSku: string;
  quantity: number;
  price: number;
  skuMapping?: {
    id: string;
    productName: string;
    primarySupplierSku: string;
    primaryCostPrice: number;
  } | null;
}

export interface Fulfillment {
  id: string;
  orderId: string;
  supplierType: SupplierType;
  trackingNumber: string;
  trackingCompany: string;
  trackingUrl?: string | null;
  status: string;
  syncedToShopify: boolean;
  syncedAt?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  shopifyOrderId: string;
  shopifyOrderNumber: string;
  shopifyCreatedAt: string;
  customerEmail: string;
  customerPhone?: string | null;

  // Address
  shippingName: string;
  shippingAddress1: string;
  shippingAddress2?: string | null;
  shippingCity: string;
  shippingProvince: string;
  shippingProvinceCode?: string | null;
  shippingZip: string;
  shippingCountry: string;
  shippingCountryCode: string;

  // Financials
  currency: string;
  totalPrice: number;
  subtotalPrice: number;
  totalShipping: number;
  totalTax: number;
  financialStatus: string;

  // Timers & Status
  status: OrderStatus;
  holdExpiresAt: string;
  releasedAt?: string | null;
  dispatchedAt?: string | null;
  cancelledAt?: string | null;

  // Supplier info
  supplierType?: SupplierType | null;
  supplierOrderId?: string | null;
  supplierOrderNumber?: string | null;
  supplierTotalCost?: number | null;

  retryCount: number;
  lastErrorReason?: string | null;
  manualReviewNotes?: string | null;

  items?: OrderItem[];
  fulfillments?: Fulfillment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams {
  status?: OrderStatus | '';
  search?: string;
  page?: number;
  limit?: number;
}
