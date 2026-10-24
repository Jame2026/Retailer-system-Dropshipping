import { cjClient } from './cj.client.js';
import { CJCreateOrderPayload, CJOrderResponse, CJTrackingInfo } from '../../types/supplier.types.js';
import { logger } from '../../utils/logger.js';

export class CJOrderService {

  async createOrder(payload: CJCreateOrderPayload): Promise<CJOrderResponse> {
    try {
      logger.info({ orderNumber: payload.orderNumber }, 'Submitting order to CJ Dropshipping');
      const response = await cjClient.request<CJOrderResponse>(
        '/shopping/order/createOrder',
        'POST',
        payload
      );
      return response;
    } catch (error: any) {
      logger.error({ error: error.message, orderNumber: payload.orderNumber }, 'Failed to create CJ order');
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<any> {
    try {
      logger.info({ orderId }, 'Cancelling order in CJ Dropshipping');
      const response = await cjClient.request('/shopping/order/cancelOrder', 'POST', {
        orderId,
      });
      return response;
    } catch (error: any) {
      logger.error({ error: error.message, orderId }, 'Failed to cancel CJ order');
      throw error;
    }
  }

  async getTrackingInfo(orderId: string): Promise<CJTrackingInfo | null> {
    try {
      const response = await cjClient.request('/logistic/order/queryByOrderNumber', 'GET', undefined, {
        orderId,
      });

      if (response && response.data) {
        return {
          orderId,
          trackingNumber: response.data.trackingNumber,
          logisticName: response.data.logisticName || 'USPS',
          shippingStatus: response.data.shippingStatus || 'IN_TRANSIT',
          deliveryDate: response.data.deliveryDate,
        };
      }
      return null;
    } catch (error: any) {
      logger.error({ error: error.message, orderId }, 'Failed to query CJ logistics tracking');
      return null;
    }
  }

  async calculateFreight(params: {
    startCountryCode?: string;
    endCountryCode: string;
    products: Array<{ vid?: string; sku?: string; quantity: number }>;
  }) {
    try {
      const response = await cjClient.request('/logistic/freightCalculate', 'POST', {
        startCountryCode: params.startCountryCode || 'CN',
        endCountryCode: params.endCountryCode || 'US',
        products: params.products,
      });
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to calculate CJ shipping freight');
      throw error;
    }
  }
}

export const cjOrder = new CJOrderService();
