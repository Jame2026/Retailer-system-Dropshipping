import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService.js';
import { Order, OrderFilterParams } from '../types/order.types.js';

export function useOrders(initialFilters: OrderFilterParams = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [limit] = useState(initialFilters.limit || 20);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>(initialFilters.status || '');
  const [search, setSearch] = useState<string>(initialFilters.search || '');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFilters.status !== undefined && initialFilters.status !== status) {
      setStatus(initialFilters.status);
      setPage(1);
    }
  }, [initialFilters.status]);

  useEffect(() => {
    if (initialFilters.search !== undefined && initialFilters.search !== search) {
      setSearch(initialFilters.search);
      setPage(1);
    }
  }, [initialFilters.search]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders({
        page,
        limit,
        status: status as any,
        search,
      });

      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.counts) setCounts(data.counts);
      if (data.totalRevenue !== undefined) setTotalRevenue(data.totalRevenue);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    total,
    page,
    setPage,
    limit,
    totalPages,
    status,
    setStatus,
    search,
    setSearch,
    counts,
    totalRevenue,
    loading,
    error,
    refresh: fetchOrders,
  };
}
