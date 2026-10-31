import React, { useState, useEffect } from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { catalogService } from '../../../services/catalogService.js';
import { PricingFormulaResult } from '../../../types/catalog.types.js';
import { Calculator, TrendingUp, DollarSign, Percent, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PricingSimulatorCardProps {
  multiplier: number;
  buffer: number;
  charmPricing: boolean;
  minMarginPercent: number;
}

export const PricingSimulatorCard: React.FC<PricingSimulatorCardProps> = ({
  multiplier,
  buffer,
  charmPricing,
  minMarginPercent,
}) => {
  const [baseCost, setBaseCost] = useState<number>(12.0);
  const [shippingCost, setShippingCost] = useState<number>(4.2);
  const [result, setResult] = useState<PricingFormulaResult>({
    sellingPrice: 43.99,
    baseCost: 12.0,
    shippingCost: 4.2,
    multiplier: 2.5,
    buffer: 3.0,
    profitMarginUsd: 27.79,
    marginPercent: 63.2,
  });

  useEffect(() => {
    catalogService.calculatePricePreview({
      baseCost,
      shippingCost,
      multiplier,
      buffer,
      charmPricing,
    }).then(setResult).catch(() => {
      const totalCost = baseCost + shippingCost;
      let rawSellingPrice = totalCost * multiplier + buffer;
      if (charmPricing) rawSellingPrice = Math.floor(rawSellingPrice) + 0.99;
      const sellingPrice = Math.round(rawSellingPrice * 100) / 100;
      const profitMarginUsd = Math.round((sellingPrice - totalCost) * 100) / 100;
      const marginPercent = sellingPrice > 0 ? Math.round((profitMarginUsd / sellingPrice) * 10000) / 100 : 0;
      setResult({ sellingPrice, baseCost, shippingCost, multiplier, buffer, profitMarginUsd, marginPercent });
    });
  }, [baseCost, shippingCost, multiplier, buffer, charmPricing]);

  const isHealthyMargin = result.marginPercent >= minMarginPercent;

  return (
    <Card className="p-5 border-slate-200 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 shadow-2xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Live Price & Profit Simulator</h3>
            <p className="text-[11px] text-slate-500">Test how your rules calculate retail prices for any product</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
          Formula: ({multiplier}x) + ${buffer.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Sample Product Cost ($)"
          type="number"
          step="0.1"
          min="0.1"
          value={baseCost}
          onChange={(e) => setBaseCost(Math.max(0.01, Number(e.target.value) || 0))}
        />
        <Input
          label="Sample Shipping Fee ($)"
          type="number"
          step="0.1"
          min="0"
          value={shippingCost}
          onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200">
          <div className="flex items-center justify-between text-teal-800 text-[11px] font-bold uppercase">
            <span>Customer Retail Price</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {formatCurrency(result.sellingPrice)}
          </div>
          <p className="text-[10px] text-teal-700 mt-0.5">Price on your storefront</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase">
            <span>Net Profit per Sale</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1 font-mono">
            {formatCurrency(result.profitMarginUsd)}
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5">In your pocket after costs</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-700 text-[11px] font-bold uppercase">
            <span>Profit Margin</span>
            <Percent className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {result.marginPercent.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Margin percentage</p>
        </div>
      </div>

      {/* Safety Margin Alert */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isHealthyMargin ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          {isHealthyMargin ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">
            {isHealthyMargin
              ? `Healthy Margin: Exceeds your ${minMarginPercent}% target threshold.`
              : `Margin Warning: Below your ${minMarginPercent}% target threshold. Consider increasing multiplier.`}
          </span>
        </div>
      </div>
    </Card>
  );
};
