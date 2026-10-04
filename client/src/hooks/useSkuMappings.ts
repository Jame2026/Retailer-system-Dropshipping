import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '../services/catalogService.js';
import { SkuMapping } from '../types/catalog.types.js';

export function useSkuMappings(page = 1, limit = 50) {
  const [mappings, setMappings] = useState<SkuMapping[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMappings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await catalogService.getMappings(page, limit);
      setMappings(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load SKU mappings');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  return {
    mappings,
    total,
    loading,
    error,
    refresh: fetchMappings,
  };
}
