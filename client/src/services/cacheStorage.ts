import { CacheEntry } from './apiCache.types.js';

const CACHE_PREFIX = '_cj_cache_';

export const cacheStorage = {
  get<T>(key: string): CacheEntry<T> | null {
    try {
      const stored = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!stored) return null;
      const entry = JSON.parse(stored) as CacheEntry<T>;
      return entry && typeof entry.timestamp === 'number' ? entry : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, entry: CacheEntry<T>): void {
    try {
      sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Ignore quota exceeded
    }
  },

  remove(key: string): void {
    try {
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // Ignore
    }
  },

  clear(prefix?: string): void {
    try {
      const matchPrefix = prefix ? `${CACHE_PREFIX}${prefix}` : CACHE_PREFIX;
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith(matchPrefix));
      keys.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Ignore
    }
  },
};
