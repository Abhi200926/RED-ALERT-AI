import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, User, LogOut, KeyRound, AlertTriangle, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(authService.getUser());
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'quick-switch'>('quick-switch');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  useEffect(() => {
    const unsub = authService.subscribe((session) => {
      setCurrentUser(session?.user || null);
    });
    return unsub;
  }, []);

  // Countdown timer for account lockout
  useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Authentication successful. Secure session initialized.');
      if (onAuthSuccess) onAuthSuccess();
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Authentication failed');
      if (res.remainingSec) {
        setLockoutRemaining(res.remainingSec);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await authService.register(name, email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Citizen account registered with cryptographic salt hashing.');
      if (onAuthSuccess) onAuthSuccess();
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  const handleQuickSwitch = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await authService.demoLogin(role);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`Switched to authenticated ${role} session.`);
      if (onAuthSuccess) onAuthSuccess();
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setErrorMessage(res.error || 'Quick login failed');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setSuccessMessage('Current device session cleared.');
    if (onAuthSuccess) onAuthSuccess();
  };

  const handleLogoutAll = async () => {
    setIsLoading(true);
    const res = await authService.logoutAllDevices();
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(res.message || 'All active sessions on all devices invalidated.');
      if (onAuthSuccess) onAuthSuccess();
    } else {
      setErrorMessage(res.error || 'Failed to logout from all devices');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Security & Authentication
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
                  TLS / PBKDF2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Short-lived tokens • Role-Based Access Control • Account Lockout Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Current Session status banner if authenticated */}
        {currentUser && (
          <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-purple-600 text-white'
                    : currentUser.role === 'RESCUE_OPERATOR'
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {currentUser.role === 'ADMIN' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : currentUser.role === 'RESCUE_OPERATOR' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {currentUser.name}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : currentUser.role === 'RESCUE_OPERATOR'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{currentUser.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-600 transition flex items-center gap-1.5"
                title="Logout current device"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
              <button
                onClick={handleLogoutAll}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-medium border border-red-800/40 transition flex items-center gap-1.5"
                title="Invalidates all session tokens across all devices"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Logout All
              </button>
            </div>
          </div>
        )}

        {/* Lockout Banner */}
        {lockoutRemaining !== null && lockoutRemaining > 0 && (
          <div className="p-3 bg-red-950/60 border-b border-red-800 text-red-300 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Account Locked:</strong> Too many failed attempts. Unlock in {lockoutRemaining}s.
            </span>
          </div>
        )}

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border-b border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border-b border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('quick-switch');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'quick-switch'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Quick Test Roles
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'register'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Citizen
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {activeTab === 'quick-switch' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Select a pre-seeded test account to immediately evaluate role-based boundaries on the backend:
              </div>

              {/* Citizen Card */}
              <button
                onClick={() => handleQuickSwitch('CITIZEN')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-blue-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                      Sarah Chen (Citizen)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                      ROLE: CITIZEN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Can create & view <strong>own</strong> SOS requests. Cannot view other citizens' private coordinates or access rescue triage.
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500 font-mono">citizen@redalert.ai</div>
                </div>
              </button>

              {/* Operator Card */}
              <button
                onClick={() => handleQuickSwitch('RESCUE_OPERATOR')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-amber-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      Captain Marcus Reed
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      ROLE: RESCUE_OPERATOR
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authorized to view all emergency requests, unmasked GPS coordinates, and update rescue status. Cannot access admin logs.
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500 font-mono">operator@redalert.ai</div>
                </div>
              </button>

              {/* Admin Card */}
              <button
                onClick={() => handleQuickSwitch('ADMIN')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-purple-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                      Dr. Elena Rostova (Admin)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                      ROLE: ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full security authority: Manage user permissions, audit logs, system configurations, and trigger location data retention scrubs.
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500 font-mono">admin@redalert.ai</div>
                </div>
              </button>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Passwords hashed with PBKDF2 (100k rounds) & cryptographic salt.
              </div>

              <button
                type="submit"
                disabled={isLoading || (lockoutRemaining !== null && lockoutRemaining > 0)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : 'Sign In with Secure Session'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Citizen Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password (Min 8 Characters)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Role Policy:
                </div>
                <div>
                  Self-registration automatically assigns the <strong>CITIZEN</strong> role. Role elevation is strictly enforced on the server and cannot be bypassed by frontend requests.
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20"
              >
                {isLoading ? 'Registering...' : 'Register Secure Citizen Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
