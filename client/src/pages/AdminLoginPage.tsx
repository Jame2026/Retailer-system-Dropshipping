import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { AdminProfile } from '../services/authService.js';
import { AdminAuthHeader } from '../components/auth/AdminAuthHeader.js';
import { ActiveSessionBanner } from '../components/auth/ActiveSessionBanner.js';
import { DemoAccountsPicker } from '../components/auth/DemoAccountsPicker.js';
import { AdminAuthForm } from '../components/auth/AdminAuthForm.js';

export const AdminLoginPage: React.FC = () => {
  const { user, login, register, logout, isAuthenticated, setSession } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/admin';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('battambangprogrammer@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'superadmin' | 'operator' | 'support'>('superadmin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast('success', 'Welcome back', `Signed in as ${loggedUser.name}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.code === 'otp_required' || err?.code === '2fa_setup_required') {
        showToast('info', 'Two-factor step required', 'Finish signing in on the secure login page.');
        navigate('/login', { state: { from, email } });
        return;
      }
      setErrorMessage(err.message || 'Login failed');
      showToast('error', 'Login Failed', err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const newUser = await register({ email, password, name, role });
      showToast('success', 'Account Created', `Account for ${newUser.name} created successfully.`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
      showToast('error', 'Registration Failed', err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  const handleGoogleSession = useCallback(
    (token: string, sessionUser: AdminProfile) => {
      setErrorMessage(null);
      setIsLoading(true);
      setSession(sessionUser.email, token, sessionUser);
      showToast('success', 'Google Sign-In Successful', `Welcome, ${sessionUser.name}!`);
      navigate(from, { replace: true });
    },
    [from, navigate, setSession, showToast]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <AdminAuthHeader />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Admin Sign In' : 'Create Admin Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in to manage products, orders, and pricing
            </p>
          </div>

          {isAuthenticated && user && (
            <ActiveSessionBanner user={user} onLogout={logout} />
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-600" />
              <span>Create Account</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-scale-up">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {mode === 'login' && <DemoAccountsPicker onSelectAccount={handleQuickFill} />}

          <AdminAuthForm
            mode={mode}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            role={role}
            setRole={setRole}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
            onGoogleSession={handleGoogleSession}
            onGoogleError={(message) => {
              setIsLoading(false);
              setErrorMessage(message);
              showToast('error', 'Google Sign-In Failed', message);
            }}
          />
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>© 2026 VOISEN. All rights reserved.</p>
      </footer>
    </div>
  );
};
