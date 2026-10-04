import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Bell, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button.js';

export interface HeaderProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSyncAll, isSyncing }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-xl px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>SYSTEM LIVE</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Shopify Webhook Listener & CJ Sourcing Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onSyncAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncAll}
            isLoading={isSyncing}
            className="text-xs border-slate-700 hover:border-teal-500/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync All Carriers
          </Button>
        )}

        <a
          href="http://localhost:4000/health"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Server Health Status"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'Administrator'}</p>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              {user?.role || 'Superadmin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
