import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { ZendropOrderPayload, ZendropOrderResponse } from '../../types/supplier.types.js';
import { logger } from '../../utils/logger.js';

export class ZendropClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.ZENDROP_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.ZENDROP_API_KEY}`,
      },
    });
  }

  /**
   * Place an order in Zendrop (fallback supplier)
   */
  async createOrder(payload: ZendropOrderPayload): Promise<ZendropOrderResponse> {
    try {
      logger.info({ orderId: payload.order_id }, 'Submitting order to Zendrop backup supplier');
      const response = await this.client.post<ZendropOrderResponse>('/orders', payload);
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error.message }, 'Failed to submit Zendrop order');
      throw error;
    }
  }

  /**
   * Query tracking info from Zendrop
   */
  async getTrackingInfo(zendropOrderId: string) {
    try {
      const response = await this.client.get(`/orders/${zendropOrderId}/tracking`);
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, zendropOrderId }, 'Failed to get Zendrop tracking info');
      return null;
    }
  }
}

export const zendropClient = new ZendropClient();
