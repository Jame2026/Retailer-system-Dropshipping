import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from './Button.js';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No products found',
  description = 'Try searching with a different keyword, category, or filter.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm ${className}`}>
      <div className="flex justify-center text-slate-300">
        {icon || <ShoppingBag className="w-12 h-12 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>}
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction} className="font-semibold text-xs">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
