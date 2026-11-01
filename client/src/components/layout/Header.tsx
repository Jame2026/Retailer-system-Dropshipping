import React from 'react';
import { Bell } from 'lucide-react';
import { HeaderUserMenu } from './HeaderUserMenu.js';
import { NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo.js';

export interface HeaderProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/95 backdrop-blur-md px-6 flex items-center justify-between border-b border-[#E5E7EB] transition-all">
      <div className="flex items-center gap-3">
        <NavLink to="/admin" className="flex items-center group">
          <Logo size="md" variant="horizontal" />
        </NavLink>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF6F0] border border-[#D1EADC] text-xs ml-3">
          <span className="px-2 py-0.5 rounded-full bg-[#8AD1B2] text-[#064E3B] font-black text-[10px] tracking-wide">
            ONLINE
          </span>
          <span className="text-[11px] text-[#6B7280] font-medium">Connected:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#D7EFE4] text-[#064E3B] font-black text-[10px] tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <HeaderUserMenu />
      </div>
    </header>
  );
};
