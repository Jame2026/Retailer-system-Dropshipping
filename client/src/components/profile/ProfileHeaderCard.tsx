import React, { useRef, useState } from 'react';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import {
  CachedProfile,
  resizeImageToDataUrl,
} from '../../utils/profileCache.js';
import {
  Camera,
  Trash2,
  Mail,
  ShieldCheck,
  Clock,
  Fingerprint,
  Loader2,
} from 'lucide-react';

export interface ProfileHeaderCardProps {
  profile: CachedProfile | null;
  loading: boolean;
  loadError: string;

  onChanged: (profile: CachedProfile) => void;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  loading,
  loadError,
  onChanged,
}) => {
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  const displayName = profile?.name || 'Administrator';
  const displayEmail = profile?.email || '';
  const displayRole = profile?.role || 'admin';
  const avatarUrl = profile?.avatarUrl || null;
  const twoFactorOn = profile?.twoFactorEnabled ?? false;

  const roleBadge =
    displayRole === 'superadmin'
      ? 'bg-teal-500/10 text-teal-600 border-teal-500/30'
      : displayRole === 'operator'
        ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
        : 'bg-slate-500/10 text-slate-600 border-slate-500/30';

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      showToast('error', 'Image too large', 'Please choose an image under 8 MB.');
      return;
    }

    setUploading(true);
    try {

      const dataUrl = await resizeImageToDataUrl(file, 320, 0.85);
      const fresh = await authService.updateAvatar(dataUrl);
      onChanged(fresh as CachedProfile);
      showToast('success', 'Profile picture updated', 'Your new photo is now live.');
    } catch (err) {
      showToast('error', 'Upload failed', err instanceof Error ? err.message : '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const fresh = await authService.removeAvatar();
      onChanged(fresh as CachedProfile);
      showToast('success', 'Profile picture removed', 'You are back to the initials avatar.');
    } catch (err) {
      showToast('error', 'Could not remove picture', err instanceof Error ? err.message : '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="h-24 sm:h-28 bg-white relative"></div>

      <div className="px-5 sm:px-6 pb-6">
        {loadError ? <p className="text-xs text-rose-500 mt-4">{loadError}</p> : null}

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          <div className="relative group w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <div className="w-full h-full rounded-2xl overflow-hidden ring-4 ring-white shadow-lg bg-slate-200 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-slate-600">
                  {displayName[0]?.toUpperCase() || 'A'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              title="Upload a new photo"
              className="absolute inset-0 rounded-2xl bg-slate-950/55 opacity-0 group-hover:opacity-100 focus:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity disabled:cursor-wait"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Change
                  </span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFilePicked}
            />
          </div>

          <div className="flex-1 min-w-0 sm:pb-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 truncate">
                {loading && !profile ? 'Loading…' : displayName}
              </h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border capitalize ${roleBadge}`}
              >
                {displayRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {displayEmail || '—'}
            </p>
          </div>

          <div className="flex gap-2 sm:pb-1.5">
            <Button variant="outline" size="sm" onClick={openFilePicker} isLoading={uploading}>
              <Camera className="w-3.5 h-3.5" />
              {avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {avatarUrl ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3 h-3" /> Two-factor
            </p>
            <p className={`text-xs font-bold ${twoFactorOn ? 'text-teal-600' : 'text-amber-600'}`}>
              {profile == null ? '…' : twoFactorOn ? 'Enabled' : 'Not set up'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" /> Last login
            </p>
            <p className="text-xs font-bold text-slate-800">
              {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
              <Mail className="w-3 h-3" /> Email
            </p>
            <p className="text-xs font-bold text-slate-800 break-all">{displayEmail || '—'}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
              <Fingerprint className="w-3 h-3" /> Account ID
            </p>
            <p className="text-[11px] font-mono text-slate-500 break-all">
              {profile?.id || '—'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeaderCard;
