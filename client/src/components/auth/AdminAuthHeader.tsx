import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, ShoppingBag } from 'lucide-react';
import { Logo } from '../common/Logo.js';

export const AdminAuthHeader: React.FC = () => {
  return (
    <header className="w-full bg-[#FAF8F5] border-b border-[#E8E2D6] px-6 py-3.5 flex items-center justify-between shadow-xs">
      <NavLink to="/" className="flex items-center group">
        <Logo size="md" variant="horizontal" />
      </NavLink>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#E2DBD0]/60 border border-[#D5CDC0] text-[#14483D] rounded-full text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-[#14A07B]" />
          <span>System Online</span>
        </div>
        <NavLink
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-[#554E46] hover:text-[#1F1C18] bg-[#EBE5DB]/70 hover:bg-[#E2DBCF] px-3.5 py-1.5 rounded-full border border-[#D5CDC0] transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#14A07B]" />
          <span>Storefront</span>
        </NavLink>
      </div>
    </header>
  );
};
