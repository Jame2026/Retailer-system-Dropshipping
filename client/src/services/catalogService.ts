import apiClient from './api.client.js';
import { ApiResponse, PaginatedData } from '../types/api.types.js';
import { SkuMapping, PricingFormulaInput, PricingFormulaResult, PricingRulesDTO } from '../types/catalog.types.js';
import { ProductItem } from '../components/storefront/ProductCard.js';
import { clientApiCache } from './apiCache.js';

export interface StorefrontFilterParams {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface StorefrontMeta {
  categories: Array<{ name: string; count: number; id?: string }>;
  brands: Array<{ name: string; count: number }>;
  totalProducts: number;
}

export const catalogService = {
  async getStorefrontProducts(
    params?: StorefrontFilterParams,
    forceRefresh = false
  ): Promise<PaginatedData<ProductItem>> {
    const cacheKey = `sf_products_${JSON.stringify(params || {})}`;
    return clientApiCache.dedupeAndCache(
      cacheKey,
      async (signal) => {
        try {
          const response = await apiClient.get<ApiResponse<PaginatedData<ProductItem>>>(
            '/api/catalog/products',
            { params, signal }
          );
          if (response.data.data?.items) {
            return response.data.data;
          }
          return { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
        } catch (err: any) {
          if (err.name === 'CanceledError' || err.message === 'canceled') {
            throw err;
          }
          console.error('Failed to fetch storefront products from backend', err);
          return { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
        }
      },
      { ttlMs: 180_000, forceRefresh, group: 'storefront_products' }
    );
  },

  async getStorefrontProductById(id: string, forceRefresh = false): Promise<ProductItem | null> {
    const cacheKey = `sf_prod_${id}`;
    return clientApiCache.dedupeAndCache(
      cacheKey,
      async (signal) => {
        try {
          const response = await apiClient.get<ApiResponse<ProductItem>>(
            `/api/catalog/products/${id}`,
            { signal }
          );
          if (response.data.data) {
            return response.data.data;
          }
        } catch (err: any) {
          if (err.name === 'CanceledError' || err.message === 'canceled') throw err;
          console.error(`Failed to fetch product ${id}`, err);
        }
        return null;
      },
      { ttlMs: 600_000, forceRefresh }
    );
  },

  async getStorefrontMeta(forceRefresh = false): Promise<StorefrontMeta> {
    return clientApiCache.dedupeAndCache(
      'sf_meta',
      async (signal) => {
        try {
          const response = await apiClient.get<ApiResponse<StorefrontMeta>>(
            '/api/catalog/categories',
            { signal }
          );
          if (response.data.data) {
            return response.data.data;
          }
        } catch (err: any) {
          if (err.name === 'CanceledError' || err.message === 'canceled') throw err;
          console.error('Failed to fetch catalog categories', err);
        }
        return {
          categories: [{ name: 'All Categories', count: 0 }],
          brands: [{ name: 'All Brands', count: 0 }],
          totalProducts: 0,
        };
      },
      { ttlMs: 600_000, forceRefresh }
    );
  },

  async getMappings(page = 1, limit = 50): Promise<PaginatedData<SkuMapping>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<SkuMapping>>>('/api/catalog/mappings', {
      params: { page, limit },
    });
    return response.data.data || { items: [], total: 0, page: 1, limit: 50, totalPages: 1 };
  },

  async saveMapping(mapping: Partial<SkuMapping>): Promise<SkuMapping> {
    const response = await apiClient.post<ApiResponse<SkuMapping>>('/api/catalog/mappings', mapping);
    clientApiCache.invalidate();
    return response.data.data as SkuMapping;
  },

  async deleteMapping(id: string): Promise<void> {
    await apiClient.delete(`/api/catalog/mappings/${id}`);
    clientApiCache.invalidate();
  },

  async calculatePricePreview(payload: PricingFormulaInput): Promise<PricingFormulaResult> {
    const response = await apiClient.post<ApiResponse<PricingFormulaResult>>('/api/catalog/pricing-preview', payload);
    return response.data.data as PricingFormulaResult;
  },

  async getPricingRules(): Promise<PricingRulesDTO> {
    const response = await apiClient.get<ApiResponse<PricingRulesDTO>>('/api/catalog/pricing-rules');
    return response.data.data || {
      globalMultiplier: 2.5,
      shippingBuffer: 3.0,
      charmPricingEnabled: true,
      charmCents: 0.99,
      minMarginPercent: 40.0,
      holdDurationMinutes: 30,
      autoDispatchEnabled: true,
      maxAutoFulfillAmount: 300.0,
      lowBalanceThreshold: 100.0,
      currencySymbol: '$',
      shopifyDomain: 'your-store.myshopify.com',
    };
  },

  async savePricingRules(rules: PricingRulesDTO): Promise<{ data: PricingRulesDTO; updatedCount?: number }> {
    const response = await apiClient.post<ApiResponse<PricingRulesDTO>>('/api/catalog/pricing-rules', rules);
    clientApiCache.invalidate();
    return {
      data: response.data.data as PricingRulesDTO,
      updatedCount: (response.data as any).updatedCount,
    };
  },
};
