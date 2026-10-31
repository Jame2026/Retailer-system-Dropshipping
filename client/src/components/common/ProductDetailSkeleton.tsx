import React from 'react';
import { Skeleton } from './Skeleton.js';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Gallery preview */}
        <div className="space-y-3">
          <Skeleton className="h-64 rounded-xl w-full" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-14 h-14 rounded-lg shrink-0" />
            ))}
          </div>
        </div>

        {/* Right: Info and Pricing */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Variants Table Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="border border-slate-200 rounded-xl p-3 space-y-2.5">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
              <Skeleton className="h-4 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
