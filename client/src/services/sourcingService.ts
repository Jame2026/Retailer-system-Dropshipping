import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';
import { SourcingRequestDTO } from '../types/catalog.types.js';

export const sourcingService = {
  /**
   * Submit 1-click product sourcing request
   */
  async submitSourcingRequest(payload: SourcingRequestDTO) {
    const response = await apiClient.post<ApiResponse>('/api/sourcing/request', payload);
    return response.data;
  },

  /**
   * Search CJ catalog for 1-click importing
   */
  async searchSupplierCatalog(keyword: string, page = 1, pageSize = 20) {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/search', {
      params: { keyword, page, pageSize },
    });
    return response.data.data;
  },

  /**
   * Get supplier product details
   */
  async getProductDetails(pid: string) {
    const response = await apiClient.get<ApiResponse>(`/api/sourcing/product/${pid}`);
    return response.data.data;
  },
};
