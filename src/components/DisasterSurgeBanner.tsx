import React from 'react';
import { AlertTriangle, ShieldAlert, Cpu, ArrowRight, Zap } from 'lucide-react';
import { SurgeProtectionState } from '../types';

interface DisasterSurgeBannerProps {
  surgeState: SurgeProtectionState | null;
  onOpenSurgeDashboard: () => void;
}

export const DisasterSurgeBanner: React.FC<DisasterSurgeBannerProps> = ({
  surgeState,
  onOpenSurgeDashboard,
}) => {
  if (!surgeState || !surgeState.isSurgeModeActive) {
    return null;
  }

  return (
    <div
      id="disaster-surge-active-banner"
      className="w-full bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-b border-rose-500/80 px-4 py-2.5 text-white shadow-lg shadow-rose-950/50 animate-pulse transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Main Alert Message */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-600 text-white shadow-md shadow-rose-600/40 shrink-0">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech font-extrabold uppercase tracking-wider text-rose-200 text-sm">
                🚨 DISASTER SURGE MODE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[10px] font-mono-num font-bold">
                PRIORITY ACTIVE
              </span>
            </div>
            <p className="text-rose-100 text-[11px] font-medium leading-snug">
              System traffic is extremely high. Emergency services & P0 SOS requests are being prioritized.
            </p>
          </div>
        </div>

        {/* Live Metrics & Action Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3 font-mono-num text-[11px] text-rose-200/90">
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded border border-rose-500/30">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{surgeState.activeSimulatedUsers.toLocaleString()} Users</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded border border-rose-500/30">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>{surgeState.requestsPerSecond.toLocaleString()} RPS</span>
            </div>
          </div>

          <button
            id="view-surge-engine-btn"
            onClick={onOpenSurgeDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-tech font-bold text-[11px] tracking-wide transition-all active:scale-95"
          >
            <span>Inspect Surge Controls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
