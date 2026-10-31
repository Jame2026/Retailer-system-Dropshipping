import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { CJRateLimiter } from './cj.limiter.js';
import { getCjMockResponse } from './cj.sandbox.js';

export class CJClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private openId: string | number | null = null;
  private tokenExpiresAt: number = 0;
  private pendingTokenPromise: Promise<string> | null = null;
  private limiter: CJRateLimiter = new CJRateLimiter(1050);

  constructor() {
    this.client = axios.create({
      baseURL: env.CJ_BASE_URL,
      timeout: 35000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private isSandbox(): boolean {
    return (
      !env.CJ_API_KEY ||
      env.CJ_API_KEY.startsWith('sample_') ||
      env.CJ_API_KEY.startsWith('dev_')
    );
  }

  getOpenId() {
    return this.openId;
  }

  private async waitRateLimit(): Promise<void> {
    return this.limiter.wait();
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    if (this.isSandbox()) {
      return 'sandbox-cj-jwt-token-active';
    }

    if (!forceRefresh && this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    if (this.pendingTokenPromise) {
      return this.pendingTokenPromise;
    }

    this.pendingTokenPromise = (async () => {
      if (forceRefresh && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) return refreshed;
      }

      try {
        await this.waitRateLimit();
        logger.info('Authenticating with CJ Dropshipping API 2.0 (POST /authentication/getAccessToken)...');
        const response = await axios.post(
          `${env.CJ_BASE_URL}/authentication/getAccessToken`,
          { apiKey: env.CJ_API_KEY },
          { headers: { 'Content-Type': 'application/json' }, timeout: 35000 }
        );

        if (response.data?.result && response.data?.data?.accessToken) {
          this.accessToken = String(response.data.data.accessToken);
          this.refreshToken = response.data.data.refreshToken ? String(response.data.data.refreshToken) : null;
          this.openId = response.data.data.openId || null;

          const expiresInMs = response.data.data.accessTokenExpiryDate
            ? new Date(response.data.data.accessTokenExpiryDate).getTime() - Date.now()
            : 180 * 24 * 3600 * 1000;
          this.tokenExpiresAt = Date.now() + Math.max(expiresInMs, 3600000);

          logger.info(
            { openId: this.openId, expiry: response.data.data.accessTokenExpiryDate },
            '✅ CJ Dropshipping access token acquired and cached'
          );
          return this.accessToken;
        }

        logger.warn({ data: response.data }, 'CJ token endpoint returned without accessToken');
        return env.CJ_API_KEY;
      } catch (error: any) {
        logger.error(
          { error: error.response?.data || error.message },
          'Failed to obtain CJ Access Token, falling back to local simulation'
        );
        return 'sandbox-cj-jwt-token-active';
      }
    })().finally(() => {
      this.pendingTokenPromise = null;
    });

    return this.pendingTokenPromise;
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    try {
      await this.waitRateLimit();
      logger.info('Refreshing CJ Dropshipping access token (POST /authentication/refreshAccessToken)...');
      const response = await axios.post(
        `${env.CJ_BASE_URL}/authentication/refreshAccessToken`,
        { refreshToken: this.refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 35000 }
      );

      if (response.data?.result && response.data?.data?.accessToken) {
        this.accessToken = String(response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          this.refreshToken = String(response.data.data.refreshToken);
        }
        const expiresInMs = response.data.data.accessTokenExpiryDate
          ? new Date(response.data.data.accessTokenExpiryDate).getTime() - Date.now()
          : 180 * 24 * 3600 * 1000;
        this.tokenExpiresAt = Date.now() + Math.max(expiresInMs, 3600000);
        logger.info('✅ CJ Dropshipping access token refreshed successfully');
        return this.accessToken;
      }
    } catch (error: any) {
      logger.warn({ error: error.message }, 'CJ token refresh failed, will re-authenticate');
    }
    return null;
  }

  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    params?: any,
    retryCount = 0
  ): Promise<T> {
    if (this.isSandbox()) {
      return getCjMockResponse(endpoint, data, params);
    }

    let token = await this.getAccessToken();
    await this.waitRateLimit();

    try {
      const response = await this.client.request({
        url: endpoint,
        method,
        data,
        params,
        headers: { 'CJ-Access-Token': token },
      });

      const code = response.data?.code;

      if ([1600001, 1600002, 1600003].includes(code) && retryCount < 2) {
        logger.warn({ code }, 'CJ token expired or invalid, auto-refreshing token...');
        await this.getAccessToken(true);
        return this.request<T>(endpoint, method, data, params, retryCount + 1);
      }

      if (code === 1600200 && retryCount < 3) {
        const waitMs = 1200 * (retryCount + 1);
        logger.warn({ endpoint, retry: retryCount + 1, waitMs }, 'CJ QPS rate limit reached (1600200), waiting...');
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return this.request<T>(endpoint, method, data, params, retryCount + 1);
      }

      if (code === 1600014) {
        logger.error('CRITICAL: CJ API access suspended (code 1600014). Visit https://www.cjdropshipping.com/my.html#/authorize/APIStores to reactivate.');
      } else if (code === 16900500) {
        logger.warn('CJ API daily points exhausted (code 16900500). Points replenish every minute.');
      }

      return response.data;
    } catch (error: any) {
      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.response?.status === 429)) {
        const waitMs = 1500 * (retryCount + 1);
        logger.warn({ endpoint, retry: retryCount + 1, waitMs }, 'Transient network error or HTTP 429, retrying...');
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return this.request<T>(endpoint, method, data, params, retryCount + 1);
      }

      const errDetails = error.response?.data || error.message;
      logger.error({ endpoint, error: errDetails }, 'CJ API network call failed');
      throw new Error(`CJ API Error on ${endpoint}: ${typeof errDetails === 'object' ? JSON.stringify(errDetails) : errDetails}`);
    }
  }
}

export const cjClient = new CJClient();
