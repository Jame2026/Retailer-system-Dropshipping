import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { CachedProfile, resizeImageToDataUrl } from '../../utils/profileCache.js';
import { ProfileAvatarUploader } from './ProfileAvatarUploader.js';
import { EditProfileModal } from './EditProfileModal.js';
import { Trash2, Mail, ShieldCheck, ShieldAlert, Clock, Fingerprint, Edit3, Copy, Check } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const displayName = profile?.name || 'Administrator';
  const displayEmail = profile?.email || '';
  const displayRole = profile?.role || 'admin';
  const avatarUrl = profile?.avatarUrl || null;
  const twoFactorOn = profile?.twoFactorEnabled ?? false;

  const roleBadge = displayRole === 'superadmin'
    ? 'bg-teal-50 text-teal-700 border-teal-200'
    : displayRole === 'operator'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return showToast('error', 'Image too large', 'Choose an image under 8 MB.');
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
      showToast('error', 'Remove failed', err instanceof Error ? err.message : '');
    } finally {
      setUploading(false);
    }
  };

  const copyId = async () => {
    if (!profile?.id) return;
    await navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    showToast('success', 'ID Copied', 'Account UUID copied to clipboard.');
  };

  return (
    <>
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-slate-100 via-teal-50/70 to-emerald-50/80 border-b border-slate-200/80 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-teal-200/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
          <div className="absolute top-3 right-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-teal-800 shadow-xs border border-teal-200/70 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Admin
            </span>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-6">
          {loadError ? <p className="text-xs text-rose-500 mt-4">{loadError}</p> : null}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <ProfileAvatarUploader avatarUrl={avatarUrl} displayName={displayName} uploading={uploading} onFilePicked={handleFilePicked} />
              <div className="min-w-0 sm:pb-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900 truncate">{loading && !profile ? 'Loading…' : displayName}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${roleBadge}`}>{displayRole}</span>
                </div>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />{displayEmail || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:pb-1.5">
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)} className="border-slate-200 text-slate-700 hover:bg-slate-50">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
              {avatarUrl && (
                <Button variant="ghost" size="sm" onClick={handleRemove} disabled={uploading} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                {twoFactorOn ? <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                Two-Factor Security
              </p>
              <p className={`text-xs font-bold ${twoFactorOn ? 'text-teal-700' : 'text-amber-700'}`}>{profile == null ? '…' : twoFactorOn ? 'Enabled & Active' : 'Not Configured'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium"><Clock className="w-3.5 h-3.5 text-indigo-500" /> Last Sign-in</p>
              <p className="text-xs font-bold text-slate-800">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Current Session'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium"><Mail className="w-3.5 h-3.5 text-teal-600" /> Email Identity</p>
              <p className="text-xs font-bold text-slate-800 break-all">{displayEmail || '—'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium"><Fingerprint className="w-3.5 h-3.5 text-slate-400" /> Account UUID</p>
                {profile?.id && (
                  <button type="button" onClick={copyId} title="Copy Account UUID" className="text-slate-400 hover:text-slate-600 transition-colors">
                    {copiedId ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-600 truncate">{profile?.id || '—'}</p>
            </div>
          </div>
        </div>
      </Card>

      <EditProfileModal isOpen={isEditModalOpen} profile={profile} onClose={() => setIsEditModalOpen(false)} onUpdated={onChanged} />
    </>
  );
};

export default ProfileHeaderCard;
