import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { shippingService, ShippingOption } from '../services/shippingService.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { useNotification } from '../context/NotificationContext.js';
import { Truck, Globe, ShieldCheck } from 'lucide-react';
import { ShippingHowItWorks } from '../components/modules/shipping/ShippingHowItWorks.js';
import { ShippingSummaryStats } from '../components/modules/shipping/ShippingSummaryStats.js';
import { ShippingOptionCard } from '../components/modules/shipping/ShippingOptionCard.js';
import { ShippingProfitCalculator } from '../components/modules/shipping/ShippingProfitCalculator.js';
import { ShippingFilterTabs, ShippingFilterType } from '../components/modules/shipping/ShippingFilterTabs.js';
import { ShippingProductPicker, SelectedProductInfo } from '../components/modules/shipping/ShippingProductPicker.js';

const COUNTRIES = [
  { code: 'US', name: 'United States 🇺🇸' },
  { code: 'GB', name: 'United Kingdom 🇬🇧' },
  { code: 'CA', name: 'Canada 🇨🇦' },
  { code: 'AU', name: 'Australia 🇦🇺' },
  { code: 'DE', name: 'Germany 🇩🇪' },
  { code: 'FR', name: 'France 🇫🇷' },
  { code: 'IT', name: 'Italy 🇮🇹' },
  { code: 'ES', name: 'Spain 🇪🇸' },
];

export const ShippingPage: React.FC = () => {
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();
  const [country, setCountry] = useState(searchParams.get('country')?.toUpperCase() || 'US');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProductInfo>({
    vid: searchParams.get('vid') || '2610300340461623900',
    name: 'RGB Atmosphere Lamp',
    cost: 8.5,
  });
  const [customVid, setCustomVid] = useState(searchParams.get('vid') || '');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingOption | null>(null);
  const [filter, setFilter] = useState<ShippingFilterType>('all');

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const results = await shippingService.calculateFreight({
        startCountryCode: 'CN',
        endCountryCode: country,
        products: [{
          vid: selectedProduct.vid,
          pid: selectedProduct.pid,
          sku: selectedProduct.sku,
          quantity: Number(quantity) || 1,
        }],
      });
      setRates(results);
      if (results.length > 0) {
        setSelectedRate(results[0]);
      }
      showToast('success', 'Rates Calculated', `Found ${results.length} live carrier lines for ${country}`);
    } catch (err: any) {
      showToast('error', 'Calculation Failed', err.message || 'Unable to fetch shipping rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [country, selectedProduct.vid, selectedProduct.pid]);

  const filteredRates = useMemo(() => {
    return rates.filter((r) => {
      if (filter === 'fast') return (r.maxDays ?? 20) <= 9;
      if (filter === 'postal') return r.carrierCategory === 'postal' || /usps|postal/i.test(r.logisticName);
      if (filter === 'express') return r.carrierCategory === 'express' || /dhl|express/i.test(r.logisticName);
      if (filter === 'budget') return r.totalFee < 20;
      return true;
    });
  }, [rates, filter]);

  const filterCounts = useMemo(() => ({
    all: rates.length,
    fast: rates.filter((r) => (r.maxDays ?? 20) <= 9).length,
    postal: rates.filter((r) => r.carrierCategory === 'postal' || /usps|postal/i.test(r.logisticName)).length,
    express: rates.filter((r) => r.carrierCategory === 'express' || /dhl|express/i.test(r.logisticName)).length,
    budget: rates.filter((r) => r.totalFee < 20).length,
  }), [rates]);

  return (
    <PageContainer
      title="Shipping & Freight Calculator"
      subtitle="Check live carrier delivery speeds, supplier freight costs, and customer retail profit margins"
    >
      <ShippingHowItWorks />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Globe className="w-4 h-4 text-teal-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Destination & Product</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs font-medium"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <ShippingProductPicker
              selectedProduct={selectedProduct}
              onProductChange={setSelectedProduct}
              customVid={customVid}
              onCustomVidChange={setCustomVid}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order Quantity</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <Button variant="primary" className="w-full" isLoading={loading} onClick={handleCalculate}>
              <Truck className="w-3.5 h-3.5" /> Recalculate Live Rates
            </Button>
          </Card>

          {selectedRate && (
            <ShippingProfitCalculator
              productCost={selectedProduct.cost * quantity}
              shippingFee={selectedRate.totalFee}
              carrierName={selectedRate.logisticName}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <ShippingSummaryStats rates={rates} countryCode={country} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-600" />
              Available Shipping Carriers {rates.length > 0 && `(${rates.length})`}
            </h2>
            <ShippingFilterTabs
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={filterCounts}
            />
          </div>

          {filteredRates.length === 0 && !loading && (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No matching carriers found for this filter.</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-xs text-teal-600 font-bold hover:underline"
              >
                Reset filters to see all {rates.length} lines
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRates.map((rate) => (
              <ShippingOptionCard
                key={rate.logisticName}
                rate={rate}
                isSelected={selectedRate?.logisticName === rate.logisticName}
                onSelect={() => setSelectedRate(rate)}
              />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
