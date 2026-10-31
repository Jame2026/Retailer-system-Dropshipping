import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { catalogService } from '../services/catalogService.js';
import { useNotification } from '../context/NotificationContext.js';
import { PricingHowItWorks } from '../components/modules/pricing/PricingHowItWorks.js';
import { PricingStrategyPresets, PricingStrategy } from '../components/modules/pricing/PricingStrategyPresets.js';
import { PricingSimulatorCard } from '../components/modules/pricing/PricingSimulatorCard.js';
import { PricingSettingsForm } from '../components/modules/pricing/PricingSettingsForm.js';

export const PricingRulesPage: React.FC = () => {
  const { showToast } = useNotification();
  const [globalMultiplier, setGlobalMultiplier] = useState(2.5);
  const [shippingBuffer, setShippingBuffer] = useState(3.0);
  const [charmPricingEnabled, setCharmPricingEnabled] = useState(true);
  const [minMarginPercent, setMinMarginPercent] = useState(40.0);
  const [applyToExisting, setApplyToExisting] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    catalogService.getPricingRules().then((rules) => {
      if (rules) {
        setGlobalMultiplier(rules.globalMultiplier);
        setShippingBuffer(rules.shippingBuffer);
        setCharmPricingEnabled(rules.charmPricingEnabled);
        setMinMarginPercent(rules.minMarginPercent);
      }
    }).catch(() => {});

    catalogService.getMappings(1, 1).then((res) => {
      if (res?.total) setTotalProducts(res.total);
    }).catch(() => {});
  }, []);

  const handleApplyStrategy = (strat: PricingStrategy) => {
    setGlobalMultiplier(strat.multiplier);
    setShippingBuffer(strat.buffer);
    setMinMarginPercent(strat.minMargin);
    showToast('info', `${strat.name} Selected`, `Applied ${strat.multiplier}x multiplier and $${strat.buffer.toFixed(2)} buffer.`);
  };

  const handleSaveRules = async () => {
    try {
      setIsSaving(true);
      const res = await catalogService.savePricingRules({
        globalMultiplier,
        shippingBuffer,
        charmPricingEnabled,
        minMarginPercent,
        applyToExistingMappings: applyToExisting,
      });

      const updatedText = res.updatedCount !== undefined
        ? `Recalculated & updated prices for ${res.updatedCount} active catalog items!`
        : 'Pricing rules updated.';

      showToast(
        'success',
        'Pricing Rules Saved',
        applyToExisting ? updatedText : 'Saved to database for upcoming product imports.'
      );
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Unable to save pricing rules.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Pricing Rules & Profit Engine"
      subtitle="Configure automated retail markups, shipping cushions, and charm pricing for your store products"
    >
      <PricingHowItWorks />

      <PricingStrategyPresets
        currentMultiplier={globalMultiplier}
        currentBuffer={shippingBuffer}
        onApplyStrategy={handleApplyStrategy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PricingSimulatorCard
            multiplier={globalMultiplier}
            buffer={shippingBuffer}
            charmPricing={charmPricingEnabled}
            minMarginPercent={minMarginPercent}
          />
        </div>

        <div>
          <PricingSettingsForm
            multiplier={globalMultiplier}
            onMultiplierChange={setGlobalMultiplier}
            buffer={shippingBuffer}
            onBufferChange={setShippingBuffer}
            charmPricing={charmPricingEnabled}
            onCharmPricingChange={setCharmPricingEnabled}
            minMargin={minMarginPercent}
            onMinMarginChange={setMinMarginPercent}
            applyToExisting={applyToExisting}
            onApplyToExistingChange={setApplyToExisting}
            totalProducts={totalProducts}
            onSave={handleSaveRules}
            isSaving={isSaving}
          />
        </div>
      </div>
    </PageContainer>
  );
};
