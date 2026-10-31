import { logger } from './logger.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    if (ttlMs <= 0) return;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * Fetch data using the provided fetcher function, automatically deduplicating
   * concurrent requests for the same key and caching the result for ttlMs.
   */
  async fetchOrDedupe<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // 1. Return valid cached value if available
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // 2. If a request for this key is already in flight, share that promise
    const pending = this.inFlight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // 3. Initiate fetcher and record in-flight promise
    const promise = (async () => {
      try {
        const result = await fetcher();
        if (result !== undefined && result !== null) {
          this.set(key, result, ttlMs);
        }
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const cjMemoryCache = new MemoryCache();
