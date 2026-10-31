import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

export interface CatalogToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
  viewMode,
  onViewModeChange,
  totalCount,
  page,
  pageSize,
  onPageSizeChange,
  sortBy,
  onSortByChange,
}) => {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1.5 rounded-lg border transition-colors ${
            viewMode === 'grid'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-slate-300 text-slate-500 hover:bg-slate-100'
          }`}
          title="Grid View"
          aria-label="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-1.5 rounded-lg border transition-colors ${
            viewMode === 'list'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'border-slate-300 text-slate-500 hover:bg-slate-100'
          }`}
          title="List View"
          aria-label="List View"
        >
          <List className="w-4 h-4" />
        </button>
        <span className="text-slate-500 ml-2">
          {totalCount > 0 ? (
            <>
              Showing <strong className="text-slate-900">{startItem}</strong> -{' '}
              <strong className="text-slate-900">{endItem}</strong> of{' '}
              <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> items
            </>
          ) : (
            <>Showing 0 items</>
          )}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>
    </div>
  );
};
