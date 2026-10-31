import React from 'react';
import { FALLBACK_CJ_CATEGORIES } from '../../config/constants.js';

export interface CatalogBreadcrumbBarProps {
  categoryOrTag?: string | null;
  isRefreshing?: boolean;
}

export const CatalogBreadcrumbBar: React.FC<CatalogBreadcrumbBarProps> = ({
  categoryOrTag,
}) => {
  const resolvedName = React.useMemo(() => {
    if (!categoryOrTag) return 'All Products';
    const found = FALLBACK_CJ_CATEGORIES.find(
      (c) => c.categoryId.toLowerCase() === categoryOrTag.toLowerCase()
    );
    return found ? found.categoryName : categoryOrTag;
  }, [categoryOrTag]);

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span>Home</span>
        <span>›</span>
        <span className="text-teal-700">
          {resolvedName}
        </span>
      </div>
    </div>
  );
};
