import React from 'react';
import { Card } from '../common/Card.js';
import { useAuth } from '../../context/AuthContext.js';
import { CachedProfile } from '../../utils/profileCache.js';
import { User, Mail, ShieldCheck, Clock, Fingerprint } from 'lucide-react';

export interface AccountDetailsCardProps {
  profile: CachedProfile | null;
  loading: boolean;
  loadError: string;
}

/** Profile summary: identity, 2FA state, last login and account id. */
export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  profile,
  loading,
  loadError,
}) => {
  const { user } = useAuth();

  const displayName = profile?.name || user?.name || 'Administrator';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || user?.role || '';
  const twoFactorOn = profile?.twoFactorEnabled ?? false;

  const roleBadge =
    displayRole === 'superadmin'
      ? 'bg-teal-500/10 text-teal-600 border-teal-500/30'
      : displayRole === 'operator'
        ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
        : 'bg-slate-500/10 text-slate-600 border-slate-500/30';

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <User className="w-5 h-5 text-teal-600" />
        <h3 className="text-sm font-bold text-slate-900">Account Details</h3>
      </div>

      {loading && !profile ? (
        <p className="text-xs text-slate-500 py-6 text-center">Loading profile…</p>
      ) : loadError ? (
        <p className="text-xs text-rose-500">{loadError}</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20">
              {displayName[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">{displayName}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border capitalize ${roleBadge}`}
              >
                {displayRole || 'admin'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-500">Email</p>
                <p className="text-slate-800 break-all">{displayEmail || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${twoFactorOn ? 'text-teal-600' : 'text-amber-600'}`}
              />
              <div>
                <p className="text-slate-500">Two-factor authentication</p>
                <p className={twoFactorOn ? 'text-teal-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {twoFactorOn ? 'Enabled (authenticator app)' : 'Not set up'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Last login</p>
                <p className="text-slate-800">
                  {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Fingerprint className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-500">Account ID</p>
                <p className="text-slate-500 font-mono break-all">{profile?.id || '—'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AccountDetailsCard;
