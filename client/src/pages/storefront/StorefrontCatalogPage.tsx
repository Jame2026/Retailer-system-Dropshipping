import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { CategorySidebar } from '../../components/storefront/CategorySidebar.js';
import { ProductItem } from '../../components/storefront/ProductCard.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { ErrorState } from '../../components/common/ErrorState.js';
import { Pagination } from '../../components/common/Pagination.js';
import { CatalogToolbar } from '../../components/storefront/CatalogToolbar.js';
import { CatalogBreadcrumbBar } from '../../components/storefront/CatalogBreadcrumbBar.js';
import { CatalogProductSection } from '../../components/storefront/CatalogProductSection.js';
import { catalogService, StorefrontMeta } from '../../services/catalogService.js';
import { useStorefrontLayout } from '../../components/layout/StorefrontLayout.js';

export const StorefrontCatalogPage: React.FC = () => {
  const { isInsideStorefrontLayout } = useStorefrontLayout();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialTag = searchParams.get('tag') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number>(300);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [meta, setMeta] = useState<StorefrontMeta>({ categories: [], brands: [], totalProducts: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  useEffect(() => {
    let isMounted = true;
    catalogService.getStorefrontMeta().then((data) => {
      if (isMounted) setMeta(data);
    }).catch((err) => console.error('Failed to load catalog metadata', err));
    return () => { isMounted = false; };
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (products.length === 0) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const search = searchParams.get('search') || initialSearch;
      const tag = searchParams.get('tag') || initialTag;

      const data = await catalogService.getStorefrontProducts({
        category: selectedCategory || undefined,
        tag: tag || undefined,
        search: search || undefined,
        maxPrice: debouncedMaxPrice,
        brand: selectedBrand || undefined,
        sortBy,
        page,
        limit: pageSize,
      }, forceRefresh);

      if (data?.items) {
        setProducts(data.items);
        const total = data.total || data.items.length;
        setTotalCount(total);
        setTotalPages(data.totalPages || Math.ceil(total / pageSize) || 1);
      } else {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message === 'canceled') return;
      console.error('Failed to fetch storefront products from backend', err);
      setError(err?.message || 'Failed to load live products from server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedMaxPrice, selectedBrand, sortBy, page, pageSize, searchParams]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setMaxPrice(300);
    setDebouncedMaxPrice(300);
    setSelectedBrand('');
    setSortBy('featured');
    setPage(1);
    setSearchParams({});
  };

  const content = (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
      <CatalogBreadcrumbBar
        categoryOrTag={selectedCategory || searchParams.get('tag')}
        isRefreshing={isRefreshing}
      />

      <div className="flex flex-col lg:flex-row items-start gap-8">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          maxPrice={maxPrice}
          onChangeMaxPrice={setMaxPrice}
          selectedBrand={selectedBrand}
          onSelectBrand={(b) => { setSelectedBrand(b); setPage(1); }}
          onResetFilters={handleResetFilters}
          categoriesList={meta.categories}
          brandsList={meta.brands}
        />

        <div className="flex-1 w-full space-y-6">
          <CatalogToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            sortBy={sortBy}
            onSortByChange={(sort) => { setSortBy(sort); setPage(1); }}
          />

          {error && products.length > 0 && (
            <ErrorState
              variant="banner"
              title="Sync Warning"
              message={`Showing cached product data. ${error}`}
              onRetry={() => fetchProducts(true)}
            />
          )}

          <CatalogProductSection
            loading={loading}
            isRefreshing={isRefreshing}
            error={error}
            products={products}
            viewMode={viewMode}
            pageSize={pageSize}
            onRetry={() => fetchProducts(true)}
            onResetFilters={handleResetFilters}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalCount={totalCount}
            pageSize={pageSize}
            className="bg-white p-4 rounded-2xl shadow-sm"
          />
        </div>
      </div>
    </main>
  );

  if (isInsideStorefrontLayout) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <StoreHeader />
      {content}
      <StoreFooter />
      <CartDrawer />
    </div>
  );
};
