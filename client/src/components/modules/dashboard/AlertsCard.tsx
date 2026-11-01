import React from 'react';

export interface AlertsCardProps {
  countText?: string;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({
  countText = '2 Alerts',
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#111827] mb-3">Alerts</h3>
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#D1EADC] text-[#064E3B] font-black text-base flex items-center justify-center shadow-xs">
          !
        </div>
        <span className="text-base font-bold text-[#111827]">{countText}</span>
      </div>
    </div>
  );
};

