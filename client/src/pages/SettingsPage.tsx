import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Card } from '../components/common/Card.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { useNotification } from '../context/NotificationContext.js';
import { Key, Shield, Webhook, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [cjKey, setCjKey] = useState('********************************');
  const [cjEmail, setCjEmail] = useState('partner@example.com');
  const [zendropKey, setZendropKey] = useState('********************************');
  const [shopifyDomain, setShopifyDomain] = useState('your-store.myshopify.com');
  const [balanceAlertThreshold, setBalanceAlertThreshold] = useState(100.0);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('success', 'Settings Saved', 'API credentials and alert thresholds updated.');
    }, 600);
  };

  return (
    <PageContainer
      title="Integrations & System Settings"
      subtitle="Manage Shopify API keys, CJ Dropshipping tokens, and supplier wallet alerts"
      action={
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          <Save className="w-3.5 h-3.5" />
          Save Configurations
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shopify Configuration */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Webhook className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Shopify Store Webhooks</h3>
          </div>

          <div className="space-y-3">
            <Input
              label="Shopify Store Domain"
              value={shopifyDomain}
              onChange={(e) => setShopifyDomain(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Webhook Endpoint
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-teal-800 select-all">
                https://api.yourdomain.com/webhooks/shopify/orders-paid
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                HMAC SHA256 verified raw body listener mounted.
              </p>
            </div>
          </div>
        </Card>

        {/* CJ Dropshipping API */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Key className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">CJ Dropshipping Credentials</h3>
          </div>

          <div className="space-y-3">
            <Input
              label="CJ Account Email"
              value={cjEmail}
              onChange={(e) => setCjEmail(e.target.value)}
            />
            <Input
              label="CJ API Key"
              type="password"
              value={cjKey}
              onChange={(e) => setCjKey(e.target.value)}
            />
            <Input
              label="Wallet Low-Balance Alert ($ USD)"
              type="number"
              value={balanceAlertThreshold}
              onChange={(e) => setBalanceAlertThreshold(Number(e.target.value))}
            />
          </div>
        </Card>

        {/* Zendrop Backup Connector */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Zendrop Backup Supplier</h3>
          </div>

          <div className="space-y-3">
            <Input
              label="Zendrop API Access Token"
              type="password"
              value={zendropKey}
              onChange={(e) => setZendropKey(e.target.value)}
            />
          </div>
        </Card>

        {/* System Health */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Background Workers Status</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">holdBuffer.worker (6h timer)</span>
              <span className="text-teal-700 font-bold">● Active (2m cycle)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">trackingSync.job (USPS/CJ)</span>
              <span className="text-teal-700 font-bold">● Active (15m cycle)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-700 font-medium">retryBilling.job</span>
              <span className="text-teal-700 font-bold">● Active (1h cycle)</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
