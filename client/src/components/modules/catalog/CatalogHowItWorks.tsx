import React, { useState } from 'react';
import { HelpCircle, ShoppingBag, ArrowRight, Zap, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const CatalogHowItWorks: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/50 via-white to-sky-50/40 p-4 shadow-xs transition-all">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Product & Supplier Routing
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Guide
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              How store products link to CJ Dropshipping for automated fulfillment
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-teal-100/50 transition-colors"
        >
          {isOpen ? (
            <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Show Guide <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-teal-100/80 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
              <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
              <h5 className="text-xs font-bold text-slate-900">Customer Order</h5>
            </div>
            <p className="text-[11px] text-slate-600">
              Each storefront product maps to a verified supplier SKU for instant order resolution.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <h5 className="text-xs font-bold text-slate-900">Auto-Dispatch</h5>
            </div>
            <p className="text-[11px] text-slate-600">
              Held for safety cancellation buffer, then auto-submitted directly to CJ factory lines.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <h5 className="text-xs font-bold text-slate-900">Tracking & Margin</h5>
            </div>
            <p className="text-[11px] text-slate-600">
              Tracking numbers sync to your customer automatically while you pocket the net margin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
