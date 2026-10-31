import React, { useState } from 'react';
import { Calculator, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface ShippingProfitCalculatorProps {
  productCost: number;
  shippingFee: number;
  carrierName?: string;
}

export const ShippingProfitCalculator: React.FC<ShippingProfitCalculatorProps> = ({
  productCost,
  shippingFee,
  carrierName,
}) => {
  const totalCost = productCost + shippingFee;
  // Suggested retail price is ~2.2x product cost + shipping + buffer, or at least $10 above total cost
  const defaultSellingPrice = Math.max(19.99, Math.ceil(totalCost * 1.5) - 0.01);
  const [sellingPrice, setSellingPrice] = useState<number>(defaultSellingPrice);

  const profit = sellingPrice - totalCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const isHealthy = profit > 5 && margin >= 25;

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Profit Impact Preview</h3>
        </div>
        {carrierName && (
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]" title={carrierName}>
            Line: {carrierName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Product</span>
          <span className="font-mono font-bold text-slate-800">${productCost.toFixed(2)}</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Freight</span>
          <span className="font-mono font-bold text-slate-800">+${shippingFee.toFixed(2)}</span>
        </div>
        <div className="p-2 bg-teal-50/80 rounded-xl border border-teal-200">
          <span className="text-[10px] text-teal-700 font-bold block">Total Landed</span>
          <span className="font-mono font-extrabold text-teal-800">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Your Customer Retail Price ($ USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
          <input
            type="number"
            step="0.5"
            min={totalCost}
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isHealthy ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="text-[11px] font-bold block">
              {profit >= 0 ? `Net Profit: +$${profit.toFixed(2)} USD` : `Loss: -$${Math.abs(profit).toFixed(2)} USD`}
            </span>
            <span className="text-[10px] opacity-80 block">
              {margin.toFixed(1)}% profit margin per order
            </span>
          </div>
        </div>
        <TrendingUp className="w-4 h-4 opacity-50 shrink-0" />
      </div>
    </div>
  );
};
