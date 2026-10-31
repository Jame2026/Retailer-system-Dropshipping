import React from 'react';
import { ShieldCheck, LogOut, KeyRound, Clock, Mail, User } from 'lucide-react';
import { Button } from '../common/Button.js';
import { ProfileDetails } from './HeaderUserMenu.js';

export interface HeaderProfileDropdownProps {
  menuRef: React.RefObject<HTMLDivElement>;
  profile: ProfileDetails | null;
  displayName: string;
  displayEmail: string;
  displayRole: string;
  profileError: string;
  onNavigateProfile: () => void;
  onSignOut: () => void;
}

export const HeaderProfileDropdown: React.FC<HeaderProfileDropdownProps> = ({
  menuRef,
  profile,
  displayName,
  displayEmail,
  displayRole,
  profileError,
  onNavigateProfile,
  onSignOut,
}) => {
  return (
    <div
      ref={menuRef}
      className="absolute right-6 top-16 z-40 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName[0]?.toUpperCase() || 'A'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{displayEmail || 'loading…'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-slate-500 flex items-center gap-1 mb-0.5">
            <ShieldCheck className="w-3 h-3" /> Role
          </p>
          <p className="text-slate-800 font-bold capitalize">{displayRole || '—'}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-slate-500 flex items-center gap-1 mb-0.5">
            <KeyRound className="w-3 h-3" /> Two-factor
          </p>
          <p
            className={
              profile?.twoFactorEnabled ? 'text-teal-600 font-bold' : 'text-amber-600 font-bold'
            }
          >
            {profile == null ? '…' : profile.twoFactorEnabled ? 'Enabled' : 'Not set up'}
          </p>
        </div>
      </div>

      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
        <p className="text-slate-500 flex items-center gap-1 mb-0.5">
          <Mail className="w-3 h-3" /> Email
        </p>
        <p className="text-slate-800 break-all">{displayEmail || '—'}</p>
      </div>

      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
        <p className="text-slate-500 flex items-center gap-1 mb-0.5">
          <Clock className="w-3 h-3" /> Last login
        </p>
        <p className="text-slate-800">
          {profileError ? (
            <span className="text-rose-500">{profileError}</span>
          ) : profile?.lastLoginAt ? (
            new Date(profile.lastLoginAt).toLocaleString()
          ) : (
            '…'
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onNavigateProfile}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        My Profile
        <span className="ml-auto text-[10px] text-slate-500">password &amp; 2FA</span>
      </button>

      <Button variant="danger" size="sm" className="w-full" onClick={onSignOut}>
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </Button>
    </div>
  );
};
