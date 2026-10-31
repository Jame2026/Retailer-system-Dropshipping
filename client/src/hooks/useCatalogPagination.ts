import { useState, useEffect, useCallback } from 'react';

export interface UseCatalogPaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialCategory?: string;
  initialSearch?: string;
  debounceMs?: number;
}

export interface UseCatalogPaginationResult {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  handleCategorySelect: (catId: string) => void;
  handleSearchSubmit: (e?: React.FormEvent) => void;
  resetFilters: () => void;
  handlePageJump: (targetPage: number) => void;
}

export function useCatalogPagination({
  initialPage = 1,
  initialPageSize = 16,
  initialCategory = '',
  initialSearch = '',
  debounceMs = 350,
}: UseCatalogPaginationOptions = {}): UseCatalogPaginationResult {
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const handleCategorySelect = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  }, []);

  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setPage(1);
  }, []);

  const handlePageJump = useCallback(
    (targetPage: number) => {
      if (targetPage >= 1 && targetPage <= totalPages) {
        setPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [totalPages]
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedCategory,
    setSelectedCategory,
    handleCategorySelect,
    handleSearchSubmit,
    resetFilters,
    handlePageJump,
  };
}
