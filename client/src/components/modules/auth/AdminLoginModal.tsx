import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldCheck, Key, Lock, Mail, User, LogOut, ArrowRight, Database, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Dialog } from '../../common/Dialog.js';

export interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('battambangprogrammer@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast('success', 'Database Login Successful', `Welcome back, ${loggedUser.name}! Connected to Supabase.`);
      onClose();
      navigate('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials in database');
      showToast('error', 'Login Failed', err.message || 'Authentication error from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged Out', 'Signed out of admin session.');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Database Admin & Operator Login" maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 font-medium">
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>Live Supabase PostgreSQL Database Authentication</span>
        </div>

        {isAuthenticated && user ? (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {user.name?.[0] || 'A'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
                <div className="flex items-center gap-1 text-[10px] text-teal-700 font-bold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>ROLE: {user.role.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/admin');
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Dashboard →
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Database Fill Buttons */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Fill Database Accounts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('battambangprogrammer@gmail.com', 'admin123')}
              className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-left transition-all"
            >
              <span className="text-xs font-bold text-slate-900 block truncate">Admin (Battambang)</span>
              <span className="text-[10px] text-teal-700 font-mono">admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('operator@retailer-system.com', 'operator123')}
              className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-all"
            >
              <span className="text-xs font-bold text-slate-900 block">Operator</span>
              <span className="text-[10px] text-indigo-700 font-mono">operator123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('support@retailer-system.com', 'support123')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-all"
            >
              <span className="text-xs font-bold text-slate-900 block">Support</span>
              <span className="text-[10px] text-amber-700 font-mono">support123</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Database Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="battambangprogrammer@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Checking Database...</span>
              ) : (
                <>
                  <span>Sign In (Database)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
