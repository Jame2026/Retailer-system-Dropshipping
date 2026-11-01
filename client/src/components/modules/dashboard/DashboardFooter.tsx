import React from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext.js';

export interface DashboardFooterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { showToast } = useNotification();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-6 pb-2 w-full">
      {/* Search input container */}
      <div className="w-full sm:max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl px-4 py-2.5 flex items-center shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search orders, products, customers..."
          className="w-full bg-transparent border-0 text-xs text-[#111827] placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Right utility links */}
      <div className="flex items-center gap-4 text-xs font-semibold text-[#4B5563] shrink-0">
        <button
          type="button"
          onClick={() => showToast('info', 'Notifications', 'No unread system notifications.')}
          className="flex items-center gap-1.5 hover:text-[#111827] transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
        <button
          type="button"
          onClick={() => showToast('info', 'Help Center', 'Opening documentation and live dropship guide...')}
          className="flex items-center gap-1.5 hover:text-[#111827] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help Center</span>
        </button>
      </div>
    </div>
  );
};
