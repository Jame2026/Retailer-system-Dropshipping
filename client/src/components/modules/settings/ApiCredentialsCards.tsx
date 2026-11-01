import React, { useState } from 'react';
import { Card } from '../../common/Card.js';
import { Input } from '../../common/Input.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { Key, Shield, Eye, EyeOff, Copy, Check } from 'lucide-react';

export interface ApiCredentialsCardsProps {
  cjEmail: string; setCjEmail: (v: string) => void;
  cjKey: string; setCjKey: (v: string) => void;
  balanceAlertThreshold: number; setBalanceAlertThreshold: (v: number) => void;
  zendropKey: string; setZendropKey: (v: string) => void;
}

export const ApiCredentialsCards: React.FC<ApiCredentialsCardsProps> = ({
  cjEmail,
  setCjEmail,
  cjKey,
  setCjKey,
  balanceAlertThreshold,
  setBalanceAlertThreshold,
  zendropKey,
  setZendropKey,
}) => {
  const { showToast } = useNotification();
  const [showCjKey, setShowCjKey] = useState(false);
  const [showZendropKey, setShowZendropKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const copyText = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    showToast('success', 'Copied', 'CJ API Key copied to clipboard.');
  };

  return (
    <>
      <Card className="space-y-4 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600"><Key className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">CJ Dropshipping Integration</h3>
              <p className="text-xs text-slate-500">Primary fulfillment provider credentials</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">
            Primary Supplier
          </span>
        </div>

        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-800 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> CJ API 2.0 Connected
            </span>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800">
              100 reqs/min safe limit
            </span>
          </div>
          <p className="text-[11px] text-teal-700">Orders route automatically to this CJ account when verified.</p>
        </div>

        <div className="space-y-3">
          <Input
            label="CJ Account Email"
            value={cjEmail}
            onChange={(e) => setCjEmail(e.target.value)}
            placeholder="e.g. partner@example.com"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">CJ API Key / Access Token</label>
              {cjKey && (
                <button type="button" onClick={() => copyText(cjKey)} className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showCjKey ? 'text' : 'password'}
                value={cjKey}
                onChange={(e) => setCjKey(e.target.value)}
                placeholder="Paste CJ API Key (e.g. CJ5900404@api@...)"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCjKey(!showCjKey)}
                title={showCjKey ? 'Hide API key' : 'View API key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showCjKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-teal-600" />}
              </button>
            </div>
          </div>

          <Input
            label="Low Balance Warning Threshold ($ USD)"
            type="number"
            step="10"
            min="0"
            value={balanceAlertThreshold}
            onChange={(e) => setBalanceAlertThreshold(Number(e.target.value) || 0)}
            helperText="Banner alert when wallet balance drops below this amount"
          />
        </div>
      </Card>

      <Card className="space-y-4 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600"><Shield className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Zendrop Integration (Backup)</h3>
              <p className="text-xs text-slate-500">Failover fulfillment if an item is out of stock</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">
            Optional Backup
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Zendrop API Token</label>
          <div className="relative">
            <input
              type={showZendropKey ? 'text' : 'password'}
              value={zendropKey}
              onChange={(e) => setZendropKey(e.target.value)}
              placeholder="Paste Zendrop Token (optional)"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowZendropKey(!showZendropKey)}
              title={showZendropKey ? 'Hide token' : 'View token'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showZendropKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-teal-600" />}
            </button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ApiCredentialsCards;
