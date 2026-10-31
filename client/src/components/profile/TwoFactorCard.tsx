import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../common/Card.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { ShieldCheck, AlertTriangle, RefreshCw, QrCode, Copy, Check, X } from 'lucide-react';

export interface TwoFactorCardProps {
  enabled: boolean;
  onChanged: () => void | Promise<void>;
}

export const TwoFactorCard: React.FC<TwoFactorCardProps> = ({ enabled, onChanged }) => {
  const { showToast } = useNotification();
  const [disableOtp, setDisableOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [setupData, setSetupData] = useState<{ setupToken: string; secret: string; otpauthUri: string } | null>(null);
  const [enableOtp, setEnableOtp] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [tab, setTab] = useState<'disable' | 'reset'>('disable');

  const handleStartSetup = async () => {
    setBusy(true);
    try { setSetupData(await authService.initiate2fa()); }
    catch (err) { showToast('error', 'Setup failed', err instanceof Error ? err.message : ''); }
    finally { setBusy(false); }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;
    setBusy(true);
    try {
      await authService.enable2fa(setupData.setupToken, enableOtp.trim());
      showToast('success', 'Two-Factor Activated', 'Your account is protected.');
      setSetupData(null);
      setEnableOtp('');
      await onChanged();
    } catch (err) {
      showToast('error', 'Verification failed', err instanceof Error ? err.message : 'Invalid code');
    } finally { setBusy(false); }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.disable2fa(disableOtp.trim());
      showToast('success', 'Two-factor disabled', 'You will set it up again next login.');
      setDisableOtp('');
      await onChanged();
    } catch (err) {
      showToast('error', 'Could not disable 2FA', err instanceof Error ? err.message : '');
    } finally { setBusy(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.reset2fa(resetPassword);
      showToast('success', 'Two-factor reset', 'Authenticator unlinked.');
      setResetPassword('');
      await onChanged();
    } catch (err) {
      showToast('error', 'Reset failed', err instanceof Error ? err.message : '');
    } finally { setBusy(false); }
  };

  const copySecret = async () => {
    if (!setupData?.secret) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    showToast('success', 'Secret copied', 'Paste it into your authenticator app.');
  };

  return (
    <Card className="space-y-4 border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${enabled ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
            <p className="text-xs text-slate-500">Protect account with TOTP codes</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
          enabled ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {enabled ? 'Active' : 'Disabled'}
        </span>
      </div>

      {!enabled ? (
        setupData ? (
          <form onSubmit={handleEnable} className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-slate-600">Scan QR with Google Authenticator or Authy, then enter code.</p>
            <div className="flex justify-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <QRCodeSVG value={setupData.otpauthUri} size={135} level="M" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <code className="flex-1 font-mono text-[11px] text-slate-700 break-all">{setupData.secret}</code>
              <button type="button" onClick={copySecret} className="text-slate-500 hover:text-slate-700 p-1">
                {copiedSecret ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <Input
              label="6-Digit Verification Code"
              inputMode="numeric"
              maxLength={8}
              value={enableOtp}
              onChange={(e) => setEnableOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="text-center font-mono tracking-[0.3em]"
            />
            <div className="flex gap-2">
              <Button variant="ghost" type="button" onClick={() => setSetupData(null)} disabled={busy} className="flex-1">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button type="submit" isLoading={busy} disabled={enableOtp.length < 6} className="flex-1">
                <Check className="w-4 h-4" /> Activate 2FA
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Account Vulnerable
              </p>
              <p>Two-factor is off. Enhance your store security by linking your mobile authenticator app.</p>
            </div>
            <Button onClick={handleStartSetup} isLoading={busy} className="w-full">
              <QrCode className="w-4 h-4" /> Set Up Two-Factor Now
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
            <button type="button" onClick={() => setTab('disable')} className={`flex-1 py-1 rounded-md font-medium transition-colors ${tab === 'disable' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Turn Off 2FA</button>
            <button type="button" onClick={() => setTab('reset')} className={`flex-1 py-1 rounded-md font-medium transition-colors ${tab === 'reset' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Emergency Reset</button>
          </div>

          {tab === 'disable' ? (
            <form onSubmit={handleDisable} className="space-y-3">
              <p className="text-xs text-slate-500">Enter code from your authenticator app to disable 2FA.</p>
              <Input
                label="Authenticator Code"
                inputMode="numeric"
                maxLength={8}
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center font-mono tracking-[0.3em]"
              />
              <Button type="submit" variant="secondary" className="w-full" isLoading={busy} disabled={disableOtp.length < 6}>
                Disable Two-Factor
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <p className="text-xs text-slate-500">Lost device? Reset 2FA with your account password.</p>
              <Input
                label="Account Password"
                type="password"
                autoComplete="current-password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <Button type="submit" variant="danger" className="w-full" isLoading={busy} disabled={!resetPassword}>
                <RefreshCw className="w-3.5 h-3.5" /> Reset 2FA via Password
              </Button>
            </form>
          )}
        </div>
      )}
    </Card>
  );
};

export default TwoFactorCard;
