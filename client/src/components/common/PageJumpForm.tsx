import React, { useState, useEffect } from 'react';
import { Button } from './Button.js';

export interface PageJumpFormProps {
  page: number;
  totalPages: number;
  onPageChange: (targetPage: number) => void;
  className?: string;
}

export const PageJumpForm: React.FC<PageJumpFormProps> = ({
  page,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const [jumpInput, setJumpInput] = useState<string>(String(page));

  useEffect(() => {
    setJumpInput(String(page));
  }, [page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setJumpInput(String(page));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-1.5 ml-2 ${className}`}>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={jumpInput}
        onChange={(e) => setJumpInput(e.target.value)}
        className="w-12 px-1.5 py-1 text-center bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-600 h-8"
        aria-label="Target page"
      />
      <span className="text-slate-400">/ {totalPages}</span>
      <Button type="submit" variant="outline" size="sm" className="h-8 px-2 text-xs">
        Go
      </Button>
    </form>
  );
};
