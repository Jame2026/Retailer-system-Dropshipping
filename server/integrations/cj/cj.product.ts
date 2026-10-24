import { cjClient } from './cj.client.js';
import { logger } from '../../utils/logger.js';
import { pricingService } from '../../services/pricing.service.js';

export interface CJCategoryItem {
  categoryId: string;
  categoryName: string;
  categoryNameEn?: string;
  categoryLevel: number;
  parentId?: string;
  categoryImage?: string;
  children?: CJCategoryItem[];
}

export interface CJProductListParams {
  keyWord?: string;
  categoryId?: string;
  pageNum?: number;
  pageSize?: number;
  countryCode?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CJProductVariant {
  vid: string;
  pid: string;
  variantSku: string;
  variantName: string;
  variantImage: string;
  variantPrice: number;
  variantStandard?: string;
  variantWeight?: number;
  inventory?: number;
}

export interface CJProductDetail {
  pid: string;
  productName: string;
  productNameEn?: string;
  productSku: string;
  productImage: string;
  productImageSet?: string[];
  productType?: string;
  productWeight?: number;
  productUnit?: string;
  categoryId?: string;
  categoryName?: string;
  sellPrice: number;
  description?: string;
  variants: CJProductVariant[];
}

export class CJProductService {

  async getCategories(): Promise<CJCategoryItem[]> {
    try {
      logger.info('Fetching live product categories from CJ Dropshipping API...');
      const response = await cjClient.request('/product/getCategory', 'GET');
      if (response?.result && response?.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to fetch CJ categories');
      return [];
    }
  }

  async listProducts(params: CJProductListParams = {}) {
    try {
      logger.info({ params }, 'Fetching products from CJ Dropshipping /product/listV2');
      const response = await cjClient.request('/product/listV2', 'GET', undefined, {
        keyWord: params.keyWord,
        categoryId: params.categoryId,
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
        countryCode: params.countryCode || 'US',
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      });

      if (response?.result && response?.data?.list) {

        const transformedItems = response.data.list.map((item: any) => {
          const wholesaleCost = Number(item.sellPrice || item.price || 10);
          const pricing = pricingService.calculateSellingPrice({
            baseCost: wholesaleCost,
            shippingCost: 3.5,
          });

          return {
            id: item.pid || `cj-${item.productSku}`,
            sku: item.productSku || item.sku,
            title: item.productNameEn || item.productName || 'Dropship Product',
            price: pricing.sellingPrice,
            originalPrice: Math.round(pricing.sellingPrice * 1.6 * 100) / 100,
            image: item.productImage || item.bigImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
            tag: item.isNew ? 'NEW' : item.isHot ? 'HOT' : undefined,
            category: item.categoryName || 'General',
            brand: 'CJ Factory Wholesale',
            rating: 4.8,
            supplierPid: item.pid,
            wholesaleCost,
          };
        });

        return {
          items: transformedItems,
          total: response.data.total || transformedItems.length,
          page: response.data.pageNum || params.pageNum || 1,
          limit: response.data.pageSize || params.pageSize || 20,
        };
      }

      return { items: [], total: 0, page: 1, limit: 20 };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to fetch CJ product list');
      return { items: [], total: 0, page: 1, limit: 20 };
    }
  }

  async getGlobalWarehouses() {
    try {
      logger.info('Fetching global warehouse list from CJ...');
      const response = await cjClient.request('/product/globalWarehouseList', 'GET');
      return response?.data || [];
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to fetch CJ global warehouses');
      return [];
    }
  }

  async getProductDetail(pid: string): Promise<CJProductDetail | null> {
    try {
      logger.info({ pid }, 'Querying product detail from CJ /product/query');
      const response = await cjClient.request('/product/query', 'GET', undefined, {
        pid,
      });

      if (response?.result && response?.data) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      logger.error({ pid, error: error.message }, 'Failed to query CJ product detail');
      return null;
    }
  }
}

export const cjProductService = new CJProductService();
