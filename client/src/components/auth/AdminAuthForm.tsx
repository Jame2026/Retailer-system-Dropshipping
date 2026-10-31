import React from 'react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton.js';
import { AdminProfile } from '../../services/authService.js';

export interface AdminAuthFormProps {
  mode: 'login' | 'register';
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  role: 'superadmin' | 'operator' | 'support';
  setRole: (v: 'superadmin' | 'operator' | 'support') => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSession: (token: string, user: AdminProfile) => void;
  onGoogleError: (error: string) => void;
}

export const AdminAuthForm: React.FC<AdminAuthFormProps> = ({
  mode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  showPassword,
  setShowPassword,
  isLoading,
  onSubmit,
  onGoogleSession,
  onGoogleError,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@retailer-system.com"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-11 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mode === 'register' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium cursor-pointer"
          >
            <option value="superadmin">Admin (Full Access)</option>
            <option value="operator">Operator (Orders & Fulfillment)</option>
            <option value="support">Support (Customer Service)</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6"
      >
        {isLoading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {mode === 'login' && (
        <GoogleLoginButton
          onSession={onGoogleSession}
          onError={onGoogleError}
        />
      )}
    </form>
  );
};
