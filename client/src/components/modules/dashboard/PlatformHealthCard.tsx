import React from 'react';

export interface PlatformHealthCardProps {
  balanceAmount?: number;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({
  balanceAmount = 0.0,
}) => {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-xs">
      <h2 className="text-sm font-bold text-[#111827] mb-4">Platform Health</h2>
      <div className="flex flex-wrap items-center gap-8 md:gap-14">
        {/* CJ Live Connected */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-10 rounded-xl bg-[#15803D] text-white font-extrabold text-base flex items-center justify-center shadow-xs tracking-tight">
            CJ
          </div>
          <span className="text-base font-bold text-[#111827]">Live Connected</span>
        </div>

        {/* Wallet / Balance */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center shadow-xs">
            <svg
              className="w-5 h-5 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="2" y="6" width="20" height="13" rx="2.5" fill="#E5E7EB" stroke="#6B7280" />
              <path d="M2 10h20" stroke="#6B7280" />
              <rect x="14" y="12" width="5" height="4" rx="1.5" fill="#FFFFFF" stroke="#6B7280" />
              <circle cx="16.5" cy="14" r="0.8" fill="#15803D" />
              <circle cx="7" cy="4" r="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              <circle cx="10" cy="5" r="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            </svg>
          </div>
          <span className="text-2xl font-black text-[#111827] font-mono tracking-tight">
            ${Number(balanceAmount).toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
};

