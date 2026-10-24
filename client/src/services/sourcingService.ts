import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';
import { SourcingRequestDTO } from '../types/catalog.types.js';

export const sourcingService = {

  async listCjProducts(params?: {
    keyword?: string;
    categoryId?: string;
    page?: number;
    pageSize?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/cj/products', {
      params,
    });
    return response.data.data;
  },

  async getCjCategories() {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/cj/categories');
    return response.data.data || [];
  },

  async getCjWarehouses() {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/cj/warehouses');
    return response.data.data || [];
  },

  async submitSourcingRequest(payload: SourcingRequestDTO) {
    const response = await apiClient.post<ApiResponse>('/api/sourcing/request', payload);
    return response.data;
  },

  async searchSupplierCatalog(keyword: string, page = 1, pageSize = 20) {
    const response = await apiClient.get<ApiResponse>('/api/sourcing/search', {
      params: { keyword, page, pageSize },
    });
    return response.data.data;
  },

  async getProductDetails(pid: string) {
    const response = await apiClient.get<ApiResponse>(`/api/sourcing/cj/product/${pid}`);
    return response.data.data;
  },
};
