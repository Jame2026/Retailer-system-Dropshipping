import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard.js';
import { ChangePasswordCard } from '../components/profile/ChangePasswordCard.js';
import { TwoFactorCard } from '../components/profile/TwoFactorCard.js';
import { authService } from '../services/authService.js';
import { readCachedProfile, writeCachedProfile, bumpLocalWrite, getLocalWriteSeq, isStaleProfileResponse, CachedProfile } from '../utils/profileCache.js';

export const ProfilePage: React.FC = () => {

  const [profile, setProfile] = useState<CachedProfile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const startedSeq = getLocalWriteSeq();
    try {
      const me = await authService.me();
      // A local write (e.g. a just-uploaded avatar) happened while this request was
      // in flight. Its data is newer — don't overwrite the profile page (and the
      // shared cache the navbar listens on) with this stale server response.
      if (isStaleProfileResponse(startedSeq)) {
        return;
      }
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
      title="My Profile"
      subtitle="Profile picture, account details, password and two-factor authentication"
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
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
