import React, { useState, useEffect } from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { Button } from '../../common/Button.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { catalogService } from '../../../services/catalogService.js';
import { PricingFormulaResult } from '../../../types/catalog.types.js';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

export interface PricingCalculatorProps {
  initialBaseCost?: number;
  initialShippingCost?: number;
  initialMultiplier?: number;
  initialBuffer?: number;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  initialBaseCost = 15.0,
  initialShippingCost = 4.5,
  initialMultiplier = 2.5,
  initialBuffer = 3.0,
}) => {
  const [baseCost, setBaseCost] = useState<number>(initialBaseCost);
  const [shippingCost, setShippingCost] = useState<number>(initialShippingCost);
  const [multiplier, setMultiplier] = useState<number>(initialMultiplier);
  const [buffer, setBuffer] = useState<number>(initialBuffer);

  const [result, setResult] = useState<PricingFormulaResult>({
    sellingPrice: ((initialBaseCost + initialShippingCost) * initialMultiplier) + initialBuffer,
    baseCost: initialBaseCost,
    shippingCost: initialShippingCost,
    multiplier: initialMultiplier,
    buffer: initialBuffer,
    profitMarginUsd:
      ((initialBaseCost + initialShippingCost) * initialMultiplier + initialBuffer) -
      (initialBaseCost + initialShippingCost),
    marginPercent: 55.5,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calc = async () => {
      try {
        setLoading(true);
        const data = await catalogService.calculatePricePreview({
          baseCost,
          shippingCost,
          multiplier,
          buffer,
        });
        setResult(data);
      } catch {
        // Local calculation fallback
        const totalCost = baseCost + shippingCost;
        const sellingPrice = Math.round((totalCost * multiplier + buffer) * 100) / 100;
        const profitMarginUsd = Math.round((sellingPrice - totalCost) * 100) / 100;
        const marginPercent = sellingPrice > 0 ? Math.round((profitMarginUsd / sellingPrice) * 10000) / 100 : 0;
        setResult({
          sellingPrice,
          baseCost,
          shippingCost,
          multiplier,
          buffer,
          profitMarginUsd,
          marginPercent,
        });
      } finally {
        setLoading(false);
      }
    };

    calc();
  }, [baseCost, shippingCost, multiplier, buffer]);

  return (
    <Card className="p-6 border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Dynamic Markup Formula Calculator</h3>
            <p className="text-xs text-slate-400">
              Formula: <span className="font-mono text-teal-300">Selling Price = ((Cost + Shipping) × Multiplier) + Buffer</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Base Product Cost ($)"
          type="number"
          step="0.01"
          value={baseCost}
          onChange={(e) => setBaseCost(Number(e.target.value))}
        />
        <Input
          label="Est. Shipping Cost ($)"
          type="number"
          step="0.01"
          value={shippingCost}
          onChange={(e) => setShippingCost(Number(e.target.value))}
        />
        <Input
          label="Markup Multiplier (x)"
          type="number"
          step="0.1"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
        />
        <Input
          label="Shipping Buffer ($)"
          type="number"
          step="0.5"
          value={buffer}
          onChange={(e) => setBuffer(Number(e.target.value))}
        />
      </div>

      {/* Output Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30">
          <div className="flex items-center justify-between text-teal-400 text-xs font-semibold uppercase">
            <span>Recommended Price</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">
            {formatCurrency(result.sellingPrice)}
          </div>
          <p className="text-[11px] text-teal-300/80 mt-1">Suggested Shopify Retail Tag</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Net Profit per Unit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {formatCurrency(result.profitMarginUsd)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">After total cost deduction</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Profit Margin</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">
            {result.marginPercent.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Gross Margin Percentage</p>
        </div>
      </div>
    </Card>
  );
};
