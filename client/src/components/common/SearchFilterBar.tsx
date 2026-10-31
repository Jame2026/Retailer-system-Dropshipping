import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from './Input.js';
import { Button } from './Button.js';

export interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onClear: () => void;
  placeholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  selectedCategory?: string;
  categories?: Array<{ categoryId: string; categoryName: string }>;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search products by title, SKU, or keyword...',
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  selectedCategory,
  categories,
  onCategoryChange,
  className = '',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2.5 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-sm h-11"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-5 h-11"
        >
          Search
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={onClear}
          >
            Clear
          </Button>
        )}
      </form>

      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        {categories && onCategoryChange && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-teal-600 h-11 font-medium text-xs max-w-[190px]"
              aria-label="Filter products by category"
            >
              <option value="">All Categories</option>
              {categories.filter((c) => c.categoryId).map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
        )}

        {pageSize && pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-teal-600 h-11 font-medium text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
