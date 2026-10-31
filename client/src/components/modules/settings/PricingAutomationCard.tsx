import React from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { Button } from '../../common/Button.js';
import { Sliders, Clock, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { PricingRulesDTO } from '../../../types/catalog.types.js';

export interface PricingAutomationCardProps {
  rules: PricingRulesDTO;
  onChangeRules: (updated: PricingRulesDTO) => void;
  onApplyToAll: () => void;
  applyingToAll: boolean;
  totalProducts?: number;
}

export const PricingAutomationCard: React.FC<PricingAutomationCardProps> = ({
  rules,
  onChangeRules,
  onApplyToAll,
  applyingToAll,
  totalProducts = 0,
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">Pricing Formula & Order Automation</h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          Dynamic Config
        </span>
      </div>

      <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-teal-900">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Active Retail Formula
          </span>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800">
            (Cost + Ship) × {rules.globalMultiplier}x + ${rules.shippingBuffer}
            {rules.charmPricingEnabled ? ` → .${Math.round((rules.charmCents ?? 0.99) * 100)}` : ''}
          </span>
        </div>
        <p className="text-[11px] text-teal-700">
          This formula dynamically prices wholesale products across your storefront and catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Default Multiplier (e.g. 2.5x)"
          type="number"
          step="0.1"
          min="1.0"
          value={rules.globalMultiplier}
          onChange={(e) => onChangeRules({ ...rules, globalMultiplier: Number(e.target.value) || 1.0 })}
          helperText="Markup over wholesale cost"
        />

        <Input
          label="Shipping Cushion Buffer ($ USD)"
          type="number"
          step="0.5"
          min="0"
          value={rules.shippingBuffer}
          onChange={(e) => onChangeRules({ ...rules, shippingBuffer: Number(e.target.value) || 0 })}
          helperText="Freight safety cushion"
        />

        <Input
          label="Minimum Margin Alert (%)"
          type="number"
          step="1"
          min="10"
          max="90"
          value={rules.minMarginPercent}
          onChange={(e) => onChangeRules({ ...rules, minMarginPercent: Number(e.target.value) || 10 })}
          helperText="Safety alert threshold"
        />

        <Input
          label="Order Hold Buffer (Minutes)"
          type="number"
          step="5"
          min="0"
          max="1440"
          value={rules.holdDurationMinutes ?? 30}
          onChange={(e) => onChangeRules({ ...rules, holdDurationMinutes: Number(e.target.value) || 0 })}
          helperText="Cancellation grace window"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Input
          label="Max Auto-Dispatch Ceiling ($ USD)"
          type="number"
          step="25"
          min="20"
          value={rules.maxAutoFulfillAmount ?? 300}
          onChange={(e) => onChangeRules({ ...rules, maxAutoFulfillAmount: Number(e.target.value) || 50 })}
          helperText="Orders above this require review"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Psychological Charm Ending
          </label>
          <select
            value={rules.charmPricingEnabled ? String(rules.charmCents ?? 0.99) : 'off'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'off') {
                onChangeRules({ ...rules, charmPricingEnabled: false });
              } else {
                onChangeRules({ ...rules, charmPricingEnabled: true, charmCents: Number(val) });
              }
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="0.99">End in .99 (e.g. $29.99 - Most Common)</option>
            <option value="0.95">End in .95 (e.g. $29.95 - Retail Standard)</option>
            <option value="0.00">End in .00 (e.g. $30.00 - Flat Integer)</option>
            <option value="off">Disabled (Exact Calculated Cents)</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">Converts prices for maximum retail trust.</p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rules.autoDispatchEnabled ?? true}
            onChange={(e) => onChangeRules({ ...rules, autoDispatchEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-300"
          />
          <div>
            <span className="text-xs font-bold text-slate-800">Auto-Dispatch Verified Orders</span>
            <p className="text-[10px] text-slate-400">Routes to CJ Dropshipping after hold expires</p>
          </div>
        </label>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onApplyToAll}
          isLoading={applyingToAll}
          className="text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Apply to All {totalProducts ? `(${totalProducts})` : ''} Products
        </Button>
      </div>
    </Card>
  );
};
