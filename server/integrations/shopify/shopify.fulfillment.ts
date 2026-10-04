import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { shopifyClient } from './shopify.client.js';

export interface ShopifyFulfillmentPayload {
  trackingNumber: string;
  trackingCompany?: string;
  trackingUrl?: string;
  notifyCustomer?: boolean;
}

export class ShopifyFulfillmentService {
  /**
   * Create a fulfillment in Shopify using Fulfillment Orders API
   */
  async createFulfillment(shopifyOrderId: string, payload: ShopifyFulfillmentPayload) {
    try {
      // Clean order ID if it is a GraphQL GID
      const numericOrderId = shopifyOrderId.replace(/\D/g, '');

      // 1. Fetch fulfillment orders
      const fulfillmentOrders = await shopifyClient.getFulfillmentOrders(numericOrderId);

      if (!fulfillmentOrders || fulfillmentOrders.length === 0) {
        throw new Error(`No open fulfillment orders found for Shopify order ${shopifyOrderId}`);
      }

      const openFulfillmentOrder = fulfillmentOrders.find((fo: any) => fo.status === 'open') || fulfillmentOrders[0];

      // 2. Submit fulfillment request
      const response = await axios.post(
        `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION}/fulfillments.json`,
        {
          fulfillment: {
            line_items_by_fulfillment_order: [
              {
                fulfillment_order_id: openFulfillmentOrder.id,
              },
            ],
            tracking_info: {
              number: payload.trackingNumber,
              company: payload.trackingCompany || 'USPS',
              url: payload.trackingUrl || `https://tools.usps.com/go/TrackConfirmAction?tLabels=${payload.trackingNumber}`,
            },
            notify_customer: payload.notifyCustomer ?? true,
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(
        {
          shopifyOrderId,
          fulfillmentId: response.data.fulfillment?.id,
          trackingNumber: payload.trackingNumber,
        },
        'Successfully created Shopify fulfillment'
      );

      return response.data.fulfillment;
    } catch (error: any) {
      logger.error(
        {
          error: error.response?.data || error.message,
          shopifyOrderId,
        },
        'Failed to create Shopify fulfillment'
      );
      throw error;
    }
  }
}

export const shopifyFulfillment = new ShopifyFulfillmentService();
