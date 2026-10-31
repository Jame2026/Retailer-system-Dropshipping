import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './Button.js';
import { PageJumpForm } from './PageJumpForm.js';
import { getPageNumbers } from '../../utils/pagination.js';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  totalCount?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newSize: number) => void;
  className?: string;
  showJump?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className = '',
  showJump = true,
}) => {
  if (totalPages <= 1 && (!totalCount || totalCount <= 0)) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);
  const startItem = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const endItem = pageSize && totalCount ? Math.min(page * pageSize, totalCount) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs font-medium text-slate-700 ${className}`}
    >
      <div className="flex items-center gap-3 text-slate-500">
        {totalCount !== undefined && startItem !== undefined && endItem !== undefined && (
          <span>
            Showing <strong className="text-slate-900">{startItem}</strong> -{' '}
            <strong className="text-slate-900">{endItem}</strong> of{' '}
            <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> items
          </span>
        )}

        {pageSizeOptions && onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-600"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="First Page"
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(Math.max(1, page - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="h-8 px-2.5"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((pNum, idx) =>
            typeof pNum === 'number' ? (
              <button
                key={idx}
                onClick={() => {
                  onPageChange(pNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                  page === pNum
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pNum}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400">
                {pNum}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(Math.min(totalPages, page + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="h-8 px-2.5"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(totalPages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Last Page"
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>

        {showJump && totalPages > 1 && (
          <PageJumpForm page={page} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    </div>
  );
};
