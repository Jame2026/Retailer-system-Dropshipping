import React, { useState } from 'react';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { ArrowLeft } from 'lucide-react';

export interface OtpStageProps {
  loading: boolean;
  error: string;
  onSubmit: (otp: string) => void;
  onBack: () => void;
}

export const OtpStage: React.FC<OtpStageProps> = ({ loading, error, onSubmit, onBack }) => {
  const [otp, setOtp] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(otp.trim());
      }}
      className="space-y-4"
    >
      <Input
        label="Authentication code"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={8}
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        placeholder="123456"
        className="text-center text-2xl tracking-[0.5em] font-mono"
        helperText="Open your authenticator app and enter the current code."
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={loading}
        disabled={otp.trim().length < 4}
      >
        Verify &amp; continue
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-slate-500 hover:text-slate-900 inline-flex items-center justify-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
      </button>
    </form>
  );
};

export default OtpStage;
