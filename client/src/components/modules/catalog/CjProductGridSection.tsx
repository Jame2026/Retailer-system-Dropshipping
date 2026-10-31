import React from 'react';
import { CjProductCard } from './CjProductCard.js';
import { ProductGridSkeleton } from '../../common/ProductGridSkeleton.js';
import { EmptyState } from '../../common/EmptyState.js';
import { ErrorState } from '../../common/ErrorState.js';
import { CjProductListItem } from '../../../types/catalog.types.js';

export interface CjProductGridSectionProps {
  products: CjProductListItem[];
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pageSize: number;
  onOpenDetail: (pid: string) => void;
  onRetry: () => void;
  onResetFilters: () => void;
}

export const CjProductGridSection: React.FC<CjProductGridSectionProps> = ({
  products,
  loading,
  isRefreshing,
  error,
  pageSize,
  onOpenDetail,
  onRetry,
  onResetFilters,
}) => {
  const isCanceledMsg = error && (error === 'canceled' || error.toLowerCase().includes('canceled'));
  const displayError = isCanceledMsg ? null : error;

  return (
    <>
      {displayError && products.length > 0 && (
        <ErrorState
          variant="banner"
          title="Notice"
          message={displayError}
          onRetry={onRetry}
        />
      )}

      {loading && products.length === 0 ? (
        <ProductGridSkeleton count={pageSize} compact />
      ) : products.length === 0 && displayError ? (
        <ErrorState
          variant="card"
          title="Unable to Load Products"
          message={displayError}
          onRetry={onRetry}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try searching with a different keyword or selecting All Categories."
          actionText="Reset Filters"
          onAction={onResetFilters}
        />
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${
            isRefreshing ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {products.map((item) => (
            <CjProductCard
              key={item.id}
              product={item}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </>
  );
};
