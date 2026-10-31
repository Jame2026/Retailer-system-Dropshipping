import React from 'react';
import { CjCategory } from '../../types/catalog.types.js';

export interface CategoryPillsProps {
  categories: CjCategory[] | Array<{ categoryId: string; categoryName: string }>;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  allLabel?: string;
  maxDisplay?: number;
  className?: string;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  allLabel = 'All Categories',
  maxDisplay,
  className = '',
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  const displayedCategories = maxDisplay ? categories.slice(0, maxDisplay) : categories;

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 text-xs no-scrollbar ${className}`}
      role="tablist"
      aria-label="Product categories"
    >
      <button
        onClick={() => onSelectCategory('')}
        role="tab"
        aria-selected={selectedCategory === ''}
        className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 ${
          selectedCategory === ''
            ? 'bg-teal-700 text-white shadow-sm font-semibold'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {allLabel}
      </button>

      {displayedCategories.map((c) => {
        const isSelected = selectedCategory === c.categoryId;
        return (
          <button
            key={c.categoryId}
            onClick={() => onSelectCategory(c.categoryId)}
            role="tab"
            aria-selected={isSelected}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-teal-700 text-white shadow-sm font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.categoryName}
          </button>
        );
      })}
    </div>
  );
};
