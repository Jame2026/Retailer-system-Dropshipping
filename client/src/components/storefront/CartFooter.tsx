import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export interface CartFooterProps {
  subtotal: number;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

export const CartFooter: React.FC<CartFooterProps> = ({
  subtotal,
  isCheckingOut,
  onCheckout,
}) => {
  return (
    <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Standard Shipping</span>
          <span className="font-mono text-teal-700 font-semibold">$4.99</span>
        </div>
        <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
          <span>Total</span>
          <span className="font-mono text-teal-700">{formatCurrency(subtotal + 4.99)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isCheckingOut ? (
          <span>Processing Order...</span>
        ) : (
          <>
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>6-Hour Change or Cancel Protection</span>
      </div>
    </div>
  );
};
