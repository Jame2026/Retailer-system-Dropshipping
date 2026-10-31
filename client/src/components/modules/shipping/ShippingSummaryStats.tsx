import React from 'react';
import { DollarSign, Zap, Award, Layers } from 'lucide-react';
import { ShippingOption } from '../../../services/shippingService.js';

interface ShippingSummaryStatsProps {
  rates: ShippingOption[];
  countryCode: string;
}

export const ShippingSummaryStats: React.FC<ShippingSummaryStatsProps> = ({ rates, countryCode }) => {
  if (rates.length === 0) return null;

  const lowestRate = rates[0];
  const fastestRate = rates.reduce((fastest, curr) => {
    const currMax = curr.maxDays ?? 999;
    const fastMax = fastest.maxDays ?? 999;
    return currMax < fastMax ? curr : fastest;
  }, rates[0]);

  // Recommended is typically cheapest option with delivery under 12 days
  const recommendedRate = rates.find((r) => (r.maxDays ?? 20) <= 12) || lowestRate;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-white border border-teal-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[11px] font-semibold">Lowest Freight</span>
        </div>
        <p className="text-base font-extrabold text-teal-700 font-mono">${lowestRate.totalFee.toFixed(2)}</p>
        <span className="text-[10px] text-slate-400 truncate block mt-0.5" title={lowestRate.logisticName}>
          {lowestRate.logisticName} ({lowestRate.logisticAging}d)
        </span>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-semibold">Fastest Delivery</span>
        </div>
        <p className="text-base font-extrabold text-blue-700 font-mono">{fastestRate.logisticAging} Days</p>
        <span className="text-[10px] text-slate-400 truncate block mt-0.5" title={fastestRate.logisticName}>
          {fastestRate.logisticName} (${fastestRate.totalFee.toFixed(2)})
        </span>
      </div>

      <div className="bg-white border border-amber-100 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-semibold">Recommended</span>
        </div>
        <p className="text-base font-extrabold text-slate-900 font-mono">${recommendedRate.totalFee.toFixed(2)}</p>
        <span className="text-[10px] text-slate-500 truncate block mt-0.5" title={recommendedRate.logisticName}>
          {recommendedRate.logisticName} ({recommendedRate.logisticAging}d)
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px] font-semibold">Available Lines</span>
        </div>
        <p className="text-base font-extrabold text-slate-800 font-mono">{rates.length} Carriers</p>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          To {countryCode} destination
        </span>
      </div>
    </div>
  );
};
