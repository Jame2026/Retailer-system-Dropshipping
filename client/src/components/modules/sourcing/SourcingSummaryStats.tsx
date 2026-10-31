import React from 'react';
import { Sparkles, Clock, CheckCircle2, Factory } from 'lucide-react';

interface SourcingSummaryStatsProps {
  requests: any[];
}

export const SourcingSummaryStats: React.FC<SourcingSummaryStatsProps> = ({ requests }) => {
  const pendingCount = requests.filter((r) => !r.status || r.status === 'PENDING').length;
  const sourcingCount = requests.filter((r) => r.status === 'SOURCING').length;
  const sourcedCount = requests.filter((r) => r.status === 'SOURCED' || r.status === 'SUCCESS').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-white border border-teal-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[11px] font-semibold">Total Queries</span>
        </div>
        <p className="text-base font-extrabold text-teal-800 font-mono">{requests.length}</p>
        <span className="text-[10px] text-slate-400 block mt-0.5">Submitted products</span>
      </div>

      <div className="bg-white border border-amber-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-semibold">Pending Review</span>
        </div>
        <p className="text-base font-extrabold text-amber-700 font-mono">{pendingCount}</p>
        <span className="text-[10px] text-slate-400 block mt-0.5">Awaiting agent quote</span>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Factory className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-semibold">In Negotiation</span>
        </div>
        <p className="text-base font-extrabold text-blue-700 font-mono">{sourcingCount}</p>
        <span className="text-[10px] text-slate-400 block mt-0.5">Contacting factories</span>
      </div>

      <div className="bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold">Ready to Sell</span>
        </div>
        <p className="text-base font-extrabold text-emerald-700 font-mono">{sourcedCount}</p>
        <span className="text-[10px] text-slate-400 block mt-0.5">Sourced with quotes</span>
      </div>
    </div>
  );
};
