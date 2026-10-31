import React from 'react';
import { Truck, Zap, Mail, Plane, DollarSign } from 'lucide-react';

export type ShippingFilterType = 'all' | 'fast' | 'postal' | 'express' | 'budget';

interface ShippingFilterTabsProps {
  currentFilter: ShippingFilterType;
  onFilterChange: (filter: ShippingFilterType) => void;
  counts: Record<ShippingFilterType, number>;
}

export const ShippingFilterTabs: React.FC<ShippingFilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: Array<{ id: ShippingFilterType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'all', label: 'All Lines', icon: Truck },
    { id: 'fast', label: 'Fast (< 10d)', icon: Zap },
    { id: 'postal', label: 'USPS / Postal', icon: Mail },
    { id: 'express', label: 'Express Air', icon: Plane },
    { id: 'budget', label: 'Budget (< $20)', icon: DollarSign },
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
