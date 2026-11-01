import React from 'react';

export interface AlertsCardProps {
  countText?: string;
  isActiveFilter?: boolean;
  onToggleFilter?: () => void;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({
  countText = '2 Alerts',
  isActiveFilter = false,
  onToggleFilter,
}) => {
  return (
    <div
      onClick={onToggleFilter}
      className={`bg-white border rounded-3xl p-5 shadow-xs transition-all ${
        onToggleFilter ? 'cursor-pointer hover:border-emerald-400 hover:shadow-sm' : ''
      } ${isActiveFilter ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20' : 'border-[#E5E7EB]'}`}
      title={onToggleFilter ? 'Click to toggle filtering issue orders' : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#111827]">Alerts</h3>
        {isActiveFilter && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Active Filter
          </span>
        )}
      </div>
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#D1EADC] text-[#064E3B] font-black text-base flex items-center justify-center shadow-xs shrink-0">
          !
        </div>
        <div>
          <span className="text-base font-bold text-[#111827]">{countText}</span>
          <p className="text-[11px] text-[#6B7280]">
            {isActiveFilter ? 'Showing orders needing review' : 'Click to filter issues'}
          </p>
        </div>
      </div>
    </div>
  );
};
