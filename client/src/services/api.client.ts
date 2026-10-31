import axios from 'axios';
import { env } from '../config/env.js';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('retailer_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function isRequestCanceled(error: any): boolean {
  if (!error) return false;
  return (
    axios.isCancel(error) ||
    error.name === 'CanceledError' ||
    error.name === 'AbortError' ||
    error.message === 'canceled' ||
    error.code === 'ERR_CANCELED' ||
    Boolean(error.isCanceled)
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isRequestCanceled(error)) {
      const cancelErr = new Error('canceled');
      cancelErr.name = 'CanceledError';
      (cancelErr as any).isCanceled = true;
      (cancelErr as any).code = 'ERR_CANCELED';
      return Promise.reject(cancelErr);
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
