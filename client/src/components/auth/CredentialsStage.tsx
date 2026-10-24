import React, { useState } from 'react';
import { Button } from '../common/Button.js';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export interface CredentialsStageProps {
  loading: boolean;
  error: string;
  defaultEmail?: string;
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
}

const REMEMBER_KEY = 'remembered_email';

const fieldClass =
  'w-full bg-white border border-slate-300 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all duration-150 ' +
  'disabled:opacity-50 disabled:bg-slate-50 shadow-sm';

export const CredentialsStage: React.FC<CredentialsStageProps> = ({
  loading,
  error,
  defaultEmail = '',
  onSubmit,
  onForgotPassword,
}) => {
  const remembered = typeof window !== 'undefined' ? localStorage.getItem(REMEMBER_KEY) : null;
  const [email, setEmail] = useState(remembered || defaultEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="w-full space-y-1.5">
        <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`${fieldClass} pl-10 pr-3.5`}
          />
        </div>
      </div>

      <div className="w-full space-y-1.5">
        <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`${fieldClass} pl-10 pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 accent-teal-600 focus:ring-teal-500/30"
          />
          <span className="text-xs font-medium text-slate-600">Remember me</span>
        </label>
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Forgot Password?
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      <Button type="submit" className="w-full" size="lg" isLoading={loading}>
        <ArrowRight className="w-4 h-4" />
        Sign In
      </Button>
    </form>
  );
};

export default CredentialsStage;
