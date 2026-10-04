export interface CJCreateOrderPayload {
  orderNumber: string;
  shippingCountryCode: string;
  shippingCountry: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingCustomerName: string;
  shippingZip: string;
  shippingPhone: string;
  remark?: string;
  products: Array<{
    vid?: string;
    sku?: string;
    quantity: number;
  }>;
}

export interface CJOrderResponse {
  code: number;
  result: boolean;
  message: string;
  data?: {
    orderId: string;
    orderNum: string;
    orderAmount: number;
    orderStatus: string;
  };
}

export interface CJTrackingInfo {
  orderId: string;
  trackingNumber: string;
  logisticName: string;
  shippingStatus: string;
  deliveryDate?: string;
}

export interface CJSourcingQueryPayload {
  productUrl: string;
  targetPrice?: number;
  estimatedDailyOrders?: number;
  notes?: string;
}

export interface ZendropOrderPayload {
  order_id: string;
  shipping_address: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  };
  line_items: Array<{
    variant_id?: string;
    sku?: string;
    quantity: number;
  }>;
}

export interface ZendropOrderResponse {
  success: boolean;
  order_id: string;
  status: string;
  total: number;
  error?: string;
}
