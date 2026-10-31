import React from 'react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, Clock, CheckCircle2, AlertCircle, Package, Factory, ArrowRight } from 'lucide-react';

interface SourcingHistoryListProps {
  requests: any[];
  loading: boolean;
}

export const SourcingHistoryList: React.FC<SourcingHistoryListProps> = ({ requests, loading }) => {
  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'SOURCED' || s === 'SUCCESS') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Ready to Sell
        </span>
      );
    }
    if (s === 'SOURCING') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <Factory className="w-3 h-3" /> Factory Negotiation
        </span>
      );
    }
    if (s === 'FAILED') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Sourcing Unavailable
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Under Review
      </span>
    );
  };

  const getDomainLabel = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('aliexpress')) return 'AliExpress';
      if (u.hostname.includes('1688')) return '1688.com';
      if (u.hostname.includes('amazon')) return 'Amazon';
      if (u.hostname.includes('tiktok')) return 'TikTok';
      return u.hostname.replace('www.', '');
    } catch {
      return 'Supplier Link';
    }
  };

  if (requests.length === 0 && !loading) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-600">No custom sourcing queries yet.</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
          Found a trending product on AliExpress, Amazon, or TikTok? Paste its link to request direct wholesale factory pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const title = req.productName || req.suggestedSku || 'Custom Sourced Product';
        const domain = getDomainLabel(req.productUrl);

        return (
          <div
            key={req.id}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-sm" title={title}>
                    {title}
                  </span>
                  {getStatusBadge(req.status)}
                  {(req.status === 'SOURCED' || req.status === 'SUCCESS') && (
                    <NavLink
                      to={`/admin/catalog?newSku=${req.suggestedSku || req.id}&name=${encodeURIComponent(title)}&cost=${req.targetPrice || 5}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 transition-colors"
                    >
                      Add to Store <ArrowRight className="w-2.5 h-2.5" />
                    </NavLink>
                  )}
                  {req.supplierNumber && (
                    <span className="text-[10px] font-mono text-slate-400">
                      #{req.supplierNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {domain}
                  </span>
                  <a
                    href={req.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:underline truncate max-w-xs font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>{req.productUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="text-right shrink-0">
                {req.targetPrice && (
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    Target: ${Number(req.targetPrice).toFixed(2)}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-medium">
                  Est. {req.estimatedDailyOrders || 10} orders/day
                </div>
              </div>
            </div>

            {req.notes && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
                "{req.notes}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
