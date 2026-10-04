import React from 'react';
import { useNotification, ToastMessage } from '../../context/NotificationContext.js';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC<ToastMessage> = ({ id, type, title, description }) => {
  const { removeToast } = useNotification();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border shadow-xl bg-slate-900 border-slate-800 text-slate-100 min-w-[320px]">
      {icons[type]}
      <div className="flex-1">
        <h5 className="text-sm font-semibold text-slate-100">{title}</h5>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => removeToast(id)}
        className="text-slate-400 hover:text-white p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
