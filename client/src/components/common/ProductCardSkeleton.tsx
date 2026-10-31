import React from 'react';
import { Skeleton } from './Skeleton.js';

export interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  compact?: boolean;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  viewMode = 'grid',
  compact = false,
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-5">
        <Skeleton className="w-full sm:w-44 h-44 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full py-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between ${compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-3'}`}>
      <div className="space-y-2.5">
        <Skeleton className={`${compact ? 'h-44' : 'aspect-square'} w-full rounded-xl`} />
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Skeleton className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
};
