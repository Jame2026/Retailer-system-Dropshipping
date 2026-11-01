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
import { ChevronDown } from 'lucide-react';
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

  const displayName = user?.name || profile?.name || 'James Admin';
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
        className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
        title="View profile"
        aria-expanded={menuOpen}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#D1EADC] text-[#064E3B] flex items-center justify-center font-bold text-xs shadow-2xs">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
          ) : (
            displayName[0]?.toUpperCase() || 'J'
          )}
        </div>
        <span className="text-xs font-bold text-[#111827] hidden sm:inline">{displayName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
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
