import React from 'react';
import { Factory, Wallet, Activity } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CjAccountInfo } from '../../../types/catalog.types.js';

export interface CjStatusBarProps {
  accountInfo: CjAccountInfo | null;
  className?: string;
}

export const CjStatusBar: React.FC<CjStatusBarProps> = ({ accountInfo, className = '' }) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
          <Factory className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CJ Dropshipping Open API</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            OpenID: {accountInfo?.openId || '59360'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <Wallet className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-slate-500">Wallet:</span>
          <span className="font-mono font-bold text-slate-900">
            {formatCurrency(accountInfo?.balance?.amount || 0)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500">Quota:</span>
          <span className="font-mono font-bold text-emerald-700">50,000 pts</span>
        </div>
      </div>
    </div>
  );
};
