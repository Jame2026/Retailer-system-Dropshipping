import React from 'react';
import { CreditCard, ExternalLink, Zap } from 'lucide-react';
import { Button } from '../../common/Button.js';
import { AnimatedCounter } from '../../common/AnimatedCounter.js';

export interface BillingBalanceAlertProps {
  cjBalanceUsd?: number;
  openId?: number | string | null;
  connected?: boolean;
}

export const BillingBalanceAlert: React.FC<BillingBalanceAlertProps> = ({
  cjBalanceUsd = 0.0,
  openId = '59360',
  connected = true,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">CJ Dropshipping Gateway</h4>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {connected ? 'LIVE CONNECTED' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            OpenID: {openId || '59360'} • Daily Quota: 50,000 pts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CJ Wallet</p>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            <AnimatedCounter value={cjBalanceUsd} prefix="$" decimals={2} suffix=" USD" />
          </p>
        </div>
        <a
          href="https://cjdropshipping.com/myCJ.html#/myCJWallet"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline" size="sm" className="h-9 text-xs border-slate-200 hover:border-teal-500 hover:text-teal-700">
            <CreditCard className="w-3.5 h-3.5" />
            Top Up
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Button>
        </a>
      </div>
    </div>
  );
};
