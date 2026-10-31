import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import {
  readCachedProfile,
  writeCachedProfile,
  PROFILE_UPDATED_EVENT,
  getLocalWriteSeq,
  isStaleProfileResponse,
} from '../../utils/profileCache.js';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog.js';
import { HeaderProfileDropdown } from './HeaderProfileDropdown.js';

export interface ProfileDetails {
  email: string;
  role: string;
  name: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  avatarUrl?: string | null;
}

export const HeaderUserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [profile, setProfile] = useState<ProfileDetails | null>(() => readCachedProfile());
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

  const displayName = user?.name || profile?.name || 'Administrator';
  const displayRole = user?.role || profile?.role || '';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <>
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
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
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

      {menuOpen && (
        <HeaderProfileDropdown
          menuRef={menuRef}
          profile={profile}
          displayName={displayName}
          displayEmail={displayEmail}
          displayRole={displayRole}
          profileError={profileError}
          onNavigateProfile={() => {
            setMenuOpen(false);
            navigate('/profile');
          }}
          onSignOut={() => {
            setMenuOpen(false);
            setConfirmOut(true);
          }}
        />
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
    </>
  );
};
