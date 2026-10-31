import React from 'react';

export interface CatalogCountBannerProps {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const CatalogCountBanner: React.FC<CatalogCountBannerProps> = ({
  totalCount,
  page,
  pageSize,
  totalPages,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium px-1">
      <div>
        {totalCount > 0 ? (
          <span>
            Showing <strong className="text-slate-900">{(page - 1) * pageSize + 1}</strong> -{' '}
            <strong className="text-slate-900">{Math.min(page * pageSize, totalCount)}</strong> of{' '}
            <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> products
          </span>
        ) : (
          <span>0 products found</span>
        )}
      </div>
      <div className="text-teal-700 font-medium">
        <span>Page {page} of {totalPages}</span>
      </div>
    </div>
  );
};
