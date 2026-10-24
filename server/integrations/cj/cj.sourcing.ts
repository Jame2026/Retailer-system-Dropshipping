import { cjClient } from './cj.client.js';
import { CJSourcingQueryPayload } from '../../types/supplier.types.js';
import { logger } from '../../utils/logger.js';

export class CJSourcingService {

  async createSourcingQuery(payload: CJSourcingQueryPayload) {
    try {
      logger.info({ productUrl: payload.productUrl }, 'Submitting sourcing request to CJ Dropshipping');
      const response = await cjClient.request('/sourcing/createSourcing', 'POST', {
        productUrl: payload.productUrl,
        targetPrice: payload.targetPrice,
        estimatedDailyOrders: payload.estimatedDailyOrders,
        remark: payload.notes,
      });
      return response;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to create CJ sourcing query');
      throw error;
    }
  }

  async searchProduct(keyword: string, pageNum: number = 1, pageSize: number = 20) {
    try {
      const response = await cjClient.request('/product/list', 'GET', undefined, {
        productName: keyword,
        pageNum,
        pageSize,
      });
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, keyword }, 'Failed to search CJ products');
      throw error;
    }
  }

  async getProductDetails(pid: string) {
    try {
      const response = await cjClient.request('/product/query', 'GET', undefined, {
        pid,
      });
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, pid }, 'Failed to get CJ product details');
      throw error;
    }
  }
}

export const cjSourcing = new CJSourcingService();
