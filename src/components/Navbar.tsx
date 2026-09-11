import React, { useState } from 'react';
import {
  AlertOctagon,
  Radio,
  Shield,
  History,
  Info,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Menu,
  X,
  Flame,
  Zap,
  LifeBuoy,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSimulateRedAlert: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasActiveAlert: boolean;
  activeSosCount?: number;
  onOpenSos?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onSimulateRedAlert,
  soundEnabled,
  onToggleSound,
  hasActiveAlert,
  activeSosCount = 0,
  onOpenSos,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Radio },
    { id: 'rescue-hub', label: 'Rescue Hub', icon: LifeBuoy, badge: activeSosCount > 0 ? activeSosCount : undefined },
    { id: 'live-alerts', label: 'Live Alerts', icon: AlertOctagon },
    { id: 'safety-center', label: 'Safety Center', icon: Shield },
    { id: 'history', label: 'Alert History', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  hasActiveAlert
                    ? 'bg-rose-600 shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-md shadow-red-900/30'
                }`}
              >
                <AlertOctagon className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      hasActiveAlert ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      hasActiveAlert ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-tech text-lg font-bold tracking-wider text-white">
                    RED ALERT <span className="text-rose-500 font-extrabold">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono-num font-semibold px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                    EARLY-WARNING
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal tracking-wide hidden sm:block">
                  Know early. Act safely.
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/70 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono-num font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Header Items */}
          <div className="hidden sm:flex items-center gap-2.5">
            {onOpenSos && (
              <button
                id="header-open-sos-btn"
                onClick={onOpenSos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-tech font-bold uppercase tracking-wider transition-all"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>🚨 SOS</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              id="header-sound-toggle-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Emergency audio alert is ENABLED' : 'Emergency audio is MUTED'}
              aria-label={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-slate-800/90 border-slate-700 text-rose-400 hover:bg-slate-700/80 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Simulate RED ALERT button */}
            <button
              id="header-simulate-red-alert-btn"
              onClick={onSimulateRedAlert}
              className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-xs tracking-wider uppercase shadow-md shadow-rose-600/30 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4 text-rose-100 animate-pulse" />
              <span>Simulate Alert</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-sound-toggle-btn"
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
              aria-label="Toggle alert sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          {onOpenSos && (
            <button
              id="mobile-open-sos-btn"
              onClick={() => {
                onOpenSos();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-tech font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30"
            >
              <LifeBuoy className="w-5 h-5 animate-spin" />
              <span>🚨 I NEED RESCUE (SEND SOS)</span>
            </button>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono-num font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              id="mobile-simulate-btn"
              onClick={() => {
                onSimulateRedAlert();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-tech font-bold text-xs uppercase tracking-wider border border-slate-800"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>Simulate RED ALERT (Demo)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
