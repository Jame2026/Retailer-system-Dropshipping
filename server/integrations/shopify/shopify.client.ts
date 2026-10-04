import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class ShopifyClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION}`,
      headers: {
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Fetch order by Shopify Order ID
   */
  async getOrder(orderId: string | number) {
    try {
      const response = await this.client.get(`/orders/${orderId}.json`);
      return response.data.order;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error.message, orderId }, 'Failed to fetch Shopify order');
      throw error;
    }
  }

  /**
   * Cancel an order in Shopify
   */
  async cancelOrder(orderId: string | number, reason: string = 'customer') {
    try {
      const response = await this.client.post(`/orders/${orderId}/cancel.json`, {
        reason,
        email: true,
      });
      return response.data.order;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error.message, orderId }, 'Failed to cancel Shopify order');
      throw error;
    }
  }

  /**
   * Get Fulfillment Orders for a Shopify order
   */
  async getFulfillmentOrders(orderId: string | number) {
    try {
      const response = await this.client.get(`/orders/${orderId}/fulfillment_orders.json`);
      return response.data.fulfillment_orders;
    } catch (error: any) {
      logger.error(
        { error: error.response?.data || error.message, orderId },
        'Failed to get Shopify fulfillment orders'
      );
      throw error;
    }
  }

  /**
   * GraphQL execution helper for advanced Shopify queries
   */
  async graphql(query: string, variables: Record<string, any> = {}) {
    try {
      const response = await this.client.post('/graphql.json', {
        query,
        variables,
      });
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.response?.data || error.message }, 'Shopify GraphQL query failed');
      throw error;
    }
  }
}

export const shopifyClient = new ShopifyClient();
