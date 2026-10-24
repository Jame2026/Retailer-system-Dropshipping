import apiClient from './api.client.js';
import { ApiResponse, PaginatedData } from '../types/api.types.js';
import { Order, OrderFilterParams, OrderStatus, SupplierType } from '../types/order.types.js';

export const orderService = {

  async getOrders(params: OrderFilterParams = {}): Promise<PaginatedData<Order>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<Order>>>('/api/orders', {
      params,
    });
    return response.data.data || { orders: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`);
    if (!response.data.data) throw new Error('Order not found');
    return response.data.data;
  },

  async manualOverride(payload: {
    orderId: string;
    action: 'RELEASE_NOW' | 'CANCEL' | 'RETRY_DISPATCH' | 'SWITCH_SUPPLIER' | 'SET_MANUAL_REVIEW';
    targetSupplier?: SupplierType;
    notes?: string;
  }): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/api/orders/override', payload);
    return response.data.data as Order;
  },

  async retryOrder(id: string): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>(`/api/orders/${id}/retry`);
    return response.data.data as Order;
  },
};
