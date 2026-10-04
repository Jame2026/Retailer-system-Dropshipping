import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class CJClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: env.CJ_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get valid CJ Dropshipping Access Token (with auto-refresh)
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token not expired, return it
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      logger.info('Refreshing CJ Dropshipping API access token...');
      const response = await axios.post(
        `${env.CJ_BASE_URL}/authentication/getAccessToken`,
        {
          email: env.CJ_API_EMAIL,
          apiKey: env.CJ_API_KEY,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data?.result && response.data?.data?.accessToken) {
        this.accessToken = String(response.data.data.accessToken);
        // Expires in 15 days, default to 14 days safety window
        const expiresInSec = response.data.data.accessTokenExpiryDate
          ? new Date(response.data.data.accessTokenExpiryDate).getTime() - Date.now()
          : 14 * 24 * 3600 * 1000;
        this.tokenExpiresAt = Date.now() + Math.max(expiresInSec, 3600000);
        return this.accessToken;
      }

      return env.CJ_API_KEY;
    } catch (error: any) {
      logger.warn({ error: error.message }, 'CJ Access Token endpoint warning, falling back to direct API key');
      return env.CJ_API_KEY;
    }
  }

  /**
   * Send authenticated request to CJ API
   */
  async request<T = any>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any, params?: any): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await this.client.request({
        url: endpoint,
        method,
        data,
        params,
        headers: {
          'CJ-Access-Token': token,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error({ endpoint, error: error.response?.data || error.message }, 'CJ API Request Failed');
      throw error;
    }
  }
}

export const cjClient = new CJClient();
