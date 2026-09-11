import React from 'react';
import { Alert } from '../types';
import { AlertLevelBadge } from './AlertLevelBadge';
import {
  ShieldCheck,
  Flame,
  AlertTriangle,
  Clock,
  Radio,
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CurrentSafetyStatusProps {
  alert: Alert;
  onViewSafetyInstructions: () => void;
  onScrollToAiAnalysis: () => void;
  onClearAlert: () => void;
}

export const CurrentSafetyStatus: React.FC<CurrentSafetyStatusProps> = ({
  alert,
  onViewSafetyInstructions,
  onScrollToAiAnalysis,
  onClearAlert,
}) => {
  const isSafe = alert.severity === 'SAFE';
  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';
  const isWatch = alert.severity === 'WATCH';

  return (
    <div
      id="current-safety-status-card"
      className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${
        isCritical
          ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-950 shadow-2xl shadow-rose-950/50'
          : isWarning
          ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950 shadow-xl shadow-amber-950/30'
          : isWatch
          ? 'border-yellow-500/40 bg-gradient-to-b from-yellow-950/20 via-slate-900/90 to-slate-950 shadow-lg'
          : 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950/90 shadow-lg'
      }`}
    >
      {/* Top Status Ambient Glow Strip */}
      <div
        className={`h-1.5 w-full ${
          isCritical
            ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
            : isWarning
            ? 'bg-amber-500'
            : isWatch
            ? 'bg-yellow-400'
            : 'bg-emerald-500'
        }`}
      />

      <div className="p-5 sm:p-7">
        {/* Header Row: Severity Badge + Demo Indicator + Time */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <AlertLevelBadge severity={alert.severity} size="lg" showPulse={isCritical} />
            {alert.isDemo && (
              <span
                id="demo-alert-badge"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 tracking-wide uppercase font-mono-num"
              >
                <Info className="w-3 h-3" />
                DEMO ALERT
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Telemetry updated: {alert.timestamp}</span>
          </div>
        </div>

        {/* Central Prominent Announcement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-start gap-4">
              {/* Status Graphic Icon */}
              <div
                className={`p-3.5 rounded-2xl flex-shrink-0 border transition-all ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-alert-pulse'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isWatch
                    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isCritical ? (
                  <Flame className="w-8 h-8" />
                ) : isWarning || isWatch ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    id="current-status-title"
                    className={`font-tech text-2xl sm:text-3xl font-extrabold tracking-wide uppercase ${
                      isCritical
                        ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : isWarning
                        ? 'text-amber-300'
                        : isWatch
                        ? 'text-yellow-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isSafe ? 'ALL CLEAR' : alert.title}
                  </h1>
                </div>

                <p id="current-status-description" className="text-base sm:text-lg text-slate-200 mt-1 font-medium leading-relaxed">
                  {alert.description}
                </p>
              </div>
            </div>

            {/* Crucial Hazard Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Affected Area
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5 truncate" title={alert.location}>
                  {alert.location}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-slate-400" />
                  Disaster Type
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5">
                  {alert.disasterType}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-slate-400" />
                  Proximity / Radius
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5 font-mono-num">
                  {isSafe ? '0 km (Nominal)' : `${alert.distanceKm ?? 3.5} km | r=${alert.affectedRadiusKm} km`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  Confidence
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      alert.confidence === 'High'
                        ? 'bg-emerald-400'
                        : alert.confidence === 'Moderate'
                        ? 'bg-amber-400'
                        : 'bg-yellow-400'
                    }`}
                  />
                  {alert.confidence}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Side Panel */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 lg:border-l lg:border-slate-800/80 lg:pl-6">
            <span className="text-xs uppercase font-tech tracking-wider text-slate-400">
              Immediate Guidance & Operations
            </span>

            <button
              id="view-safety-guidance-btn"
              onClick={onViewSafetyInstructions}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-md group ${
                isCritical
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60'
              }`}
            >
              <span className="font-semibold">View Safety Instructions</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="view-ai-analysis-btn"
              onClick={onScrollToAiAnalysis}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                AI Risk Analysis & Telemetry
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {!isSafe && (
              <button
                id="reset-to-safe-btn"
                onClick={onClearAlert}
                className="w-full text-center py-2 px-3 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors font-mono-num"
              >
                Reset to ALL CLEAR (Normal State)
              </button>
            )}

            {/* Authoritative Source Badge */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono-num">
              <span className="text-slate-400 block font-normal">Source:</span>
              <span className="text-slate-200 font-medium">{alert.source}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
