import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { CachedProfile } from '../../utils/profileCache.js';
import { User, X, Check, Mail, Shield, CheckCircle2 } from 'lucide-react';

export interface EditProfileModalProps {
  isOpen: boolean;
  profile: CachedProfile | null;
  onClose: () => void;
  onUpdated: (profile: CachedProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useNotification();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Name required', 'Please provide a valid display name.');
      return;
    }
    setSaving(true);
    try {
      const fresh = await authService.updateProfile(name.trim());
      onUpdated(fresh as CachedProfile);
      showToast('success', 'Profile updated', 'Your display name has been saved.');
      onClose();
    } catch (err) {
      showToast('error', 'Update failed', err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <p className="text-xs text-slate-500">Update your account name and identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            helperText="Visible in the dashboard navigation and order history."
          />

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                {profile?.email || '—'}
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> System Role
              </span>
              <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {profile?.role || 'operator'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving} disabled={!name.trim()}>
              <Check className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfileModal;
