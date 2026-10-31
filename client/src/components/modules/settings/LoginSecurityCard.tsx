import React from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { Button } from '../../common/Button.js';
import { DynamicSettings } from '../../../services/authService.js';
import { ShieldCheck, Save, RefreshCw, LogOut } from 'lucide-react';

export interface LoginSecurityCardProps {
  security: DynamicSettings | null;
  securityForm: DynamicSettings | null;
  setField: <K extends keyof DynamicSettings>(key: K, value: DynamicSettings[K]) => void;
  isSuperadmin: boolean;
  savingSecurity: boolean;
  onSaveSecurity: () => void;
  onReset: () => void;
  onSignOut: () => void;
}

export const LoginSecurityCard: React.FC<LoginSecurityCardProps> = ({
  securityForm,
  setField,
  isSuperadmin,
  savingSecurity,
  onSaveSecurity,
  onReset,
  onSignOut,
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Login Security & Rate Limits</h3>
            <p className="text-xs text-slate-500">Protection against brute-force and credential attacks</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
          Enforced
        </span>
      </div>

      {!securityForm ? (
        <p className="text-xs text-slate-500 py-4 text-center">Loading security settings…</p>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs text-slate-800 font-bold block">
                Require 2-Factor Authentication (OTP)
              </span>
              <span className="text-[11px] text-slate-500">
                Enforces mobile authenticator verification for all admin logins
              </span>
            </div>
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
              label="2FA Code Length (Digits)"
              type="number"
              min={4}
              max={8}
              disabled={!isSuperadmin}
              value={securityForm['auth.otpLength']}
              onChange={(e) => setField('auth.otpLength', Number(e.target.value))}
              helperText="Standard is 6 digits"
            />
            <Input
              label="Clock Drift Tolerance (Steps)"
              type="number"
              min={0}
              max={2}
              disabled={!isSuperadmin}
              value={securityForm['auth.otpWindowSteps']}
              onChange={(e) => setField('auth.otpWindowSteps', Number(e.target.value))}
              helperText="Tolerates mobile clock skew"
            />
            <Input
              label="Max Failed Logins"
              type="number"
              min={1}
              disabled={!isSuperadmin}
              value={securityForm['rateLimit.login.max']}
              onChange={(e) => setField('rateLimit.login.max', Number(e.target.value))}
              helperText="Threshold before temporary lockout"
            />
            <Input
              label="Lockout Duration (Seconds)"
              type="number"
              min={10}
              disabled={!isSuperadmin}
              value={securityForm['rateLimit.login.windowSec']}
              onChange={(e) => setField('rateLimit.login.windowSec', Number(e.target.value))}
              helperText="Duration of login rate limit"
            />
            <Input
              label="Max 2FA Attempts"
              type="number"
              min={1}
              disabled={!isSuperadmin}
              value={securityForm['rateLimit.otp.max']}
              onChange={(e) => setField('rateLimit.otp.max', Number(e.target.value))}
              helperText="Per verification challenge"
            />
            <Input
              label="API Limit (Per 15 Min)"
              type="number"
              min={1}
              disabled={!isSuperadmin}
              value={securityForm['rateLimit.api.max']}
              onChange={(e) => setField('rateLimit.api.max', Number(e.target.value))}
              helperText="Global admin API ceiling"
            />
          </div>

          {!isSuperadmin && (
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
              Read-only: superadmin role required to modify security settings.
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveSecurity}
              isLoading={savingSecurity}
              disabled={!isSuperadmin}
            >
              <Save className="w-3.5 h-3.5" />
              Apply security settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={savingSecurity}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
