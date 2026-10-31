import React from 'react';
import { Card } from '../../common/Card.js';
import { AnimatedCounter } from '../../common/AnimatedCounter.js';
import { Package, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export interface CatalogSummaryCardsProps {
  totalProducts: number;
  cjConnectedCount: number;
  backupProtectedCount: number;
  avgMarkup?: number;
}

export const CatalogSummaryCards: React.FC<CatalogSummaryCardsProps> = ({
  totalProducts,
  cjConnectedCount,
  backupProtectedCount,
  avgMarkup = 2.5,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card hoverEffect className="border-slate-200/80 hover:border-teal-400 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Products</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              <AnimatedCounter value={totalProducts} />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live in your store</p>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card hoverEffect className="border-slate-200/80 hover:border-teal-400 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CJ Auto-Fulfill</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              <AnimatedCounter value={cjConnectedCount} />
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Dispatch Ready
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card hoverEffect className="border-slate-200/80 hover:border-teal-400 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Failover Backup</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              <AnimatedCounter value={backupProtectedCount} />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Zendrop / Custom fallback</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </Card>

      <Card hoverEffect className="border-slate-200/80 hover:border-teal-400 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Profit Markup</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              {avgMarkup}x
            </h3>
            <p className="text-xs text-teal-600 font-semibold mt-0.5">~55-60% Gross Margin</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};
