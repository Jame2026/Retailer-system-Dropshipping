import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Database, ShoppingBag } from 'lucide-react';

export const AdminAuthHeader: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <NavLink to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
          <Zap className="w-5 h-5 fill-current text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-wider text-slate-900 font-serif uppercase">
            VOISEN
          </span>
          <span className="block text-[8px] uppercase tracking-[0.25em] text-slate-500 font-bold -mt-1">
            ADMIN
          </span>
        </div>
      </NavLink>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>System Online</span>
        </div>
        <NavLink
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
          <span>Storefront</span>
        </NavLink>
      </div>
    </header>
  );
};
