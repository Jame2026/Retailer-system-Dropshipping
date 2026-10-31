import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminProfile } from '../../services/authService.js';

export interface ActiveSessionBannerProps {
  user: AdminProfile;
  onLogout: () => void;
}

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-900">Current Session: {user.name}</p>
        <p className="text-[11px] text-teal-700 font-medium">
          Logged in as [{user.role.toUpperCase()}] ({user.email})
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/admin')}
          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-500 shadow-sm"
        >
          Dashboard →
        </button>
        <button
          onClick={onLogout}
          className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
