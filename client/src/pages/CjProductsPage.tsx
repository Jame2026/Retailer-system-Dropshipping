import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { sourcingService } from '../services/sourcingService.js';
import { useNotification } from '../context/NotificationContext.js';
import { useCatalogPagination } from '../hooks/useCatalogPagination.js';
import { SearchFilterBar } from '../components/common/SearchFilterBar.js';
import { CategoryPills } from '../components/common/CategoryPills.js';
import { CatalogCountBanner } from '../components/modules/catalog/CatalogCountBanner.js';
import { CjProductGridSection } from '../components/modules/catalog/CjProductGridSection.js';
import { CjProductDetailDialog } from '../components/modules/catalog/CjProductDetailDialog.js';
import { Pagination } from '../components/common/Pagination.js';
import { CjCategory, CjProductListItem, CjProductDetail } from '../types/catalog.types.js';
import { CheckCircle } from 'lucide-react';

export const CjProductsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [products, setProducts] = useState<CjProductListItem[]>([]);
  const [categories, setCategories] = useState<CjCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    page, setPage, pageSize, setPageSize, totalPages, setTotalPages,
    totalCount, setTotalCount, searchQuery, setSearchQuery, debouncedSearch,
    selectedCategory, handleCategorySelect, handleSearchSubmit, resetFilters,
  } = useCatalogPagination({ initialPageSize: 16 });

  const [selectedDetail, setSelectedDetail] = useState<CjProductDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    sourcingService.getCjCategories()
      .then((cats) => { if (isMounted && cats?.length) setCategories(cats); })
      .catch((e) => console.warn('Using fallback categories:', e));
    return () => { isMounted = false; };
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (products.length === 0) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const data = await sourcingService.listCjProducts({
        keyword: debouncedSearch || undefined,
        categoryId: selectedCategory || undefined,
        page, pageSize,
      }, forceRefresh);

      if (data?.items?.length) {
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
      if (err?.name === 'CanceledError' || err?.message === 'canceled' || err?.code === 'ERR_CANCELED' || err?.isCanceled) {
        return;
      }
      const msg = err?.message?.includes('timeout')
        ? 'CJ Dropshipping catalog is synchronizing. Please click Retry below.'
        : (err?.message || 'Unable to connect to CJ API. Showing cached products.');
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, debouncedSearch, pageSize]);

  const handleOpenDetail = async (pid: string) => {
    try {
      setDetailModalOpen(true);
      setLoadingDetail(true);
      setSelectedDetail(null);
      const detail = await sourcingService.getProductDetails(pid);
      setSelectedDetail(detail);
    } catch (err: any) {
      showToast('error', 'Query Failed', err.message);
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <PageContainer
      title="CJ Products"
      subtitle="Browse and explore all live products directly from CJ Dropshipping"
      action={
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          All Products Live in Store
        </span>
      }
    >
      <div className="space-y-3">
        <SearchFilterBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClear={() => setSearchQuery('')}
          placeholder="Search products by title, SKU, or keyword..."
          pageSize={pageSize}
          pageSizeOptions={[16, 24, 48]}
          onPageSizeChange={setPageSize}
          selectedCategory={selectedCategory}
          categories={categories}
          onCategoryChange={handleCategorySelect}
        />

        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      <CatalogCountBanner
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />

      <CjProductGridSection
        products={products}
        loading={loading}
        isRefreshing={isRefreshing}
        error={error}
        pageSize={pageSize}
        onOpenDetail={handleOpenDetail}
        onRetry={() => fetchProducts(true)}
        onResetFilters={resetFilters}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        pageSize={pageSize}
      />

      <CjProductDetailDialog
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        productDetail={selectedDetail}
        isLoading={loadingDetail}
      />
    </PageContainer>
  );
};
