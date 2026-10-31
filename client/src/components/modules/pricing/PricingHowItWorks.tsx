import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Package, Truck, Zap, ShieldAlert, Sparkles, DollarSign } from 'lucide-react';

export const PricingHowItWorks: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-slate-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 transition-all">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Pricing & Retail Markup Engine
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Formula Guide
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Formula: (Wholesale Cost + Shipping) × Multiplier + Buffer → .99 Charm Price
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-teal-100/50 transition-colors"
          aria-label="Toggle explanation"
        >
          {isOpen ? (
            <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Show Formula <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-teal-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Base Cost</span>
              <span className="text-xs font-bold text-slate-900 block">Wholesale Item</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Factory wholesale price charged by supplier.</p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">Multiplier</span>
              <span className="text-xs font-bold text-slate-900 block">Profit & Ads</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Multiplies landed cost to cover marketing & margin.</p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Buffer ($)</span>
              <span className="text-xs font-bold text-slate-900 block">Freight Cushion</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Protects profit against sudden shipping rate shifts.</p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Charm Ending</span>
              <span className="text-xs font-bold text-slate-900 block">.99 Psychological</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Rounds prices up to .99 for higher conversion.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
