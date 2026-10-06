import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { authService } from '../../services/authService.js';
import { Lock, KeyRound } from 'lucide-react';

/** Change-password form with client-side confirmation + server validation. */
export const ChangePasswordCard: React.FC = () => {
  const { showToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match', 'Re-type the confirmation and try again.');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast('success', 'Password updated', 'Use the new password the next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('error', 'Change failed', err instanceof Error ? err.message : '');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <Lock className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold text-white">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="At least 8 characters with letters and numbers."
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            confirmPassword && newPassword !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={changingPassword}
          disabled={!currentPassword || !newPassword}
        >
          <KeyRound className="w-4 h-4" />
          Update password
        </Button>
        <p className="text-[11px] text-slate-500">
          Already signed in somewhere else? Existing sessions stay valid until they expire.
        </p>
      </form>
    </Card>
  );
};

export default ChangePasswordCard;
