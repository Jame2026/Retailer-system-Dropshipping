import apiClient from './api.client.js';
import { ApiResponse } from '../types/api.types.js';

export interface ShippingOption {
  logisticName: string;
  logisticAging: string;
  minDays?: number;
  maxDays?: number;
  logisticPrice: number;
  totalFee: number;
  carrierCategory?: 'express' | 'postal' | 'standard' | 'economy';
  carrierTag?: string;
  isBestValue?: boolean;
  isFastest?: boolean;
  trackingAvailable?: boolean;
}

export interface CalculateFreightPayload {
  startCountryCode?: string;
  endCountryCode: string;
  products: Array<{ vid?: string; pid?: string; sku?: string; variantSku?: string; quantity: number }>;
}

export const shippingService = {
  async calculateFreight(payload: CalculateFreightPayload): Promise<ShippingOption[]> {
    const response = await apiClient.post<ApiResponse<ShippingOption[]>>('/api/shipping/calculate', payload);
    return response.data.data || [];
  },
};

