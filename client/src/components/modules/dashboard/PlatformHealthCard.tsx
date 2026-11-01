import React from 'react';
import { RotateCw } from 'lucide-react';

export interface PlatformHealthCardProps {
  balanceAmount?: number;
  openId?: string | number | null;
  isSyncing?: boolean;
  onRefresh?: () => void;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({
  balanceAmount = 0.0,
  openId = '59360',
  isSyncing = false,
  onRefresh,
}) => {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-[#111827] mb-3">Platform Health</h2>
        <div className="flex flex-wrap items-center gap-8 md:gap-14">
          {/* CJ Live Connected */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-10 rounded-xl bg-[#15803D] text-white font-extrabold text-base flex items-center justify-center shadow-xs tracking-tight">
              CJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#111827]">Live Connected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-[#6B7280] font-mono">Supplier ID: #{openId}</p>
            </div>
          </div>

          {/* Wallet / Balance */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center shadow-xs">
              <svg
                className="w-5 h-5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="6" width="20" height="13" rx="2.5" fill="#E5E7EB" stroke="#6B7280" />
                <path d="M2 10h20" stroke="#6B7280" />
                <rect x="14" y="12" width="5" height="4" rx="1.5" fill="#FFFFFF" stroke="#6B7280" />
                <circle cx="16.5" cy="14" r="0.8" fill="#15803D" />
                <circle cx="7" cy="4" r="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <circle cx="10" cy="5" r="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black text-[#111827] font-mono tracking-tight">
                ${Number(balanceAmount).toFixed(2)}
              </span>
              <p className="text-[11px] text-[#6B7280]">Available CJ Balance</p>
            </div>
          </div>
        </div>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#4B5563] transition-all cursor-pointer disabled:opacity-50"
          title="Refresh CJ Supplier Balance & Health"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#15803D]' : ''}`} />
          <span>{isSyncing ? 'Checking...' : 'Check Ping'}</span>
        </button>
      )}
    </section>
  );
};
