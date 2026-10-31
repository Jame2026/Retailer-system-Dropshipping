import { CacheEntry, CacheResult, CacheOptions } from './apiCache.types.js';
import { cacheStorage } from './cacheStorage.js';

export type { CacheResult, CacheOptions };

export class ClientApiCache {
  private memory = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private abortControllers = new Map<string, AbortController>();

  generateCacheKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    const sortedKeys = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .sort();

    if (sortedKeys.length === 0) return prefix;
    const queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(String(params[k]))}`).join('&');
    return `${prefix}:${queryString}`;
  }

  getWithStatus<T>(
    key: string,
    ttlMs = 180_000,
    maxStaleMs = 86_400_000
  ): CacheResult<T> | null {
    let entry = this.memory.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      entry = cacheStorage.get<T>(key) || undefined;
      if (entry) {
        this.memory.set(key, entry);
      }
    }

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > maxStaleMs) {
      this.memory.delete(key);
      cacheStorage.remove(key);
      return null;
    }

    return {
      data: entry.data,
      isStale: age > ttlMs,
      ageMs: age,
    };
  }

  get<T>(key: string, ttlMs = 180_000): T | null {
    const status = this.getWithStatus<T>(key, ttlMs, ttlMs);
    return status ? status.data : null;
  }

  set<T>(key: string, data: T): void {
    if (data === null || data === undefined) return;
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    this.memory.set(key, entry);
    cacheStorage.set(key, entry);
  }

  invalidate(prefix?: string): void {
    if (!prefix) {
      this.memory.clear();
      this.inFlight.clear();
      cacheStorage.clear();
      return;
    }

    for (const key of this.memory.keys()) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        this.memory.delete(key);
      }
    }
    cacheStorage.clear(prefix);
  }

  abortGroup(group: string): void {
    const controller = this.abortControllers.get(group);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(group);
    }
  }

  async dedupeAndCache<T>(
    key: string,
    fetcher: (signal?: AbortSignal) => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const ttlMs = options.ttlMs ?? 180_000;

    if (!options.forceRefresh) {
      const cached = this.get<T>(key, ttlMs);
      if (cached !== null && cached !== undefined) return cached;
    }

    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    let controller: AbortController | undefined;
    if (options.group) {
      this.abortGroup(options.group);
      controller = new AbortController();
      this.abortControllers.set(options.group, controller);
    }

    const promise = (async () => {
      try {
        const data = await fetcher(controller?.signal);
        if (data !== null && data !== undefined) {
          this.set(key, data);
        }
        return data;
      } catch (err: any) {
        if (controller?.signal.aborted || err?.name === 'CanceledError' || err?.message === 'canceled') {
          const cancelError = new Error('canceled');
          cancelError.name = 'CanceledError';
          (cancelError as any).isCanceled = true;
          throw cancelError;
        }
        throw err;
      } finally {
        this.inFlight.delete(key);
        if (options.group && this.abortControllers.get(options.group) === controller) {
          this.abortControllers.delete(options.group);
        }
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const clientApiCache = new ClientApiCache();
