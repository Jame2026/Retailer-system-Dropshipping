import React, { ReactNode } from 'react';
import { Card } from '../../common/Card.js';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  subtitle,
}) => {
  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-teal-400 group-hover:scale-110 transition-transform duration-200 shadow-md">
          {icon}
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
          <span className={isPositive ? 'text-teal-400' : 'text-rose-400'}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-400 font-normal">vs previous period</span>
        </div>
      )}
    </Card>
  );
};
