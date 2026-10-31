import React, { useState, useEffect } from 'react';
import { Button } from '../../common/Button.js';
import { formatTimeRemaining } from '../../../utils/formatDate.js';
import { Clock, Send, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface OrderHoldBannerProps {
  holdExpiresAt?: string | Date | null;
  onReleaseNow: () => Promise<void>;
  isReleasing: boolean;
  onEditAddress: () => void;
}

export const OrderHoldBanner: React.FC<OrderHoldBannerProps> = ({
  holdExpiresAt,
  onReleaseNow,
  isReleasing,
  onEditAddress,
}) => {
  const [countdown, setCountdown] = useState(formatTimeRemaining(holdExpiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatTimeRemaining(holdExpiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  return (
    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50/90 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">
                6-Hour Safety Hold Active
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300/80">
                {countdown.isExpired ? 'Ready to Dispatch' : `Releases in ${countdown.formatted}`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This order is paused in the 6-hour protection window so your customer can request address changes or cancellations before payment is charged and sent to the CJ Dropshipping factory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditAddress}
            className="text-xs font-semibold bg-white border-amber-300 hover:border-amber-400 text-slate-800"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Edit Address
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isReleasing}
            onClick={onReleaseNow}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            ⚡ Dispatch Now (Skip Hold)
          </Button>
        </div>
      </div>
    </div>
  );
};
