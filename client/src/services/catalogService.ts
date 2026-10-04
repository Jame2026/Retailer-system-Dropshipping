import apiClient from './api.client.js';
import { ApiResponse, PaginatedData } from '../types/api.types.js';
import { SkuMapping, PricingFormulaInput, PricingFormulaResult } from '../types/catalog.types.js';

export const catalogService = {
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
