import apiClient from './api.client.js';
import { ApiResponse, PaginatedData } from '../types/api.types.js';
import { SkuMapping, PricingFormulaInput, PricingFormulaResult } from '../types/catalog.types.js';
import { ProductItem } from '../components/storefront/ProductCard.js';

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
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  totalProducts: number;
}

export const catalogService = {
  /**
   * Get dynamic products for storefront from backend API
   */
  async getStorefrontProducts(
    params?: StorefrontFilterParams
  ): Promise<PaginatedData<ProductItem>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<ProductItem>>>(
      '/api/catalog/products',
      { params }
    );
    return response.data.data || { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
  },

  /**
   * Get single product details
   */
  async getStorefrontProductById(id: string): Promise<ProductItem | null> {
    const response = await apiClient.get<ApiResponse<ProductItem>>(
      `/api/catalog/products/${id}`
    );
    return response.data.data || null;
  },

  /**
   * Get dynamic category and brand metadata
   */
  async getStorefrontMeta(): Promise<StorefrontMeta> {
    const response = await apiClient.get<ApiResponse<StorefrontMeta>>(
      '/api/catalog/categories'
    );
    return (
      response.data.data || {
        categories: [],
        brands: [],
        totalProducts: 0,
      }
    );
  },

  /**
   * Get list of SKU mappings
   */
  async getMappings(page = 1, limit = 50): Promise<PaginatedData<SkuMapping>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<SkuMapping>>>('/api/catalog/mappings', {
      params: { page, limit },
    });
    return response.data.data || { items: [], total: 0, page: 1, limit: 50, totalPages: 1 };
  },

  /**
   * Upsert SKU mapping
   */
  async saveMapping(mapping: Partial<SkuMapping>): Promise<SkuMapping> {
    const response = await apiClient.post<ApiResponse<SkuMapping>>('/api/catalog/mappings', mapping);
    return response.data.data as SkuMapping;
  },

  /**
   * Delete SKU mapping
   */
  async deleteMapping(id: string): Promise<void> {
    await apiClient.delete(`/api/catalog/mappings/${id}`);
  },

  /**
   * Calculate real-time pricing preview
   */
  async calculatePricePreview(payload: PricingFormulaInput): Promise<PricingFormulaResult> {
    const response = await apiClient.post<ApiResponse<PricingFormulaResult>>('/api/catalog/pricing-preview', payload);
    return response.data.data as PricingFormulaResult;
  },
};

