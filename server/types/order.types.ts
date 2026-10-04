import { OrderStatus, SupplierType } from '../config/constants.js';
import { FulfillmentStatus } from '@prisma/client';

export interface ShopifyAddress {
  first_name?: string;
  last_name?: string;
  name: string;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  province_code?: string | null;
  zip: string;
  country: string;
  country_code: string;
  phone?: string | null;
}

export interface ShopifyLineItem {
  id: number | string;
  product_id?: number | string | null;
  variant_id: number | string;
  title: string;
  variant_title?: string | null;
  sku: string;
  quantity: number;
  price: string | number;
  grams?: number;
}

export interface ShopifyOrderWebhookPayload {
  id: number | string;
  admin_graphql_api_id?: string;
  name: string;
  order_number: number | string;
  created_at: string;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  email: string;
  phone?: string | null;
  currency: string;
  total_price: string | number;
  subtotal_price: string | number;
  total_shipping_price_set?: {
    shop_money?: {
      amount: string;
      currency_code: string;
    };
  };
  total_tax?: string | number;
  financial_status: string;
  shipping_address?: ShopifyAddress;
  line_items: ShopifyLineItem[];
}

export interface OrderInspectionDTO {
  id: string;
  shopifyOrderId: string;
  shopifyOrderNumber: string;
  customerEmail: string;
  status: string;
  totalPrice: number;
  holdExpiresAt: Date;
  supplierOrderId?: string | null;
  supplierType?: string | null;
  items: Array<{
    title: string;
    storeSku: string;
    quantity: number;
    price: number;
    mappedSupplierSku?: string | null;
  }>;
}

export interface CreateSkuMappingDTO {
  storeSku: string;
  productName: string;
  primarySupplier: 'CJ' | 'ZENDROP' | 'CUSTOM';
  primarySupplierSku: string;
  primarySupplierPid?: string;
  primarySupplierVid?: string;
  primaryCostPrice: number;
  primaryShippingCost?: number;
  backupSupplier?: 'CJ' | 'ZENDROP' | 'CUSTOM';
  backupSupplierSku?: string;
  backupSupplierPid?: string;
  backupSupplierVid?: string;
  backupCostPrice?: number;
  backupShippingCost?: number;
  markupMultiplier?: number;
  shippingBufferUsd?: number;
}
