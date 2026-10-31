import React from 'react';
import { Clock, ShieldCheck, Check, Plane, Truck, Mail } from 'lucide-react';
import { ShippingOption } from '../../../services/shippingService.js';

interface ShippingOptionCardProps {
  rate: ShippingOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const ShippingOptionCard: React.FC<ShippingOptionCardProps> = ({
  rate,
  isSelected,
  onSelect,
}) => {
  const getCategoryIcon = () => {
    if (rate.carrierCategory === 'express') return <Plane className="w-3.5 h-3.5 text-blue-600" />;
    if (rate.carrierCategory === 'postal') return <Mail className="w-3.5 h-3.5 text-amber-600" />;
    return <Truck className="w-3.5 h-3.5 text-teal-600" />;
  };

  const getTagBadge = () => {
    if (rate.isBestValue) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">🏆 Best Value</span>;
    }
    if (rate.isFastest) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">⚡ Fastest</span>;
    }
    if (rate.carrierTag) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">{rate.carrierTag}</span>;
    }
    return null;
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-sm'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {getCategoryIcon()}
            <span className="font-bold text-xs text-slate-900 truncate" title={rate.logisticName}>
              {rate.logisticName}
            </span>
          </div>
          <div className="shrink-0">{getTagBadge()}</div>
        </div>

        <div className="space-y-1.5 mb-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Delivery: <strong className="text-slate-900 font-bold">{rate.logisticAging} days</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Door-to-door tracking included</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Supplier Freight</span>
          <span className="text-sm font-extrabold text-teal-700 font-mono">${rate.totalFee.toFixed(2)} USD</span>
        </div>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
            isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300 text-transparent hover:border-teal-500'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
