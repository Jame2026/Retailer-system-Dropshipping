import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export const StoreFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
            <Zap className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white uppercase">
              VOISEN
            </span>
            <span className="text-[10px] text-teal-400 block font-mono">Direct Dropship Network</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold">
          <NavLink to="/" className="hover:text-white transition-colors">
            Home
          </NavLink>
          <NavLink to="/shop" className="hover:text-white transition-colors">
            Shop All
          </NavLink>
          <NavLink to="/products" className="hover:text-teal-400 transition-colors">
            CJ Products
          </NavLink>
          <NavLink to="/admin" className="hover:text-white transition-colors">
            Admin
          </NavLink>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Verified CJ Dropshipping API</span>
        </div>
      </div>

      <div className="border-t border-slate-800/60 py-4 text-center text-[11px] text-slate-500">
        © 2026 VOISEN Direct. All rights reserved.
      </div>
    </footer>
  );
};
