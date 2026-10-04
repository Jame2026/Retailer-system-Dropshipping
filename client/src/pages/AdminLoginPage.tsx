import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotification } from '../context/NotificationContext.js';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Shield, ShieldCheck, Key, Lock, Mail, User, ArrowRight, Zap, ShoppingBag, Database, AlertCircle, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, login, register, logout, isAuthenticated } = useAuth();
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
      showToast('success', 'Database Login Successful', `Welcome, ${loggedUser.name}! Connected to Supabase.`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error from database');
      showToast('error', 'Login Failed', err.message || 'Invalid credentials in database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const newUser = await register({
        email,
        password,
        name,
        role,
      });
      showToast('success', 'Admin Account Created', `User ${newUser.name} created in Supabase database!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error in database');
      showToast('error', 'Registration Failed', err.message || 'Failed to create admin in database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-slate-900 font-serif uppercase">
              VOISEN
            </span>
            <span className="block text-[8px] uppercase tracking-[0.25em] text-slate-500 font-bold -mt-1">
              DATABASE GATEWAY
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Supabase PostgreSQL Live</span>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
            <span>Storefront</span>
          </NavLink>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-6">
          {/* Title and Icon */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Database Admin Sign In' : 'Register New Admin User'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Authenticated live against Supabase PostgreSQL with bcrypt & JWT
            </p>
          </div>

          {/* Active Session Card if already logged in */}
          {isAuthenticated && user && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Current Session: {user.name}</p>
                <p className="text-[11px] text-teal-700 font-medium">Logged in as [{user.role.toUpperCase()}] ({user.email})</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-500 shadow-sm"
                >
                  Enter Portal →
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs */}
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
              <span>Log In to Account</span>
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
              <span>Create Database User</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-scale-up">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Quick Fill Database Presets */}
          {mode === 'login' && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Fill Seeded Database Account
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('battambangprogrammer@gmail.com', 'admin123')}
                  className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Admin</span>
                    <span className="text-[9px] font-bold text-teal-800 bg-teal-200/70 px-1 py-0.5 rounded">
                      admin123
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">battambangprogrammer@gmail.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('operator@retailer-system.com', 'operator123')}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Operator</span>
                    <span className="text-[9px] font-bold text-indigo-800 bg-indigo-200/70 px-1 py-0.5 rounded">
                      operator123
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">operator@retailer-system.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('support@retailer-system.com', 'support123')}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Support</span>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1 py-0.5 rounded">
                      support123
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">support@retailer-system.com</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name / Operator Name
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
                Admin Email Address (Database Unique)
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
                Password (Hashed with bcrypt in DB)
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
                  Assigned Permission Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                >
                  <option value="superadmin">Superadmin (Full Control, SKU Mappings & Pricing)</option>
                  <option value="operator">Fulfillment Operator (Hold Buffer & Supplier Release)</option>
                  <option value="support">Customer Support (US Address Modification & Tracking)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <span>Querying Supabase Database...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In (Supabase DB)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Admin in Database</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>© 2026 VOISEN Dropshipping Operations Platform • Live Supabase PostgreSQL Database Authentication</p>
      </footer>
    </div>
  );
};
