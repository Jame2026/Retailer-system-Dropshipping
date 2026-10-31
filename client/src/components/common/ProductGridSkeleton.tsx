import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton.js';

export interface ProductGridSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  compact?: boolean;
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  viewMode = 'grid',
  compact = false,
  className,
}) => {
  const defaultGridClass = compact
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  const containerClass =
    className || (viewMode === 'grid' ? defaultGridClass : 'flex flex-col gap-4');

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} viewMode={viewMode} compact={compact} />
      ))}
    </div>
  );
};
