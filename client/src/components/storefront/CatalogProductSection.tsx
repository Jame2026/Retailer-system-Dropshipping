import React from 'react';
import { ProductCard, ProductItem } from './ProductCard.js';
import { ProductGridSkeleton } from '../common/ProductGridSkeleton.js';
import { EmptyState } from '../common/EmptyState.js';
import { ErrorState } from '../common/ErrorState.js';

export interface CatalogProductSectionProps {
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  products: ProductItem[];
  viewMode: 'grid' | 'list';
  pageSize: number;
  onRetry: () => void;
  onResetFilters: () => void;
}

export const CatalogProductSection: React.FC<CatalogProductSectionProps> = ({
  loading,
  isRefreshing,
  error,
  products,
  viewMode,
  pageSize,
  onRetry,
  onResetFilters,
}) => {
  if (loading && products.length === 0) {
    return (
      <ProductGridSkeleton
        count={pageSize > 12 ? 12 : pageSize}
        viewMode={viewMode}
      />
    );
  }

  if (products.length === 0 && error) {
    return (
      <ErrorState
        variant="card"
        title="Unable to Load Catalog"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try changing your search keywords or price filters."
        actionText="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-60' : 'opacity-100'} ${
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
};
