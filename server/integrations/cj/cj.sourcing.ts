import { cjClient } from './cj.client.js';
import { CJSourcingQueryPayload } from '../../types/supplier.types.js';
import { logger } from '../../utils/logger.js';

export class CJSourcingService {

  async createSourcingQuery(payload: CJSourcingQueryPayload) {
    try {
      logger.info({ productUrl: payload.productUrl }, 'Submitting sourcing request to CJ Dropshipping via /product/sourcing/create');
      const response = await cjClient.request('/product/sourcing/create', 'POST', {
        productUrl: payload.productUrl,
        productName: payload.productName || 'Custom Sourced Product',
        productImage: payload.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        targetPrice: payload.targetPrice,
        estimatedDailyOrders: payload.estimatedDailyOrders || 10,
        remark: payload.notes || 'Sourced via Dropship Manager',
      });
      return response;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to create CJ sourcing query');
      throw error;
    }
  }

  async querySourcingList(sourceIds: string[]) {
    try {
      if (!sourceIds || sourceIds.length === 0) return [];
      const response = await cjClient.request('/product/sourcing/queryList', 'GET', undefined, {
        sourceIds: sourceIds.join(','),
      });
      return response?.data || [];
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Failed to query CJ sourcing list');
      return [];
    }
  }

  async searchProduct(keyword: string, pageNum: number = 1, pageSize: number = 20) {
    try {
      logger.info({ keyword, pageNum, pageSize }, 'Searching products on CJ Dropshipping');
      const response = await cjClient.request('/product/list', 'GET', undefined, {
        productName: keyword,
        pageNum,
        pageSize,
      });

      const rawList = response?.data?.list || response?.data?.content || [];
      const normalizedList = rawList.map((item: any) => {
        let title = item.productNameEn || item.nameEn;
        if (!title && item.productName) {
          if (typeof item.productName === 'string' && item.productName.startsWith('[') && item.productName.endsWith(']')) {
            try {
              const parsed = JSON.parse(item.productName);
              title = parsed[0];
            } catch {
              title = item.productName;
            }
          } else {
            title = item.productName;
          }
        }

        let price = 10.0;
        if (typeof item.sellPrice === 'number') {
          price = item.sellPrice;
        } else if (typeof item.sellPrice === 'string') {
          const m = item.sellPrice.match(/[\d.]+/);
          if (m) price = parseFloat(m[0]);
        }

        return {
          pid: item.pid || item.id || `cj-${item.productSku || item.sku}`,
          sku: item.productSku || item.sku || '',
          productName: title || 'CJ Dropship Product',
          productImage: item.productImage || item.bigImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          sellPrice: price,
          shippingPrice: 3.5,
          origin: 'CJ Dropshipping Warehouse',
          categoryName: item.categoryName || 'General',
        };
      });

      return {
        list: normalizedList,
        total: response?.data?.total || normalizedList.length,
        pageNum: response?.data?.pageNum || pageNum,
        pageSize: response?.data?.pageSize || pageSize,
      };
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
