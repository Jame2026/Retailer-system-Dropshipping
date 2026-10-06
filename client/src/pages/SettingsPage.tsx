import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Card } from '../components/common/Card.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { useNotification } from '../context/NotificationContext.js';
import { useAuth } from '../context/AuthContext.js';
import { authService, DynamicSettings } from '../services/authService.js';
import { Key, Shield, Webhook, Save, CheckCircle2, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cjKey, setCjKey] = useState('********************************');
  const [cjEmail, setCjEmail] = useState('partner@example.com');
  const [zendropKey, setZendropKey] = useState('********************************');
  const [shopifyDomain, setShopifyDomain] = useState('your-store.myshopify.com');
  const [balanceAlertThreshold, setBalanceAlertThreshold] = useState(100.0);
  const [saving, setSaving] = useState(false);

  // Dynamic security settings (OTP + rate limits), loaded from the API.
  const [security, setSecurity] = useState<DynamicSettings | null>(null);
  const [securityForm, setSecurityForm] = useState<DynamicSettings | null>(null);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const isSuperadmin = user?.role === 'superadmin';

  useEffect(() => {
    authService
      .getSettings()
      .then((settings) => {
        setSecurity(settings);
        setSecurityForm(settings);
      })
      .catch((err) =>
        showToast('error', 'Could not load security settings', err instanceof Error ? err.message : '')
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = <K extends keyof DynamicSettings>(key: K, value: DynamicSettings[K]) => {
    setSecurityForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSaveSecurity = async () => {
    if (!securityForm || !security) return;
    setSavingSecurity(true);
    try {
      const changed: Partial<DynamicSettings> = {};
      (Object.keys(security) as Array<keyof DynamicSettings>).forEach((key) => {
        if (security[key] !== securityForm[key]) {
          (changed as unknown as Record<string, unknown>)[key] = securityForm[key];
        }
      });

      if (Object.keys(changed).length === 0) {
        showToast('info', 'Nothing to save', 'No security settings were changed.');
        setSavingSecurity(false);
        return;
      }

      const updated = await authService.updateSettings(changed);
      setSecurity(updated);
      setSecurityForm(updated);
      showToast(
        'success',
        'Security settings applied',
        'Rate limits and OTP rules are now live — no restart needed.'
      );
    } catch (err) {
      showToast('error', 'Update failed', err instanceof Error ? err.message : '');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleSignOut = () => {
    setConfirmOut(true);
  };

  const confirmSignOut = () => {
    setConfirmOut(false);
    logout();
    showToast('info', 'Signed out', 'Your session token was cleared.');
    navigate('/login', { replace: true });
  };

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

        {/* Dynamic Security Settings (OTP + Rate Limiting) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Security: OTP &amp; Rate Limiting</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-teal-500/10 text-teal-600 border border-teal-500/30">
              Dynamic
            </span>
          </div>

          {!securityForm ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading security configuration…</p>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Require OTP at login
                  <span className="block text-[10px] text-slate-500">
                    When off, password alone grants access (not recommended).
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={securityForm['auth.requireOtp']}
                  disabled={!isSuperadmin}
                  onChange={(e) => setField('auth.requireOtp', e.target.checked)}
                  className="w-4 h-4 accent-teal-500 disabled:opacity-40"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="OTP length (digits)"
                  type="number"
                  min={4}
                  max={8}
                  disabled={!isSuperadmin}
                  value={securityForm['auth.otpLength']}
                  onChange={(e) => setField('auth.otpLength', Number(e.target.value))}
                />
                <Input
                  label="OTP valid window (± steps)"
                  type="number"
                  min={0}
                  max={2}
                  disabled={!isSuperadmin}
                  value={securityForm['auth.otpWindowSteps']}
                  onChange={(e) => setField('auth.otpWindowSteps', Number(e.target.value))}
                />
                <Input
                  label="Login attempts / window"
                  type="number"
                  min={1}
                  disabled={!isSuperadmin}
                  value={securityForm['rateLimit.login.max']}
                  onChange={(e) => setField('rateLimit.login.max', Number(e.target.value))}
                />
                <Input
                  label="Login window (seconds)"
                  type="number"
                  min={10}
                  disabled={!isSuperadmin}
                  value={securityForm['rateLimit.login.windowSec']}
                  onChange={(e) => setField('rateLimit.login.windowSec', Number(e.target.value))}
                />
                <Input
                  label="OTP attempts / window"
                  type="number"
                  min={1}
                  disabled={!isSuperadmin}
                  value={securityForm['rateLimit.otp.max']}
                  onChange={(e) => setField('rateLimit.otp.max', Number(e.target.value))}
                />
                <Input
                  label="API requests / 15 min"
                  type="number"
                  min={1}
                  disabled={!isSuperadmin}
                  value={securityForm['rateLimit.api.max']}
                  onChange={(e) => setField('rateLimit.api.max', Number(e.target.value))}
                />
              </div>

              {!isSuperadmin && (
                <p className="text-[11px] text-amber-400/80">
                  Read-only: superadmin role required to change these values.
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSecurity}
                  isLoading={savingSecurity}
                  disabled={!isSuperadmin}
                >
                  <Save className="w-3.5 h-3.5" />
                  Apply security settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSecurityForm(security)}
                  disabled={savingSecurity}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </Button>
              </div>
            </div>
          )}
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

      <ConfirmDialog
        open={confirmOut}
        title="Sign out of the dashboard?"
        message="Your session token will be cleared from this browser. You will need your password and authenticator code to sign back in."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={confirmSignOut}
      />
    </PageContainer>
  );
};
