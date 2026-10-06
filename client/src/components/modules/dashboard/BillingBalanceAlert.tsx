import React from 'react';
import { AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '../../common/Button.js';
import { NavLink } from 'react-router-dom';

export interface BillingBalanceAlertProps {
  cjBalanceUsd?: number;
  thresholdUsd?: number;
}

export const BillingBalanceAlert: React.FC<BillingBalanceAlertProps> = ({
  cjBalanceUsd = 42.5,
  thresholdUsd = 100.0,
}) => {
  const isLow = cjBalanceUsd < thresholdUsd;

  if (!isLow) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-300">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-900">Supplier Wallet Balance Low Warning</h4>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              CJ Dropshipping
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Current CJ wallet balance is <span className="font-bold text-amber-950">${cjBalanceUsd.toFixed(2)}</span> (Below threshold of ${thresholdUsd.toFixed(2)}). Buffered orders may encounter <span className="text-rose-700 font-bold">FAILED_BILLING</span> state upon 6-hour release.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href="https://cjdropshipping.com/myCJ.html#/myCJWallet"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
            <CreditCard className="w-3.5 h-3.5" />
            Top Up CJ Balance
          </Button>
        </a>
        <NavLink to="/admin/settings">
          <Button variant="outline" size="sm" className="border-amber-300 bg-white">
            Configure Threshold <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </NavLink>
      </div>
    </div>
  );
};
