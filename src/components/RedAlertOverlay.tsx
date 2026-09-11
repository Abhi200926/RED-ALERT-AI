import React from 'react';
import { Alert } from '../types';
import {
  AlertTriangle,
  Flame,
  Shield,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  MapPin,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface RedAlertOverlayProps {
  alert: Alert;
  onDismiss: () => void;
  onViewSafetyInstructions: () => void;
  onViewAlertDetails: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerSos?: () => void;
}

export const RedAlertOverlay: React.FC<RedAlertOverlayProps> = ({
  alert,
  onDismiss,
  onViewSafetyInstructions,
  onViewAlertDetails,
  soundEnabled,
  onToggleSound,
  onTriggerSos,
}) => {
  return (
    <div
      id="red-alert-emergency-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="red-alert-banner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-rose-500 bg-slate-950 shadow-[0_0_50px_rgba(244,63,94,0.45)] overflow-hidden">
        {/* Urgent Emergency Beacon Bar */}
        <div className="bg-rose-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/20 animate-pulse">
              <Flame className="w-6 h-6 text-white" />
            </span>
            <div>
              <span className="text-[11px] font-mono-num font-extrabold uppercase tracking-widest text-rose-200">
                CRITICAL EMERGENCY BROADCAST
              </span>
              <h2 id="red-alert-banner-title" className="text-xl sm:text-2xl font-tech font-black tracking-wider uppercase">
                RED ALERT — {alert.disasterType.toUpperCase()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="overlay-sound-toggle-btn"
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"
              title={soundEnabled ? 'Emergency audio enabled' : 'Emergency audio muted'}
              aria-label={soundEnabled ? 'Mute alert sound' : 'Unmute alert sound'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              id="overlay-close-x-btn"
              onClick={onDismiss}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"
              aria-label="Close emergency overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Demo Warning Banner */}
        {alert.isDemo && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-6 py-2 flex items-center justify-between text-xs font-mono-num text-amber-300 font-bold uppercase tracking-wider">
            <span>⚠️ DEMO — NOT A REAL EMERGENCY ALERT</span>
            <span>SIMULATION ACTIVE</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
              {alert.title}
            </h3>
            <p className="text-base text-slate-200 leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Telemetry metadata cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <span className="text-[11px] font-mono-num uppercase text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Affected Area
              </span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5 truncate">
                {alert.location}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono-num uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                Detected Time
              </span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5 font-mono-num">
                {alert.timestamp}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono-num uppercase text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                Source
              </span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5 truncate">
                {alert.source}
              </p>
            </div>
          </div>

          {/* Immediate Safety Guidance Box */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/50 space-y-2">
            <span className="text-xs font-tech font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Immediate Protective Directives:
            </span>
            <ul className="space-y-1.5 text-sm text-slate-200 list-disc list-inside">
              <li>Seek reinforced shelter immediately and protect head/neck.</li>
              <li>Avoid flood zones, coastal corridors, or hillside slopes according to hazard type.</li>
              <li>Tune to local emergency broadcast frequencies and follow civil protection instructions.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {onTriggerSos && (
              <button
                id="overlay-trigger-sos-btn"
                onClick={onTriggerSos}
                className="col-span-1 sm:col-span-3 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-tech font-black text-sm uppercase tracking-wider shadow-xl shadow-rose-600/50 transition-all hover:scale-[1.01] active:scale-95 border-2 border-rose-400/40"
              >
                <span>🚨 I NEED RESCUE (SEND SOS)</span>
              </button>
            )}

            <button
              id="overlay-view-safety-btn"
              onClick={onViewSafetyInstructions}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 font-tech font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              <span>Safety Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="overlay-view-details-btn"
              onClick={onViewAlertDetails}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-tech font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>View Alert Details</span>
            </button>

            <button
              id="overlay-dismiss-btn"
              onClick={onDismiss}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold tracking-wider uppercase transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
