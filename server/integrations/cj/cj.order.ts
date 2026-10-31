import { cjClient } from './cj.client.js';
import { CJCreateOrderPayload, CJOrderResponse, CJTrackingInfo } from '../../types/supplier.types.js';
import { logger } from '../../utils/logger.js';

export class CJOrderService {
  async createOrder(payload: CJCreateOrderPayload & { isSandbox?: number }): Promise<CJOrderResponse> {
    try {
      logger.info({ orderNumber: payload.orderNumber }, 'Submitting order to CJ Dropshipping via createOrderV2');
      const orderData = {
        ...payload,
        fromCountryCode: payload.fromCountryCode || 'CN',
        logisticName: payload.logisticName || 'CJPacket Fast US',
        payType: payload.payType !== undefined ? payload.payType : 3,
        isSandbox: payload.isSandbox !== undefined ? payload.isSandbox : 1,
      };

      const response = await cjClient.request<CJOrderResponse>(
        '/shopping/order/createOrderV2',
        'POST',
        orderData
      );
      return response;
    } catch (error: any) {
      logger.error({ error: error.message, orderNumber: payload.orderNumber }, 'Failed to create CJ order');
      throw error;
    }
  }

  async getOrderDetail(orderId: string): Promise<any> {
    try {
      logger.info({ orderId }, 'Fetching live CJ order details via /shopping/order/getOrderDetail');
      const response = await cjClient.request('/shopping/order/getOrderDetail', 'GET', undefined, { orderId });
      return response?.data || null;
    } catch (error: any) {
      logger.error({ orderId, error: error.message }, 'Failed to fetch CJ order details');
      return null;
    }
  }

  async getBalance() {
    try {
      const response = await cjClient.request('/shopping/pay/getBalance', 'GET');
      return response?.data || null;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to fetch CJ wallet balance');
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<any> {
    try {
      logger.info({ orderId }, 'Cancelling order in CJ Dropshipping via DELETE /shopping/order/deleteOrder');
      const response = await cjClient.request('/shopping/order/deleteOrder', 'DELETE', undefined, { orderId });
      return response;
    } catch (error: any) {
      logger.error({ error: error.message, orderId }, 'Failed to cancel CJ order');
      throw error;
    }
  }

  async getTrackingInfo(orderId: string): Promise<CJTrackingInfo | null> {
    try {
      const detail = await this.getOrderDetail(orderId);
      if (detail && detail.trackNumber) {
        return {
          orderId,
          trackingNumber: detail.trackNumber,
          logisticName: detail.logisticName || detail.trackingProvider || 'USPS',
          shippingStatus: detail.orderStatus || 'IN_TRANSIT',
          deliveryDate: detail.outWarehouseTime || undefined,
        };
      }

      const response = await cjClient.request('/logistic/order/queryByOrderNumber', 'GET', undefined, { orderId });
      if (response && response.data && response.data.trackingNumber) {
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
