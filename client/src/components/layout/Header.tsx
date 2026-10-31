import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../common/Button.js';
import { HeaderUserMenu } from './HeaderUserMenu.js';

export interface HeaderProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSyncAll, isSyncing }) => {
  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 bg-white/85 backdrop-blur-xl px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          <span>ONLINE</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Connected to CJ Dropshipping
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onSyncAll && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncAll}
              isLoading={isSyncing}
              className="text-xs border-slate-300 hover:border-teal-500/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Orders
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
          </>
        )}

        <HeaderUserMenu />
      </div>
    </header>
  );
};
