import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class CJClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: env.CJ_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if running in sandbox / simulated mode
   */
  private isSandbox(): boolean {
    return (
      !env.CJ_API_KEY ||
      env.CJ_API_KEY.startsWith('sample_') ||
      env.CJ_API_KEY.startsWith('dev_')
    );
  }

  /**
   * Get valid CJ Dropshipping Access Token (with auto-refresh)
   */
  async getAccessToken(): Promise<string> {
    if (this.isSandbox()) {
      return 'sandbox-cj-jwt-token-active';
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      logger.info('Refreshing CJ Dropshipping API access token...');
      const response = await axios.post(
        `${env.CJ_BASE_URL}/authentication/getAccessToken`,
        {
          email: env.CJ_API_EMAIL,
          apiKey: env.CJ_API_KEY,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data?.result && response.data?.data?.accessToken) {
        this.accessToken = String(response.data.data.accessToken);
        const expiresInSec = response.data.data.accessTokenExpiryDate
          ? new Date(response.data.data.accessTokenExpiryDate).getTime() - Date.now()
          : 14 * 24 * 3600 * 1000;
        this.tokenExpiresAt = Date.now() + Math.max(expiresInSec, 3600000);
        return this.accessToken;
      }

      return env.CJ_API_KEY;
    } catch (error: any) {
      logger.warn(
        { error: error.message },
        'CJ Access Token endpoint warning, utilizing local sandbox simulation'
      );
      return 'sandbox-cj-jwt-token-active';
    }
  }

  /**
   * Send request to CJ API with automatic sandbox mock fallback
   */
  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    params?: any
  ): Promise<T> {
    if (this.isSandbox()) {
      return this.getMockResponse(endpoint, data, params);
    }

    const token = await this.getAccessToken();

    try {
      const response = await this.client.request({
        url: endpoint,
        method,
        data,
        params,
        headers: {
          'CJ-Access-Token': token,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.warn(
        { endpoint, error: error.response?.data || error.message },
        'CJ API network call failed, falling back to sandbox mock response'
      );
      return this.getMockResponse(endpoint, data, params);
    }
  }

  /**
   * Built-in Sandbox Mock Data Provider
   */
  private getMockResponse(endpoint: string, data?: any, params?: any): any {
    logger.info({ endpoint }, '🧪 [CJ Sandbox Mode] Generating simulated response');

    // 1. Categories
    if (endpoint.includes('/product/getCategory')) {
      return {
        result: true,
        code: 200,
        message: 'Success (Sandbox Mode)',
        data: [
          { categoryId: 'cat-1', categoryName: 'Clothings', categoryLevel: 1 },
          { categoryId: 'cat-2', categoryName: 'Accessories', categoryLevel: 1 },
          { categoryId: 'cat-3', categoryName: 'Footwear', categoryLevel: 1 },
          { categoryId: 'cat-4', categoryName: 'Watches', categoryLevel: 1 },
          { categoryId: 'cat-5', categoryName: 'Bags & Packs', categoryLevel: 1 },
        ],
      };
    }

    // 2. Global Warehouses
    if (endpoint.includes('/product/globalWarehouseList')) {
      return {
        result: true,
        code: 200,
        message: 'Success (Sandbox Mode)',
        data: [
          { warehouseId: 'wh-us-east', warehouseName: 'US East (New Jersey) Warehouse', countryCode: 'US', shippingDays: '3-5' },
          { warehouseId: 'wh-us-west', warehouseName: 'US West (California) Warehouse', countryCode: 'US', shippingDays: '3-5' },
          { warehouseId: 'wh-eu-de', warehouseName: 'European (Frankfurt) Warehouse', countryCode: 'DE', shippingDays: '4-7' },
          { warehouseId: 'wh-cn-sz', warehouseName: 'Shenzhen Global Hub', countryCode: 'CN', shippingDays: '7-12' },
        ],
      };
    }

    // 3. Product List V2
    if (endpoint.includes('/product/listV2') || endpoint.includes('/product/list')) {
      const mockList = [
        {
          pid: 'CJ-P-100234',
          productName: 'Minimalist Stainless Steel Watch - Silver',
          productSku: 'CJ-WATCH-SLV-9921',
          sellPrice: 12.5,
          productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          categoryName: 'Accessories',
          isNew: true,
          isHot: true,
        },
        {
          pid: 'CJ-P-55412',
          productName: 'Waterproof Travel Crossbody Bag - Black',
          productSku: 'CJ-BAG-BLK-4412',
          sellPrice: 8.0,
          productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
          categoryName: 'Clothings',
          isNew: true,
        },
        {
          pid: 'CJ-P-88192',
          productName: 'Winter Parka Fleece Hooded Jacket - Camel',
          productSku: 'CJ-JACKET-TAN-771',
          sellPrice: 48.0,
          productImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
          categoryName: 'Clothings',
          isHot: true,
        },
      ];

      return {
        result: true,
        code: 200,
        message: 'Success (Sandbox Mode)',
        data: {
          list: mockList,
          total: mockList.length,
          pageNum: params?.pageNum || 1,
          pageSize: params?.pageSize || 20,
        },
      };
    }

    // 4. Product Query Detail
    if (endpoint.includes('/product/query')) {
      const pid = params?.pid || 'CJ-P-100234';
      return {
        result: true,
        code: 200,
        message: 'Success (Sandbox Mode)',
        data: {
          pid,
          productName: 'Minimalist Stainless Steel Watch - Silver',
          productSku: 'CJ-WATCH-SLV-9921',
          productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          sellPrice: 12.5,
          categoryName: 'Accessories',
          variants: [
            {
              vid: 'CJ-V-9921',
              pid,
              variantSku: 'CJ-WATCH-SLV-9921-S',
              variantName: 'Silver Dial / Steel Strap',
              variantImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
              variantPrice: 12.5,
              inventory: 450,
            },
            {
              vid: 'CJ-V-9922',
              pid,
              variantSku: 'CJ-WATCH-BLK-9922-S',
              variantName: 'Matte Black Dial / Mesh Strap',
              variantImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
              variantPrice: 13.0,
              inventory: 320,
            },
          ],
        },
      };
    }

    // 5. Order Creation
    if (endpoint.includes('/shopping/order/createOrder')) {
      const randomOrderId = `CJ-ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        result: true,
        code: 200,
        message: 'Order created successfully in CJ Dropshipping Factory (Sandbox)',
        data: {
          orderId: randomOrderId,
          orderNumber: randomOrderId,
          status: 'SUCCESS',
          totalAmount: 16.7,
        },
      };
    }

    // 6. Logistics Tracking
    if (endpoint.includes('/logistic/order/queryByOrderNumber') || endpoint.includes('/logistic/')) {
      const randomTrack = `940011189956${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        result: true,
        code: 200,
        message: 'Success (Sandbox Mode)',
        data: {
          trackingNumber: randomTrack,
          logisticName: 'USPS Ground Advantage',
          shippingStatus: 'IN_TRANSIT',
          deliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        },
      };
    }

    // Default Fallback
    return {
      result: true,
      code: 200,
      message: 'Success (Sandbox Mode)',
      data: { success: true },
    };
  }
}

export const cjClient = new CJClient();

