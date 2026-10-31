import React from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { Button } from '../../common/Button.js';
import { Save, Settings2, Sliders } from 'lucide-react';

interface PricingSettingsFormProps {
  multiplier: number;
  onMultiplierChange: (val: number) => void;
  buffer: number;
  onBufferChange: (val: number) => void;
  charmPricing: boolean;
  onCharmPricingChange: (val: boolean) => void;
  minMargin: number;
  onMinMarginChange: (val: number) => void;
  applyToExisting: boolean;
  onApplyToExistingChange: (val: boolean) => void;
  totalProducts?: number;
  onSave: () => void;
  isSaving: boolean;
}

export const PricingSettingsForm: React.FC<PricingSettingsFormProps> = ({
  multiplier,
  onMultiplierChange,
  buffer,
  onBufferChange,
  charmPricing,
  onCharmPricingChange,
  minMargin,
  onMinMarginChange,
  applyToExisting,
  onApplyToExistingChange,
  totalProducts,
  onSave,
  isSaving,
}) => {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Settings2 className="w-4 h-4 text-teal-600" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Global Pricing Configuration
        </h3>
      </div>

      <div className="space-y-3.5">
        <Input
          label="Price Multiplier (Markup)"
          type="number"
          step="0.1"
          min="1.0"
          value={multiplier}
          onChange={(e) => onMultiplierChange(Math.max(1, Number(e.target.value) || 1))}
          helperText="Multiplies landed cost (e.g. 2.5x covers ads and profit)"
        />

        <Input
          label="Extra Shipping Buffer ($ USD)"
          type="number"
          step="0.5"
          min="0"
          value={buffer}
          onChange={(e) => onBufferChange(Math.max(0, Number(e.target.value) || 0))}
          helperText="Safety cushion against supplier freight price changes"
        />

        <Input
          label="Minimum Margin Threshold (%)"
          type="number"
          step="1"
          min="10"
          max="95"
          value={minMargin}
          onChange={(e) => onMinMarginChange(Math.max(10, Number(e.target.value) || 10))}
          helperText="Orders below this margin will show safety alerts"
        />

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={charmPricing}
              onChange={(e) => onCharmPricingChange(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Charm Pricing (.99 endings)</span>
              <p className="text-[11px] text-slate-500 leading-snug">
                Rounds $24.40 to $24.99 for psychological pricing
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToExisting}
              onChange={(e) => onApplyToExistingChange(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Apply to all {totalProducts ? `${totalProducts} ` : ''}catalog items now
              </span>
              <p className="text-[11px] text-slate-500 leading-snug">
                Recalculates selling prices (.99 charm) across all active products immediately
              </p>
            </div>
          </label>
        </div>

        <Button variant="primary" className="w-full mt-2" isLoading={isSaving} onClick={onSave}>
          <Save className="w-3.5 h-3.5" /> Save & Apply Pricing Rules
        </Button>
      </div>
    </Card>
  );
};
