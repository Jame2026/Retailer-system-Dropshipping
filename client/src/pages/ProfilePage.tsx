import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard.js';
import { ChangePasswordCard } from '../components/profile/ChangePasswordCard.js';
import { TwoFactorCard } from '../components/profile/TwoFactorCard.js';
import { authService } from '../services/authService.js';
import {
  readCachedProfile,
  writeCachedProfile,
  bumpLocalWrite,
  getLocalWriteSeq,
  isStaleProfileResponse,
  CachedProfile,
} from '../utils/profileCache.js';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CachedProfile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const startedSeq = getLocalWriteSeq();
    try {
      const me = await authService.me();
      if (isStaleProfileResponse(startedSeq)) return;
      setProfile(me);
      setLoadError('');
      writeCachedProfile(me);
    } catch (err) {
      setProfile((current) => {
        if (!current) {
          setLoadError(err instanceof Error ? err.message : 'Could not load profile');
        }
        return current;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChanged = useCallback((fresh: CachedProfile) => {
    bumpLocalWrite();
    setProfile(fresh);
    setLoadError('');
    writeCachedProfile(fresh);
  }, []);

  return (
    <PageContainer
      title="Admin Profile"
      subtitle="Manage your identity, authentication credentials, and 2FA protection"
    >
      <div className="space-y-6">
        <ProfileHeaderCard
          profile={profile}
          loading={loading}
          loadError={loadError}
          onChanged={handleProfileChanged}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChangePasswordCard />
          <TwoFactorCard
            enabled={profile?.twoFactorEnabled ?? false}
            onChanged={loadProfile}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Protected Sessions</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Tokens are signed with secure HMAC algorithms and invalidated when logging out.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Role-Based Access</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Operations, automated pricing, and API keys are gated by role privileges.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Audit Logging</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                High-impact catalog edits and configuration updates are saved in application logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
