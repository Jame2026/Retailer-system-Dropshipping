import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { ShieldCheck, RefreshCw, ExternalLink, ShoppingBag, User } from 'lucide-react';
import { Button } from '../common/Button.js';
import { NavLink } from 'react-router-dom';
import { AdminLoginModal } from '../modules/auth/AdminLoginModal.js';

export interface HeaderProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSyncAll, isSyncing }) => {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>SYSTEM LIVE</span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Shopify Webhook Listener & CJ Sourcing Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/">
            <Button variant="outline" size="sm" className="text-xs">
              <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
              View Storefront
            </Button>
          </NavLink>

          {onSyncAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncAll}
              isLoading={isSyncing}
              className="text-xs border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              Sync Carriers
            </Button>
          )}

          <a
            href="http://localhost:4000/health"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Server Health Status"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* User profile with click to switch roles */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2.5 pl-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="Click to Switch Admin Role or Sign Out"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1 text-[10px] text-teal-600 font-bold uppercase">
                <ShieldCheck className="w-3 h-3" />
                {user?.role || 'Superadmin'}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Admin Login Dialog */}
      <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
