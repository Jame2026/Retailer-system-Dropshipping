import { useState, useEffect, useRef, useCallback } from 'react';
import { clientApiCache, CacheResult } from '../services/apiCache.js';

export interface UseCachedQueryOptions<T> {
  key: string;
  fetcher: (signal?: AbortSignal) => Promise<T>;
  ttlMs?: number;
  staleTimeMs?: number;
  group?: string;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
}

export interface UseCachedQueryResult<T> {
  data: T | null;
  loading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  error: string | null;
  refetch: (force?: boolean) => Promise<T | null>;
}

export function useCachedQuery<T>({
  key,
  fetcher,
  ttlMs = 180_000,
  staleTimeMs = 60_000,
  group,
  enabled = true,
  onSuccess,
  onError,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  // Try synchronous cache read on initial render for zero-latency UI
  const initialCache = useRef<CacheResult<T> | null>(
    typeof window !== 'undefined' ? clientApiCache.getWithStatus<T>(key, ttlMs) : null
  ).current;

  const [data, setData] = useState<T | null>(initialCache ? initialCache.data : null);
  const [loading, setLoading] = useState<boolean>(!initialCache && enabled);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(
    initialCache ? initialCache.isStale : false
  );
  const [isStale, setIsStale] = useState<boolean>(initialCache ? initialCache.isStale : false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const currentKeyRef = useRef(key);
  currentKeyRef.current = key;

  const executeFetch = useCallback(
    async (forceRefresh = false): Promise<T | null> => {
      if (!enabled) return null;

      const cacheResult = clientApiCache.getWithStatus<T>(key, ttlMs);
      if (!forceRefresh && cacheResult && !cacheResult.isStale) {
        setData(cacheResult.data);
        setIsStale(false);
        setLoading(false);
        setIsRefreshing(false);
        setError(null);
        return cacheResult.data;
      }

      // If we have stale or existing data, keep it visible and set isRefreshing
      if (cacheResult) {
        setData(cacheResult.data);
        setIsStale(cacheResult.isStale);
        setIsRefreshing(true);
        setLoading(false);
      } else {
        // Cold start with no data -> show skeleton
        setLoading(true);
        setIsRefreshing(false);
      }

      setError(null);

      try {
        const result = await clientApiCache.dedupeAndCache<T>(
          key,
          (signal) => fetcherRef.current(signal),
          {
            ttlMs,
            forceRefresh,
            group,
          }
        );

        // Only update if key hasn't changed in the meantime
        if (currentKeyRef.current === key) {
          setData(result);
          setIsStale(false);
          setError(null);
          if (onSuccess) onSuccess(result);
        }
        return result;
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          return null;
        }

        if (currentKeyRef.current === key) {
          const errMsg = err?.message || 'Failed to load data. Please check your connection.';
          setError(errMsg);
          if (onError) onError(err);
        }
        return null;
      } finally {
        if (currentKeyRef.current === key) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [key, enabled, ttlMs, group, onSuccess, onError]
  );

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  const refetch = useCallback(
    (force = true) => {
      return executeFetch(force);
    },
    [executeFetch]
  );

  return {
    data,
    loading,
    isRefreshing,
    isStale,
    error,
    refetch,
  };
}
