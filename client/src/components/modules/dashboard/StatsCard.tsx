import React, { ReactNode } from 'react';
import { Card } from '../../common/Card.js';
import { AnimatedCounter } from '../../common/AnimatedCounter.js';

export interface StatsCardProps {
  title: string;
  value?: string | number;
  numericValue?: number;
  prefix?: string;
  decimals?: number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  numericValue,
  prefix = '',
  decimals = 0,
  change,
  isPositive,
  icon,
  subtitle,
}) => {
  return (
    <Card hoverEffect className="relative overflow-hidden group border-slate-200/80 hover:border-teal-400 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
            {numericValue !== undefined ? (
              <AnimatedCounter value={numericValue} prefix={prefix} decimals={decimals} />
            ) : (
              value
            )}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-teal-600 group-hover:scale-110 group-hover:bg-teal-50 group-hover:text-teal-700 transition-all duration-200 shadow-xs">
          {icon}
        </div>
      </div>

      {change && (
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            isPositive ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-400 text-[11px] font-normal">live update</span>
        </div>
      )}
    </Card>
  );
};

