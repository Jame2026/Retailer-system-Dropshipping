export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheResult<T> {
  data: T;
  isStale: boolean;
  ageMs: number;
}

export interface CacheOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
  group?: string;
}
