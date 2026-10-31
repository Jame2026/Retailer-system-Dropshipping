import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';
import {
  SourcingRequestDTO,
  CjCategory,
  CjProductDetail,
  CjAccountInfo,
  CjProductListResult,
} from '../types/catalog.types.js';
import { clientApiCache } from './apiCache.js';
import { FALLBACK_CJ_CATEGORIES } from '../config/constants.js';

export const sourcingService = {
  async listCjProducts(
    params?: {
      keyword?: string;
      categoryId?: string;
      page?: number;
      pageSize?: number;
      size?: number;
      minPrice?: number;
      maxPrice?: number;
    },
    forceRefresh = false
  ): Promise<CjProductListResult> {
    const cacheKey = clientApiCache.generateCacheKey('cj_products', params);
    return clientApiCache.dedupeAndCache(
      cacheKey,
      async (signal) => {
        const response = await apiClient.get<ApiResponse<CjProductListResult>>(
          '/api/sourcing/cj/products',
          {
            params,
            signal,
          }
        );
        return (
          response.data.data || {
            items: [],
            total: 0,
            page: params?.page || 1,
            size: params?.pageSize || 16,
            totalPages: 1,
          }
        );
      },
      { ttlMs: 180_000, forceRefresh, group: 'cj_products_list' }
    );
  },

  async getCjCategories(forceRefresh = false): Promise<CjCategory[]> {
    return clientApiCache.dedupeAndCache(
      'cj_categories',
      async (signal) => {
        try {
          const response = await apiClient.get<ApiResponse<CjCategory[]>>(
            '/api/sourcing/cj/categories',
            { signal }
          );
          if (response.data?.data && response.data.data.length > 0) {
            return response.data.data;
          }
        } catch (err) {
          console.warn('CJ categories request unavailable, using standard categories', err);
        }
        return FALLBACK_CJ_CATEGORIES;
      },
      { ttlMs: 600_000, forceRefresh }
    );
  },

  async getCjWarehouses(forceRefresh = false): Promise<any[]> {
    return clientApiCache.dedupeAndCache(
      'cj_warehouses',
      async (signal) => {
        const response = await apiClient.get<ApiResponse<any[]>>('/api/sourcing/cj/warehouses', {
          signal,
        });
        return response.data.data || [];
      },
      { ttlMs: 600_000, forceRefresh }
    );
  },

  async submitSourcingRequest(payload: SourcingRequestDTO) {
    const response = await apiClient.post<ApiResponse>('/api/sourcing/request', payload);
    return response.data;
  },

  async listSourcingRequests(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/api/sourcing/requests');
    return response.data.data || [];
  },

  async searchSupplierCatalog(keyword: string, page = 1, pageSize = 20) {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/search', {
      params: { keyword, page, pageSize },
    });
    return response.data.data;
  },

  async getProductDetails(pid: string, forceRefresh = false): Promise<CjProductDetail | null> {
    const cacheKey = `cj_prod_detail_${pid}`;
    return clientApiCache.dedupeAndCache(
      cacheKey,
      async (signal) => {
        const response = await apiClient.get<ApiResponse<CjProductDetail>>(
          `/api/sourcing/cj/product/${pid}`,
          { signal }
        );
        return response.data.data || null;
      },
      { ttlMs: 600_000, forceRefresh }
    );
  },

  async getCjAccountInfo(forceRefresh = false): Promise<CjAccountInfo | null> {
    return clientApiCache.dedupeAndCache(
      'cj_account_info',
      async (signal) => {
        const response = await apiClient.get<ApiResponse<CjAccountInfo>>(
          '/api/sourcing/cj/account',
          { signal }
        );
        return response.data.data || null;
      },
      { ttlMs: 30_000, forceRefresh }
    );
  },
};
