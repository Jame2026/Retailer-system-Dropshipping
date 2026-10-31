import React from 'react';

export interface DemoAccountsPickerProps {
  onSelectAccount: (email: string, pass: string) => void;
}

export const DemoAccountsPicker: React.FC<DemoAccountsPickerProps> = ({
  onSelectAccount,
}) => {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
        Demo Accounts
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onSelectAccount('battambangprogrammer@gmail.com', 'admin123')}
          className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Admin</span>
            <span className="text-[9px] font-bold text-teal-800 bg-teal-200/70 px-1 py-0.5 rounded">
              admin123
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">battambangprogrammer@gmail.com</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectAccount('operator@retailer-system.com', 'operator123')}
          className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Operator</span>
            <span className="text-[9px] font-bold text-indigo-800 bg-indigo-200/70 px-1 py-0.5 rounded">
              operator123
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">operator@retailer-system.com</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectAccount('support@retailer-system.com', 'support123')}
          className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Support</span>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1 py-0.5 rounded">
              support123
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">support@retailer-system.com</p>
        </button>
      </div>
    </div>
  );
};
