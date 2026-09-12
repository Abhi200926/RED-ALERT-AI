import React, { useState, useEffect } from 'react';
import { LifeBuoy, AlertTriangle, Radio, ShieldAlert, CheckCircle2, Flame, Database, RefreshCw } from 'lucide-react';
import { EmergencyRequest } from '../types';
import { loadCachedSosFromStorage, CachedSosRecord } from './SosModal';

interface SosButtonCardProps {
  onOpenSosModal: () => void;
  activeSosRequest: EmergencyRequest | null;
  onViewActiveSos: () => void;
}

export const SosButtonCard: React.FC<SosButtonCardProps> = ({
  onOpenSosModal,
  activeSosRequest,
  onViewActiveSos,
}) => {
  const [cachedSos, setCachedSos] = useState<CachedSosRecord | null>(null);

  useEffect(() => {
    const checkCache = () => {
      setCachedSos(loadCachedSosFromStorage());
    };
    checkCache();
    window.addEventListener('storage', checkCache);
    window.addEventListener('online', checkCache);
    window.addEventListener('offline', checkCache);
    return () => {
      window.removeEventListener('storage', checkCache);
      window.removeEventListener('online', checkCache);
      window.removeEventListener('offline', checkCache);
    };
  }, [activeSosRequest]);

  const isBroadcastActive = activeSosRequest && activeSosRequest.status !== 'RESOLVED' && activeSosRequest.status !== 'CANCELLED';
  const hasCachedRequest = !!cachedSos && !isBroadcastActive;

  return (
    <div
      id="sos-emergency-action-card"
      className={`rounded-3xl border-2 transition-all p-5 sm:p-7 shadow-2xl relative overflow-hidden ${
        isBroadcastActive
          ? 'border-amber-500/80 bg-gradient-to-r from-amber-950/50 via-slate-950 to-amber-950/40 shadow-amber-950/40'
          : hasCachedRequest
          ? 'border-amber-500/70 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 shadow-amber-950/30'
          : 'border-rose-600/80 bg-gradient-to-r from-rose-950/40 via-slate-950 to-rose-950/30 shadow-rose-950/50'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none ${
          isBroadcastActive
            ? 'bg-amber-500/15'
            : hasCachedRequest
            ? 'bg-amber-500/10'
            : 'bg-rose-600/20'
        }`}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-num font-bold uppercase tracking-wider ${
                isBroadcastActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : hasCachedRequest
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              {isBroadcastActive
                ? 'SOS Broadcast Active'
                : hasCachedRequest
                ? 'Offline SOS Saved Locally'
                : 'Emergency Assistance System'}
            </span>

            {hasCachedRequest && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono-num font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Database className="w-3 h-3" />
                <span>Cached in Device Storage</span>
              </span>
            )}

            <span className="text-[10px] uppercase font-mono-num font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Demo Prototype
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-tech font-extrabold uppercase tracking-wide text-white">
            {isBroadcastActive ? (
              <span className="text-amber-300">
                Rescue Request #{activeSosRequest.id} — Status: {activeSosRequest.status}
              </span>
            ) : hasCachedRequest ? (
              <span className="text-amber-200">
                Pending SOS Request in Local Outbox
              </span>
            ) : (
              'Trapped or in Immediate Danger?'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {isBroadcastActive ? (
              <>
                Your emergency rescue transmission is active in the Rescue Command Center. Responders have been notified of your coordinates ({activeSosRequest.locationName}).
              </>
            ) : hasCachedRequest ? (
              <>
                An SOS distress request for <strong>{cachedSos.payload.locationName}</strong> was cached locally during a network outage ({cachedSos.cachedAt}). Open the rescue modal to retry transmission or view the offline QR placard.
              </>
            ) : (
              <>
                “Use only when you are in immediate danger and need emergency assistance.”
                <span className="block text-slate-400 text-xs mt-1">
                  Simulates distress transmission to the in-app rescue command dashboard. Does not dispatch real-world rescue teams or 911.
                </span>
              </>
            )}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-2">
          {isBroadcastActive ? (
            <button
              id="view-active-sos-btn"
              onClick={onViewActiveSos}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Radio className="w-5 h-5 animate-pulse text-slate-950" />
              <span>Track SOS Broadcast</span>
            </button>
          ) : hasCachedRequest ? (
            <button
              id="cached-sos-resume-btn"
              onClick={onOpenSosModal}
              className="w-full md:w-auto group relative flex items-center justify-center gap-3.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-tech font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 ring-4 ring-amber-500/30"
              aria-label="Open Cached SOS - Retry Send or Export"
            >
              <RefreshCw className="w-6 h-6 text-slate-950 group-hover:rotate-180 transition-transform duration-500" />
              <span className="drop-shadow-md">RETRY / VIEW CACHED SOS</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
              </span>
            </button>
          ) : (
            <button
              id="sos-need-rescue-btn"
              onClick={onOpenSosModal}
              className="w-full md:w-auto group relative flex items-center justify-center gap-3.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-tech font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all hover:scale-105 active:scale-95 ring-4 ring-rose-500/30"
              aria-label="I Need Rescue - Send Emergency SOS"
            >
              <LifeBuoy className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
              <span className="drop-shadow-md">🚨 I NEED RESCUE</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
              </span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 text-center font-mono-num flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Prototype: In a real crisis dial 911 / 112 directly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
