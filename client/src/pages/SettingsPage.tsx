import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/common/Button.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { useNotification } from '../context/NotificationContext.js';
import { useAuth } from '../context/AuthContext.js';
import { authService, DynamicSettings } from '../services/authService.js';
import { catalogService } from '../services/catalogService.js';
import { PricingRulesDTO } from '../types/catalog.types.js';
import { Save, Sliders, Webhook, Shield, Layers } from 'lucide-react';
import { LoginSecurityCard } from '../components/modules/settings/LoginSecurityCard.js';
import { ApiCredentialsCards } from '../components/modules/settings/ApiCredentialsCards.js';
import { BackgroundWorkersCard } from '../components/modules/settings/BackgroundWorkersCard.js';
import { PricingAutomationCard } from '../components/modules/settings/PricingAutomationCard.js';

export const SettingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cjKey, setCjKey] = useState('');
  const [cjEmail, setCjEmail] = useState('');
  const [zendropKey, setZendropKey] = useState('');
  const [shopifyDomain, setShopifyDomain] = useState('your-store.myshopify.com');
  const [balanceAlertThreshold, setBalanceAlertThreshold] = useState(100.0);
  const [saving, setSaving] = useState(false);
  const [applyingPricing, setApplyingPricing] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'formula' | 'api' | 'security'>('all');

  const [pricingRules, setPricingRules] = useState<PricingRulesDTO>({
    globalMultiplier: 2.5, shippingBuffer: 3.0, charmPricingEnabled: true, charmCents: 0.99,
    minMarginPercent: 40.0, holdDurationMinutes: 30, autoDispatchEnabled: true,
    maxAutoFulfillAmount: 300.0, lowBalanceThreshold: 100.0, currencySymbol: '$',
    shopifyDomain: 'your-store.myshopify.com',
  });

  const [security, setSecurity] = useState<DynamicSettings | null>(null);
  const [securityForm, setSecurityForm] = useState<DynamicSettings | null>(null);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const isSuperadmin = user?.role === 'superadmin';

  useEffect(() => {
    authService.getSettings().then((s) => { setSecurity(s); setSecurityForm(s); }).catch(() => {});
    catalogService.getPricingRules().then((r) => {
      if (!r) return;
      setPricingRules(r);
      if (r.shopifyDomain) setShopifyDomain(r.shopifyDomain);
      if (r.lowBalanceThreshold) setBalanceAlertThreshold(r.lowBalanceThreshold);
      if (r.cjApiKey) setCjKey(r.cjApiKey);
      if (r.cjEmail) setCjEmail(r.cjEmail);
      if (r.zendropKey) setZendropKey(r.zendropKey);
    }).catch(() => {});
    catalogService.getMappings(1, 1).then((res) => { if (res?.total) setTotalProducts(res.total); }).catch(() => {});
  }, []);

  const setField = <K extends keyof DynamicSettings>(key: K, value: DynamicSettings[K]) => {
    setSecurityForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSaveSecurity = async () => {
    if (!securityForm || !security) return;
    setSavingSecurity(true);
    try {
      const changed: Partial<DynamicSettings> = {};
      (Object.keys(security) as Array<keyof DynamicSettings>).forEach((k) => {
        if (security[k] !== securityForm[k]) (changed as Record<string, unknown>)[k] = securityForm[k];
      });
      if (Object.keys(changed).length > 0) {
        const updated = await authService.updateSettings(changed);
        setSecurity(updated);
        setSecurityForm(updated);
      }
    } finally { setSavingSecurity(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await catalogService.savePricingRules({
        ...pricingRules, shopifyDomain, lowBalanceThreshold: balanceAlertThreshold,
        cjApiKey: cjKey, cjEmail, zendropKey,
      });
      if (securityForm && security) await handleSaveSecurity();
      showToast('success', 'Settings Saved', 'System rules, API credentials, and pricing formula updated.');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Unable to save settings');
    } finally { setSaving(false); }
  };

  const handleApplyToAll = async () => {
    setApplyingPricing(true);
    try {
      const res = await catalogService.savePricingRules({
        ...pricingRules, shopifyDomain, lowBalanceThreshold: balanceAlertThreshold,
        cjApiKey: cjKey, cjEmail, zendropKey, applyToExistingMappings: true,
      });
      showToast('success', 'Formula Applied', `Recalculated prices for ${res.updatedCount ?? totalProducts} catalog products!`);
    } catch (err: any) {
      showToast('error', 'Failed to apply', err.message);
    } finally { setApplyingPricing(false); }
  };

  const confirmSignOut = () => {
    setConfirmOut(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <PageContainer
      title="System Settings"
      subtitle="Customize pricing formulas, fulfillment buffers, API credentials, and security policies"
      action={
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          <Save className="w-3.5 h-3.5 mr-1" />
          Save All Settings
        </Button>
      }
    >
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: 'All Settings', icon: Layers },
          { id: 'formula', label: 'Formula & Automation', icon: Sliders },
          { id: 'api', label: 'API & Webhooks', icon: Webhook },
          { id: 'security', label: 'Security & Access', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                active ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {(activeTab === 'all' || activeTab === 'formula') && (
          <PricingAutomationCard
            rules={pricingRules}
            onChangeRules={setPricingRules}
            onApplyToAll={handleApplyToAll}
            applyingToAll={applyingPricing}
            totalProducts={totalProducts}
          />
        )}

        {(activeTab === 'all' || activeTab === 'api') && (
          <ApiCredentialsCards
            shopifyDomain={shopifyDomain} setShopifyDomain={setShopifyDomain}
            cjEmail={cjEmail} setCjEmail={setCjEmail} cjKey={cjKey} setCjKey={setCjKey}
            balanceAlertThreshold={balanceAlertThreshold} setBalanceAlertThreshold={setBalanceAlertThreshold}
            zendropKey={zendropKey} setZendropKey={setZendropKey}
          />
        )}

        {(activeTab === 'all' || activeTab === 'security') && (
          <LoginSecurityCard
            security={security} securityForm={securityForm} setField={setField}
            isSuperadmin={isSuperadmin} savingSecurity={savingSecurity}
            onSaveSecurity={handleSaveSecurity} onReset={() => setSecurityForm(security)}
            onSignOut={() => setConfirmOut(true)}
          />
        )}

        {(activeTab === 'all' || activeTab === 'api') && <BackgroundWorkersCard />}
      </div>

      <ConfirmDialog
        open={confirmOut} title="Sign out of dashboard?"
        message="Your session token will be cleared from this browser."
        confirmLabel="Sign out" cancelLabel="Cancel" destructive
        onCancel={() => setConfirmOut(false)} onConfirm={confirmSignOut}
      />
    </PageContainer>
  );
};
