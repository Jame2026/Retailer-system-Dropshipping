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
    <header className="sticky top-0 z-30 h-16 w-full bg-[#F4EFE6]/90 backdrop-blur-md px-6 flex items-center justify-between border-b border-[#E8E2D6]/80 transition-all">
      <div className="flex items-center gap-3">
        <NavLink to="/admin" className="flex items-center group">
          <Logo size="md" variant="horizontal" />
        </NavLink>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E2DBD0]/70 border border-[#D5CDC0]/80 text-xs ml-3">
          <span className="px-2 py-0.5 rounded-full bg-[#82BCAE] text-[#0E3D32] font-black text-[10px] tracking-wide">
            ONLINE
          </span>
          <span className="text-[11px] text-[#736D64] font-medium">Connected:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#CFE5DE] text-[#0E3D32] font-black text-[10px] tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#544E45] hover:text-[#1F1C18] px-2 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <HeaderUserMenu />
      </div>
    </header>
  );
};
