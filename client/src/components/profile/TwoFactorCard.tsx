import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export interface TwoFactorCardProps {
  enabled: boolean;

  onChanged: () => void | Promise<void>;
}

export const TwoFactorCard: React.FC<TwoFactorCardProps> = ({ enabled, onChanged }) => {
  const { showToast } = useNotification();

  const [disableOtp, setDisableOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.disable2fa(disableOtp.trim());
      showToast('success', 'Two-factor disabled', 'You will set it up again at your next login.');
      setDisableOtp('');
      await onChanged();
    } catch (err) {
      showToast('error', 'Could not disable 2FA', err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.reset2fa(resetPassword);
      showToast(
        'success',
        'Two-factor reset',
        'Authenticator unlinked — scan a new QR code at your next login.'
      );
      setResetPassword('');
      await onChanged();
    } catch (err) {
      showToast('error', 'Reset failed', err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className={`w-5 h-5 ${enabled ? 'text-teal-400' : 'text-amber-400'}`} />
          <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
            enabled
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {enabled ? 'On' : 'Off'}
        </span>
      </div>

      {!enabled ? (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
          <p className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Not protected yet
          </p>
          <p>
            Two-factor is off. The next time you log in you will be asked to scan a QR code with
            Google Authenticator, Authy or 1Password to switch it on.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleDisable} className="space-y-3">
            <p className="text-xs text-slate-400">
              Enter the current 6-digit code from your authenticator app to turn two-factor off.
            </p>
            <Input
              label="Current authenticator code"
              inputMode="numeric"
              maxLength={8}
              value={disableOtp}
              onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.4em] font-mono"
            />
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              isLoading={busy}
              disabled={disableOtp.trim().length < 4}
            >
              Turn off two-factor
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Lost your device? Reset with your password instead.
            </p>
            <form onSubmit={handleReset} className="space-y-3">
              <Input
                label="Account password"
                type="password"
                autoComplete="current-password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="danger"
                className="w-full"
                isLoading={busy}
                disabled={!resetPassword}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset two-factor
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};

export default TwoFactorCard;
