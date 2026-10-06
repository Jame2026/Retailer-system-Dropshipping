import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useNotification } from '../../context/NotificationContext.js';
import { ShieldCheck, Copy, RefreshCw } from 'lucide-react';

export interface TwoFactorSetupStageProps {
  loading: boolean;
  error: string;
  secret: string;
  otpauthUri: string;
  onSubmit: (otp: string) => void;
  onRotate: () => void;
}

/** First-login stage — scan the QR (or copy the key), then confirm a code. */
export const TwoFactorSetupStage: React.FC<TwoFactorSetupStageProps> = ({
  loading,
  error,
  secret,
  otpauthUri,
  onSubmit,
  onRotate,
}) => {
  const { showToast } = useNotification();
  const [otp, setOtp] = useState('');

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    showToast('success', 'Secret copied', 'Paste it into your authenticator app manually.');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(otp.trim());
      }}
      className="space-y-4"
    >
      <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
        <li>Open Google Authenticator, Authy, 1Password or similar.</li>
        <li>Scan this QR code (or enter the key manually).</li>
        <li>Enter the 6-digit code it shows to activate.</li>
      </ol>

      <div className="flex justify-center py-2">
        <div className="bg-white p-3 rounded-xl">
          <QRCodeSVG value={otpauthUri} size={168} level="M" />
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <code className="flex-1 font-mono text-[11px] text-teal-300 break-all select-all">
          {secret}
        </code>
        <button
          type="button"
          onClick={copySecret}
          className="text-slate-400 hover:text-teal-300 transition-colors"
          title="Copy secret"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRotate}
          className="text-slate-400 hover:text-teal-300 transition-colors"
          title="Generate a new secret"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <Input
        label="Confirmation code"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={8}
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="123456"
        className="text-center text-xl tracking-[0.4em] font-mono"
      />

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={loading}
        disabled={otp.trim().length < 4}
      >
        <ShieldCheck className="w-4 h-4" />
        Activate two-factor &amp; sign in
      </Button>
    </form>
  );
};

export default TwoFactorSetupStage;
