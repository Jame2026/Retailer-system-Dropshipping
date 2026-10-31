import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { Lock, KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';

export const ChangePasswordCard: React.FC = () => {
  const { showToast } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const hasLength = newPassword.length >= 8;
  const hasLetterAndNum = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);
  const matches = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const isValid = hasLength && hasLetterAndNum && matches && Boolean(currentPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match', 'Re-type the confirmation and try again.');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast('success', 'Password updated', 'Use your new password the next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('error', 'Change failed', err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card className="space-y-4 border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500">Update your account authentication credentials</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
          Security
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {newPassword && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${hasLength ? 'text-teal-600 font-semibold' : 'text-slate-400'}`}>
              {hasLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${hasLetterAndNum ? 'text-teal-600 font-semibold' : 'text-slate-400'}`}>
              {hasLetterAndNum ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              Contains letters and numbers
            </div>
            {confirmPassword && (
              <div className={`flex items-center gap-1.5 ${matches ? 'text-teal-600 font-semibold' : 'text-rose-500'}`}>
                {matches ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {matches ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={changingPassword}
          disabled={!isValid}
        >
          <KeyRound className="w-4 h-4" />
          Update Password
        </Button>
      </form>
    </Card>
  );
};

export default ChangePasswordCard;
