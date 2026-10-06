import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/common/Button.js';
import { AccountDetailsCard } from '../components/profile/AccountDetailsCard.js';
import { ChangePasswordCard } from '../components/profile/ChangePasswordCard.js';
import { TwoFactorCard } from '../components/profile/TwoFactorCard.js';
import { authService } from '../services/authService.js';
import { readCachedProfile, writeCachedProfile, CachedProfile } from '../utils/profileCache.js';
import { RefreshCw } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  // Hydrate instantly from the local cache, then refresh from the API.
  const [profile, setProfile] = useState<CachedProfile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authService.me();
      setProfile(me);
      setLoadError('');
      writeCachedProfile(me);
    } catch (err) {
      // Keep showing cached data when the call fails; only surface an error
      // when we have nothing to display at all.
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

  return (
    <PageContainer
      title="My Profile"
      subtitle="Account details, password and two-factor authentication"
      action={
        <Button variant="outline" size="sm" onClick={loadProfile} isLoading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AccountDetailsCard profile={profile} loading={loading} loadError={loadError} />
        <ChangePasswordCard />
        <TwoFactorCard enabled={profile?.twoFactorEnabled ?? false} onChanged={loadProfile} />
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
