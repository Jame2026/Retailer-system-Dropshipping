import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { PricingCalculator } from '../components/modules/catalog/PricingCalculator.js';
import { Card } from '../components/common/Card.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { useNotification } from '../context/NotificationContext.js';
import { Sparkles, Save, CheckCircle } from 'lucide-react';

export const PricingRulesPage: React.FC = () => {
  const { showToast } = useNotification();
  const [globalMultiplier, setGlobalMultiplier] = useState(2.5);
  const [shippingBuffer, setShippingBuffer] = useState(3.0);
  const [charmPricingEnabled, setCharmPricingEnabled] = useState(true);
  const [minMarginPercent, setMinMarginPercent] = useState(40.0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRules = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('success', 'Rules Applied', 'Global markup rules and charm pricing applied to all unmapped catalog items.');
    }, 800);
  };

  return (
    <PageContainer
      title="Global Pricing Formula & Markup Rules"
      subtitle="Configure default retail markup multipliers, shipping buffers, and psychological charm pricing"
      action={
        <Button variant="primary" size="sm" onClick={handleSaveRules} isLoading={isSaving}>
          <Save className="w-3.5 h-3.5" />
          Save Global Formula
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Formula Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          <PricingCalculator
            initialBaseCost={12.0}
            initialShippingCost={4.2}
            initialMultiplier={globalMultiplier}
            initialBuffer={shippingBuffer}
          />

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Formula Breakdown & Safety Thresholds
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-200">Global Markup Multiplier</p>
                <p className="text-xs text-slate-400">
                  Applied as <span className="text-teal-400 font-mono">Cost × {globalMultiplier}x</span> to cover ad spend (ROAS) and overheads.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-200">Shipping Buffer ($ USD)</p>
                <p className="text-xs text-slate-400">
                  Fixed <span className="text-teal-400 font-mono">+${shippingBuffer.toFixed(2)}</span> buffer added to guard against weight discrepancies and remote area surcharges.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Global Settings Controls */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white">Default Rule Parameters</h3>

            <div className="space-y-4">
              <Input
                label="Default Markup Multiplier (x)"
                type="number"
                step="0.1"
                value={globalMultiplier}
                onChange={(e) => setGlobalMultiplier(Number(e.target.value))}
              />

              <Input
                label="Safety Shipping Buffer ($ USD)"
                type="number"
                step="0.5"
                value={shippingBuffer}
                onChange={(e) => setShippingBuffer(Number(e.target.value))}
              />

              <Input
                label="Minimum Acceptable Margin (%)"
                type="number"
                step="1"
                value={minMarginPercent}
                onChange={(e) => setMinMarginPercent(Number(e.target.value))}
                helperText="Orders with margins below this trigger MANUAL_REVIEW"
              />

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={charmPricingEnabled}
                    onChange={(e) => setCharmPricingEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500 bg-slate-950 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Charm Pricing ($0.99 ending)</span>
                    <p className="text-[11px] text-slate-400">Automatically round $32.40 → $32.99</p>
                  </div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
