import React from 'react';
import { Sparkles, Clock, Factory, CheckCircle2 } from 'lucide-react';

export type SourcingFilterType = 'all' | 'pending' | 'sourcing' | 'sourced';

interface SourcingFilterTabsProps {
  currentFilter: SourcingFilterType;
  onFilterChange: (filter: SourcingFilterType) => void;
  counts: Record<SourcingFilterType, number>;
}

export const SourcingFilterTabs: React.FC<SourcingFilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: Array<{ id: SourcingFilterType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'all', label: 'All Queries', icon: Sparkles },
    { id: 'pending', label: 'Under Review', icon: Clock },
    { id: 'sourcing', label: 'Negotiating', icon: Factory },
    { id: 'sourced', label: 'Ready to Sell', icon: CheckCircle2 },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id] || 0;
        const isActive = currentFilter === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              isActive
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
