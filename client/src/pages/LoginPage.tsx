import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card.js';
import { CredentialsStage } from '../components/auth/CredentialsStage.js';
import { OtpStage } from '../components/auth/OtpStage.js';
import { TwoFactorSetupStage } from '../components/auth/TwoFactorSetupStage.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { authService, AdminProfile } from '../services/authService.js';
import { ShieldCheck } from 'lucide-react';

type Stage = 'credentials' | 'otp' | 'setup';

interface SetupState {
  setupToken: string;
  secret: string;
  otpauthUri: string;
}

const STAGE_SUBTITLE: Record<Stage, string> = {
  credentials: 'Sign in to manage orders, pricing and fulfillment',
  otp: 'Enter the 6-digit code from your authenticator app',
  setup: 'Set up two-factor authentication to protect your account',
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { showToast } = useNotification();

  const [stage, setStage] = useState<Stage>('credentials');
  const [otpSession, setOtpSession] = useState('');
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fail = (message: string) => {
    setError(message);
    showToast('error', 'Sign-in blocked', message);
  };

  const completeLogin = (token: string, user: AdminProfile) => {
    setSession(user.email, token, user);
    showToast('success', 'Welcome back', `Signed in as ${user.name}`);
    navigate('/admin', { replace: true });
  };

  const handleCredentials = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.login(email, password);
      if (result.status === 'authenticated') {
        completeLogin(result.token, result.user);
      } else if (result.status === 'otp_required') {
        setOtpSession(result.otpSession);
        setStage('otp');
      } else {
        setSetup({
          setupToken: result.setupToken,
          secret: result.secret,
          otpauthUri: result.otpauthUri,
        });
        setStage('setup');
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (otp: string) => {
    setLoading(true);
    setError('');
    try {
      const session = await authService.verifyOtp(otpSession, otp);
      completeLogin(session.token, session.user);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2fa = async (otp: string) => {
    if (!setup) return;
    setLoading(true);
    setError('');
    try {
      const session = await authService.enable2fa(setup.setupToken, otp);
      showToast('success', 'Two-factor enabled', 'Scan-the-app protection is now on for your account.');
      completeLogin(session.token, session.user);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const rotateSecret = async () => {
    if (!setup) return;
    try {
      const fresh = await authService.setup2fa(setup.setupToken);
      setSetup({ ...setup, secret: fresh.secret, otpauthUri: fresh.otpauthUri });
      showToast('info', 'New secret generated', 'Scan the QR code again.');
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not rotate secret');
    }
  };

  const backToCredentials = () => {
    setStage('credentials');
    setError('');
    setSetup(null);
    setOtpSession('');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30">
            <ShieldCheck className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Retailer Dropshipping Admin
          </h1>
          <p className="text-sm text-slate-400">{STAGE_SUBTITLE[stage]}</p>
        </div>

        <Card className="space-y-5">
          {stage === 'credentials' && (
            <CredentialsStage
              loading={loading}
              error={error}
              defaultEmail="admin@retailer-system.com"
              onSubmit={handleCredentials}
            />
          )}

          {stage === 'otp' && <OtpStage loading={loading} error={error} onSubmit={handleOtp} onBack={backToCredentials} />}

          {stage === 'setup' && setup && (
            <TwoFactorSetupStage
              loading={loading}
              error={error}
              secret={setup.secret}
              otpauthUri={setup.otpauthUri}
              onSubmit={handleEnable2fa}
              onRotate={rotateSecret}
            />
          )}
        </Card>

        <p className="text-center text-[11px] text-slate-600">
          Rate-limited &amp; monitored session · OTP codes rotate every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
