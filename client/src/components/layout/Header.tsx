import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { readCachedProfile, writeCachedProfile, PROFILE_UPDATED_EVENT, getLocalWriteSeq, isStaleProfileResponse } from '../../utils/profileCache.js';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  LogOut,
  ChevronDown,
  KeyRound,
  Clock,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { ConfirmDialog } from '../common/ConfirmDialog.js';

export interface HeaderProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

interface ProfileDetails {
  email: string;
  role: string;
  name: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  avatarUrl?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onSyncAll, isSyncing }) => {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [profile, setProfile] = useState<ProfileDetails | null>(() =>
    readCachedProfile()
  );
  const [profileError, setProfileError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastFetchedAt = useRef(0);

  const refreshProfile = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchedAt.current < 10_000) return;
    lastFetchedAt.current = now;
    const startedSeq = getLocalWriteSeq();

    try {
      const me = await authService.me();
      // A local profile write (e.g. a just-uploaded avatar) happened while this
      // request was in flight. Its data is newer — don't stomp the navbar with this
      // stale server response.
      if (isStaleProfileResponse(startedSeq)) return;
      setProfile(me);
      setProfileError('');
      writeCachedProfile(me);
    } catch (err) {

      setProfile((current) => {
        if (!current) {
          setProfileError(err instanceof Error ? err.message : 'Could not load profile');
        }
        return current;
      });
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (menuOpen) refreshProfile();
  }, [menuOpen, refreshProfile]);

  useEffect(() => {
    const onProfileUpdated = () => {
      const fresh = readCachedProfile();
      if (fresh) setProfile(fresh);
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [menuOpen]);

  const signOut = () => {
    logout();
    showToast('info', 'Signed out', 'Your session token was cleared.');
    navigate('/', { replace: true });
  };

  const askSignOut = () => {
    setMenuOpen(false);
    setConfirmOut(true);
  };

  const displayName = user?.name || profile?.name || 'Administrator';
  const displayRole = user?.role || profile?.role || '';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 bg-white/85 backdrop-blur-xl px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
          <span>SYSTEM LIVE</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Shopify Webhook Listener & CJ Sourcing Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onSyncAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncAll}
            isLoading={isSyncing}
            className="text-xs border-slate-300 hover:border-teal-500/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync All Carriers
          </Button>
        )}

        <a
          href="http://localhost:4000/health"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Server Health Status"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button
          type="button"
          ref={toggleRef}
          onClick={() => setMenuOpen((open) => !open)}
          onMouseEnter={refreshProfile}
          onFocus={refreshProfile}
          className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          title="View profile"
          aria-expanded={menuOpen}
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName[0]?.toUpperCase() || 'A'
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900">{displayName}</p>
            <div className="flex items-center gap-1 text-[10px] text-teal-600 font-medium capitalize">
              <ShieldCheck className="w-3 h-3" />
              {displayRole || 'admin'}
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-6 top-16 z-40 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName[0]?.toUpperCase() || 'A'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">
                {displayEmail || 'loading…'}
              </p>
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
            onClick={() => {
              setMenuOpen(false);
              navigate('/profile');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            My Profile
            <span className="ml-auto text-[10px] text-slate-500">password &amp; 2FA</span>
          </button>

          <Button variant="danger" size="sm" className="w-full" onClick={askSignOut}>
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOut}
        title="Sign out of the dashboard?"
        message="Your session token will be cleared from this browser. You will need your password and authenticator code to sign back in."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          setConfirmOut(false);
          signOut();
        }}
      />
    </header>
  );
};
