import React from 'react';
import { ORDER_STATUS_CONFIG } from '../../config/constants.js';
import { clsx } from 'clsx';

export interface BadgeProps {
  status?: string;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  variant,
  className,
}) => {
  if (status && ORDER_STATUS_CONFIG[status]) {
    const config = ORDER_STATUS_CONFIG[status];
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 shadow-sm',
          config.bg,
          config.color,
          config.border,
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
        {label || config.label}
      </span>
    );
  }

  const customVariants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm',
        customVariants[variant || 'default'],
        className
      )}
    >
      {label || status}
    </span>
  );
};
