import React, { useState, useEffect } from 'react';
import {
  EmergencyRequest,
  DisasterType,
  SosSituation,
  PeopleNeedingHelp,
  AlertSeverity,
} from '../types';
import {
  LifeBuoy,
  X,
  MapPin,
  Clock,
  Radio,
  Check,
  AlertTriangle,
  Send,
  Navigation,
  ShieldCheck,
  PhoneCall,
  Flame,
  Info,
  Users,
  Wifi,
  WifiOff,
  QrCode,
  FileText,
  Share2,
  RefreshCw,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { PRESET_LOCATIONS } from '../data/mockDisasters';
import { OfflineSosExport, OfflineSosData } from './OfflineSosExport';

// Local storage key for persistent caching of failed/offline SOS transmissions
export const CACHED_SOS_STORAGE_KEY = 'redalert_cached_sos_offline_payload_v1';

export interface CachedSosPayloadData {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  isGpsConfirmed: boolean;
  disasterType: DisasterType | 'Other';
  severity: AlertSeverity;
  situation: SosSituation;
  peopleCount: PeopleNeedingHelp;
  message: string;
  isDemo: boolean;
}

export interface CachedSosRecord {
  id: string;
  payload: CachedSosPayloadData;
  cachedAt: string;
  cachedTimestamp: number;
  failureReason: 'offline_detected' | 'network_error';
  errorMessage?: string;
}

export const loadCachedSosFromStorage = (): CachedSosRecord | null => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHED_SOS_STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw) as CachedSosRecord;
  } catch (e) {
    console.warn('Failed to parse cached SOS from localStorage:', e);
    return null;
  }
};

export const saveCachedSosToStorage = (record: CachedSosRecord) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHED_SOS_STORAGE_KEY, JSON.stringify(record));
    }
  } catch (e) {
    console.warn('Failed to persist SOS to localStorage:', e);
  }
};

export const clearCachedSosFromStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHED_SOS_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to remove cached SOS from localStorage:', e);
  }
};

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocationName: string;
  defaultDisasterType: DisasterType;
  defaultSeverity: AlertSeverity;
  activeSosRequest: EmergencyRequest | null;
  onSosSubmitted: (req: EmergencyRequest) => void;
  onCancelSos: (id: string) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  defaultLocationName,
  defaultDisasterType,
  defaultSeverity,
  activeSosRequest,
  onSosSubmitted,
  onCancelSos,
}) => {
  // Step in modal: 'confirm' -> 'details' -> 'active' -> 'export'
  const [step, setStep] = useState<'confirm' | 'details' | 'active' | 'export'>(
    activeSosRequest ? 'active' : 'confirm'
  );

  // Network Connectivity Detection & Offline Simulation
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);
  const effectiveOffline = !isOnline || simulateOffline;

  // Local Storage Cached SOS State & Retry Mechanism
  const [cachedSos, setCachedSos] = useState<CachedSosRecord | null>(() => loadCachedSosFromStorage());
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [connectionRestoredNotice, setConnectionRestoredNotice] = useState<boolean>(false);
  const [retryFeedback, setRetryFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Monitor navigator.onLine events to detect restored connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const existing = loadCachedSosFromStorage();
      if (existing) {
        setCachedSos(existing);
        setConnectionRestoredNotice(true);
        setRetryFeedback({
          type: 'info',
          message: 'Connection restored! Cached emergency SOS request is ready to send.',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronize cached SOS when modal opens or effective connectivity changes
  useEffect(() => {
    if (isOpen) {
      const existing = loadCachedSosFromStorage();
      setCachedSos(existing);
      if (existing && !effectiveOffline) {
        setConnectionRestoredNotice(true);
      }
    }
  }, [isOpen, effectiveOffline]);

  const handleToggleSimulateOffline = () => {
    const nextSim = !simulateOffline;
    setSimulateOffline(nextSim);
    if (!nextSim && (typeof navigator === 'undefined' || navigator.onLine)) {
      // Returned online
      const existing = loadCachedSosFromStorage();
      if (existing) {
        setCachedSos(existing);
        setConnectionRestoredNotice(true);
        setRetryFeedback({
          type: 'info',
          message: 'Connection restored! Cached emergency SOS request is ready to send.',
        });
      }
    } else {
      setConnectionRestoredNotice(false);
    }
  };

  // Retry Send handler: Transmits cached SOS from local storage to dispatch server
  const handleRetrySend = async () => {
    const currentRecord = cachedSos || loadCachedSosFromStorage();
    if (!currentRecord) {
      setRetryFeedback({
        type: 'info',
        message: 'No cached SOS found in local storage.',
      });
      return;
    }

    if (effectiveOffline) {
      setRetryFeedback({
        type: 'error',
        message: 'Cannot retry while offline. Please restore connection first.',
      });
      return;
    }

    setIsRetrying(true);
    setRetryFeedback({
      type: 'info',
      message: 'Transmitting cached SOS request to rescue operations server...',
    });

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRecord.payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      // Remove from localStorage once sent successfully
      clearCachedSosFromStorage();
      setCachedSos(null);
      setConnectionRestoredNotice(false);
      setRetryFeedback({
        type: 'success',
        message: `Success! Cached SOS transmitted to emergency dispatch as ${data.request.id}.`,
      });

      onSosSubmitted(data.request);
      setStep('active');
    } catch (err: any) {
      console.error('Retry send failed:', err);
      setRetryFeedback({
        type: 'error',
        message: `Retry send failed (${err?.message || 'Network unreachable'}). SOS details remain safely cached in local storage.`,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDiscardCachedSos = () => {
    clearCachedSosFromStorage();
    setCachedSos(null);
    setConnectionRestoredNotice(false);
    setRetryFeedback({
      type: 'info',
      message: 'Cached SOS request discarded from local device storage.',
    });
  };

  // Location detection states
  const [locationStatus, setLocationStatus] = useState<'prompting' | 'detected' | 'denied'>('prompting');
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationName, setLocationName] = useState<string>(defaultLocationName || 'Downtown District');
  const [isGpsConfirmed, setIsGpsConfirmed] = useState<boolean>(false);

  // SOS Form Fields
  const [disasterType, setDisasterType] = useState<DisasterType | 'Other'>(
    defaultDisasterType || 'Flood'
  );
  const [situation, setSituation] = useState<SosSituation>('Trapped');
  const [peopleCount, setPeopleCount] = useState<PeopleNeedingHelp>('1');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync if activeSosRequest changes
  useEffect(() => {
    if (activeSosRequest && step !== 'export') {
      setStep('active');
    }
  }, [activeSosRequest]);

  // Request location when entering details step
  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      setIsGpsConfirmed(false);
      return;
    }

    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setCoords({ lat, lng });
        setIsGpsConfirmed(true);
        setLocationStatus('detected');
        setLocationName(`GPS Coordinates (${lat}°N, ${lng}°E)`);
      },
      (_err) => {
        setLocationStatus('denied');
        setIsGpsConfirmed(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleStartForm = () => {
    setStep('details');
    requestLocation();
  };

  const handleSubmitSos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setRetryFeedback(null);

    const payload: CachedSosPayloadData = {
      locationName: locationName.trim() || 'Selected Area',
      latitude: coords.lat,
      longitude: coords.lng,
      isGpsConfirmed,
      disasterType,
      severity: defaultSeverity || 'CRITICAL',
      situation,
      peopleCount,
      message: message.trim() || `Immediate assistance required for ${situation.toLowerCase()} situation.`,
      isDemo: true,
    };

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. If currently offline or simulating offline: Cache to local storage immediately
    if (effectiveOffline) {
      const offlineId = `SOS-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineReq: EmergencyRequest = {
        id: offlineId,
        status: 'OFFLINE_QUEUED',
        latitude: coords.lat,
        longitude: coords.lng,
        isGpsConfirmed,
        locationName: locationName.trim() || 'Selected Area',
        disasterType,
        severity: defaultSeverity || 'CRITICAL',
        situation,
        peopleCount,
        message: payload.message,
        timestamp: `${nowFormatted} (Cached Offline)`,
        isDemo: true,
        priority: 'CRITICAL',
        communicationMethod: 'OFFLINE_QUEUE',
        channelLogs: ['Stored in local encrypted outbox awaiting wireless link restoration.'],
      };

      const record: CachedSosRecord = {
        id: offlineId,
        payload,
        cachedAt: nowFormatted,
        cachedTimestamp: Date.now(),
        failureReason: 'offline_detected',
        errorMessage: 'Device was offline during submission',
      };

      saveCachedSosToStorage(record);
      setCachedSos(record);

      onSosSubmitted(offlineReq);
      setRetryFeedback({
        type: 'info',
        message: 'Network offline. SOS request cached safely in local storage. Retry Send will be available once online.',
      });
      setStep('export');
      setIsSubmitting(false);
      return;
    }

    // 2. Online transmission attempt
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      // Submission succeeded: clear any old cached item
      clearCachedSosFromStorage();
      setCachedSos(null);
      setConnectionRestoredNotice(false);
      setRetryFeedback({
        type: 'success',
        message: 'SOS transmitted successfully to emergency rescue hub!',
      });
      onSosSubmitted(data.request);
      setStep('active');
    } catch (err: any) {
      console.warn('Backend SOS call failed due to network issue, caching in local storage:', err);
      const offlineId = `SOS-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackReq: EmergencyRequest = {
        id: offlineId,
        status: 'OFFLINE_QUEUED',
        latitude: coords.lat,
        longitude: coords.lng,
        isGpsConfirmed,
        locationName: locationName.trim() || 'Selected Area',
        disasterType,
        severity: defaultSeverity || 'CRITICAL',
        situation,
        peopleCount,
        message: payload.message,
        timestamp: `${nowFormatted} (Cached Locally)`,
        isDemo: true,
        priority: 'CRITICAL',
        communicationMethod: 'OFFLINE_QUEUE',
        channelLogs: ['Direct HTTP request failed due to connection drop. Preserved in device offline storage.'],
      };

      // Cache the failed SOS request details in local storage
      const record: CachedSosRecord = {
        id: offlineId,
        payload,
        cachedAt: nowFormatted,
        cachedTimestamp: Date.now(),
        failureReason: 'network_error',
        errorMessage: err?.message || 'Network submission error',
      };

      saveCachedSosToStorage(record);
      setCachedSos(record);

      onSosSubmitted(fallbackReq);
      setRetryFeedback({
        type: 'error',
        message: 'Network transmission failed. SOS details are cached in local storage. Use "Retry Send" when connectivity restores.',
      });
      setStep('active');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="sos-modal-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-auto rounded-3xl border-2 border-rose-600 bg-slate-950 shadow-[0_0_50px_rgba(225,29,72,0.4)] overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 px-5 sm:px-7 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-white/20 animate-pulse">
              <LifeBuoy className="w-5 h-5 text-white" />
            </span>
            <div>
              <span className="text-[10px] font-mono-num font-extrabold tracking-widest text-rose-200 uppercase block">
                EMERGENCY RESPONSE PROTOCOL
              </span>
              <h2 className="text-base sm:text-lg font-tech font-black tracking-wide uppercase">
                🚨 EMERGENCY RESCUE REQUEST
              </h2>
            </div>
          </div>

          <button
            id="close-sos-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 sm:px-7 py-2 text-[11px] font-mono-num text-amber-300 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>⚠️ HACKATHON PROTOTYPE — NOT A REAL DISPATCH SYSTEM</span>
          <span>DEMO MODE</span>
        </div>

        {/* Network Connectivity Sub-bar with Simulation Toggle */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 sm:px-7 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            {effectiveOffline ? (
              <span className="flex items-center gap-1.5 font-mono-num font-bold text-amber-400">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>COMMS: OFFLINE (NO NETWORK)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono-num font-semibold text-emerald-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>COMMS: ONLINE</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleSimulateOffline}
            className={`text-[10px] font-mono-num font-bold px-2.5 py-1 rounded-lg transition-all ${
              simulateOffline
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Toggle to test offline QR / Text export workflow without disconnecting your actual internet connection"
          >
            {simulateOffline ? 'Simulating Offline (Restore Online)' : 'Simulate Offline Mode'}
          </button>
        </div>

        {/* Retry & System Status Notification Banner */}
        {retryFeedback && (
          <div
            id="retry-feedback-banner"
            className={`px-5 sm:px-7 py-2.5 text-xs flex items-center justify-between border-b transition-all ${
              retryFeedback.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : retryFeedback.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                : 'bg-sky-950/90 border-sky-500/60 text-sky-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {retryFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {retryFeedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {retryFeedback.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
              <span className="text-[11px] leading-snug">{retryFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setRetryFeedback(null)}
              className="text-slate-400 hover:text-white p-1 rounded ml-2"
              aria-label="Dismiss feedback"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cached SOS Banner: When Network is Restored / Online */}
        {cachedSos && !effectiveOffline && (
          <div
            id="cached-sos-online-banner"
            className="bg-emerald-950/80 border-b-2 border-emerald-500 px-5 sm:px-7 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 animate-pulse">
                <Wifi className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-tech font-bold uppercase tracking-wider text-white">
                    Connection Restored — Cached SOS Ready
                  </span>
                  <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    {cachedSos.payload.disasterType} • Cached at {cachedSos.cachedAt}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/90 mt-0.5 leading-relaxed">
                  Preserved in device local storage during {cachedSos.failureReason === 'offline_detected' ? 'offline session' : 'network failure'}. Press <strong>Retry Send</strong> to broadcast directly to emergency dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                id="retry-send-sos-btn"
                type="button"
                onClick={handleRetrySend}
                disabled={isRetrying}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-tech font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'TRANSMITTING...' : 'RETRY SEND'}</span>
              </button>

              <button
                id="discard-cached-sos-btn"
                type="button"
                onClick={handleDiscardCachedSos}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs transition-all"
                title="Discard cached SOS"
                aria-label="Discard cached SOS"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Cached SOS Banner: When Still Offline */}
        {cachedSos && effectiveOffline && (
          <div
            id="cached-sos-offline-banner"
            className="bg-amber-950/60 border-b border-amber-500/40 px-5 sm:px-7 py-2.5 flex items-center justify-between text-xs text-amber-300"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px]">
                1 SOS request preserved safely in device local storage ({cachedSos.cachedAt}). Will offer <strong>'Retry Send'</strong> once connection is restored.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('export')}
              className="text-[11px] font-tech font-bold text-amber-400 underline hover:text-amber-200 shrink-0 ml-2"
            >
              View QR Placard
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: CONFIRMATION SCREEN */}
          {step === 'confirm' && (
            <div id="sos-step-confirm" className="space-y-5 animate-in fade-in duration-200">
              {/* Offline Directive Banner */}
              {effectiveOffline && (
                <div id="offline-confirm-banner" className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-tech font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <WifiOff className="w-4 h-4 text-amber-400" />
                      Network Outage / Offline Detected
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono-num font-bold">
                      OFFLINE PROTOCOL
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    You appear to be offline or cellular towers are down. You are instructed to <strong>“Export SOS Details”</strong> as a QR code or text block to be displayed to rescuers manually.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('export')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-tech font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Export SOS Details (QR Code / Text Block)</span>
                  </button>
                </div>
              )}

              <div className="text-center space-y-2 py-2">
                <div className="w-16 h-16 rounded-full bg-rose-600/20 text-rose-500 mx-auto flex items-center justify-center border-2 border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-tech font-extrabold uppercase text-white tracking-wide">
                  “Are you currently in danger and unable to reach safety?”
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Pressing SEND SOS initiates an immediate emergency priority broadcast to the centralized responder dashboard.
                </p>
              </div>

              {/* Data Transparency Box: Shows what information will be shared */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <span className="text-xs font-tech font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Information that will be shared:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Current / selected location</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Disaster type ({defaultDisasterType})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Time of request (Timestamp)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Alert severity ({defaultSeverity})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>User emergency situation message</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Number of people needing assistance</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                  ✓ Privacy protection: We do not collect unnecessary personal information, advertising IDs, or contact books.
                </div>
              </div>

              {/* Buttons: SEND SOS & CANCEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  id="confirm-send-sos-btn"
                  onClick={handleStartForm}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/40 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <LifeBuoy className="w-5 h-5 text-white" />
                  <span>SEND SOS (Enter Details)</span>
                </button>

                <button
                  id="confirm-cancel-sos-btn"
                  onClick={onClose}
                  className="w-full px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-tech font-semibold text-sm uppercase tracking-wider border border-slate-800 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FAST EMERGENCY DETAILS FORM */}
          {step === 'details' && (
            <form onSubmit={handleSubmitSos} id="sos-step-details" className="space-y-4 animate-in fade-in duration-200">
              {/* Offline Warning Banner in Form */}
              {effectiveOffline && (
                <div id="offline-form-banner" className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/50 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-tech font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      Offline Mode Active (No Network)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep('export')}
                      className="text-[11px] font-tech font-bold text-amber-400 underline hover:text-amber-300"
                    >
                      Export SOS Placard Directly
                    </button>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Cellular networks are unreachable. Filling this form will prepare your beacon locally and generate a scannable QR Code or formatted text placard to display to rescuers manually.
                  </p>
                </div>
              )}

              {/* Location Detection Section */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Rescue Location
                  </span>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    Retry GPS
                  </button>
                </div>

                {/* Location detection status */}
                {locationStatus === 'detected' && (
                  <div id="gps-detected-notice" className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold">📍 Location detected</span>
                      <span className="block font-mono-num text-[11px] text-emerald-400">
                        GPS Verified: Lat {coords.lat}°, Lng {coords.lng}°
                      </span>
                    </div>
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div id="gps-denied-notice" className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/50 border border-amber-500/40 px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Location could not be detected. (Manual Selection Required)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Select or type your area below for the DEMO. <em>(Note: Manually entered location is not GPS-confirmed).</em>
                    </p>
                  </div>
                )}

                {/* Manual location selector or confirmation input */}
                <div>
                  <input
                    id="sos-location-input"
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      setIsGpsConfirmed(false);
                    }}
                    placeholder="Enter street, landmark, or district (e.g. 5th Ave & Pine St)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>
                      {isGpsConfirmed ? '✓ GPS Confirmed' : '⚠️ Manual Entry (Not GPS-confirmed)'}
                    </span>
                    <span className="text-slate-400">Accuracy ~5m</span>
                  </div>
                </div>
              </div>

              {/* Disaster Type Selector */}
              <div>
                <label className="text-xs font-tech uppercase tracking-wider text-slate-300 block mb-1.5">
                  Disaster Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      'Heavy Rain',
                      'Flood',
                      'Cyclone',
                      'Earthquake',
                      'Landslide',
                      'Tsunami',
                      'Severe Storm',
                      'Wildfire',
                      'Extreme Heat',
                      'Other',
                    ] as Array<DisasterType | 'Other'>
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDisasterType(t)}
                      className={`p-2 rounded-xl text-xs font-semibold tracking-wide transition-all border text-center truncate ${
                        disasterType === t
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Situation Options */}
              <div>
                <label className="text-xs font-tech uppercase tracking-wider text-slate-300 block mb-1.5">
                  Current Situation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {([
                    'Trapped',
                    'Injured',
                    'Building damaged',
                    'Floodwater nearby',
                    'Road blocked',
                    'Need evacuation',
                    'Other',
                  ] as SosSituation[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSituation(s)}
                      className={`p-2 rounded-xl text-xs font-semibold tracking-wide transition-all border text-center truncate ${
                        situation === s
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* People Needing Help */}
              <div>
                <label className="text-xs font-tech uppercase tracking-wider text-slate-300 block mb-1.5">
                  People Needing Help
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['1', '2–5', '6–10', 'More than 10', 'Unknown'] as PeopleNeedingHelp[]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPeopleCount(count)}
                      className={`p-2 rounded-xl text-xs font-semibold tracking-wide transition-all border text-center truncate ${
                        peopleCount === count
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Message Field */}
              <div>
                <label className="text-xs font-tech uppercase tracking-wider text-slate-300 block mb-1">
                  Describe your situation briefly
                </label>
                <textarea
                  id="sos-message-input"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., On 2nd floor balcony, water is 1m high, have 1 infant and elderly person."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  id="submit-sos-request-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-tech font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'PREPARING SOS...'
                      : effectiveOffline
                      ? 'EXPORT SOS DETAILS (OFFLINE)'
                      : 'TRANSMIT SOS NOW'}
                  </span>
                </button>

                <button
                  id="back-to-confirm-btn"
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-tech uppercase tracking-wider border border-slate-800 transition-all"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ACTIVE SOS BROADCAST & TRACKER */}
          {step === 'active' && activeSosRequest && (
            <div id="sos-step-active" className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                    </span>
                    <span className="text-xs font-tech font-bold uppercase tracking-wider text-rose-400">
                      EMERGENCY BROADCAST ACTIVE
                    </span>
                  </div>

                  <span className="text-xs font-mono-num font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    ID: {activeSosRequest.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Help Request Transmitted
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your distress beacon is currently listed in the Emergency Rescue Operations Queue.
                  </p>
                </div>

                {/* Status Step Indicator */}
                <div className="pt-2 border-t border-rose-900/60">
                  <div className="flex items-center justify-between text-[11px] font-mono-num font-semibold text-slate-400 mb-1">
                    <span>STATUS: <strong className="text-rose-400 uppercase">{activeSosRequest.status}</strong></span>
                    <span>Triage: Critical</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeSosRequest.status === 'RESOLVED'
                          ? 'w-full bg-emerald-500'
                          : activeSosRequest.status === 'DISPATCHED' || activeSosRequest.status === 'EN_ROUTE'
                          ? 'w-3/4 bg-blue-500 animate-pulse'
                          : activeSosRequest.status === 'ACKNOWLEDGED'
                          ? 'w-1/2 bg-amber-500'
                          : 'w-1/4 bg-rose-500 animate-pulse'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Local Storage Outbox & Retry Sync Card */}
              {cachedSos && (
                <div
                  id="active-cached-sos-sync-card"
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    !effectiveOffline
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                      : 'bg-amber-950/30 border-amber-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          !effectiveOffline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <Database className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-white">
                          Local Storage Outbox Status
                        </h4>
                        <span className="text-[11px] text-slate-400 block font-mono-num">
                          Saved locally at {cachedSos.cachedAt} ({cachedSos.failureReason === 'offline_detected' ? 'Offline' : 'Network Failed'})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded ${
                        !effectiveOffline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {!effectiveOffline ? 'UPLINK RESTORED' : 'WAITING FOR COMMS'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {!effectiveOffline
                      ? 'Network connection is currently active! Press Retry Send to transmit your cached emergency beacon to the dispatch server.'
                      : 'SOS details are safely stored in browser local storage and will survive browser restarts. Once connectivity is detected, you will be prompted to Retry Send.'}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {!effectiveOffline && (
                      <button
                        id="active-retry-send-btn"
                        type="button"
                        onClick={handleRetrySend}
                        disabled={isRetrying}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{isRetrying ? 'TRANSMITTING SOS...' : 'RETRY SEND TO DISPATCH'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDiscardCachedSos}
                      className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-800 transition-all"
                    >
                      Discard Cache
                    </button>
                  </div>
                </div>
              )}

              {/* Transmitted Details Summary */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-tech font-bold uppercase text-slate-400 block mb-1">
                  Transmitted Rescue Metadata
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono-num">
                  <div>Location: <span className="text-white font-semibold">{activeSosRequest.locationName}</span></div>
                  <div>GPS: <span className="text-white">{activeSosRequest.isGpsConfirmed ? 'Verified GPS' : 'Manual'}</span></div>
                  <div>Disaster: <span className="text-rose-300">{activeSosRequest.disasterType}</span></div>
                  <div>Situation: <span className="text-amber-300">{activeSosRequest.situation}</span></div>
                  <div>People: <span className="text-white">{activeSosRequest.peopleCount}</span></div>
                  <div>Time: <span className="text-white">{activeSosRequest.timestamp}</span></div>
                </div>
                {activeSosRequest.message && (
                  <div className="pt-2 border-t border-slate-800 text-slate-300">
                    <span className="text-slate-400 block text-[10px]">Message:</span>
                    <p className="italic">“{activeSosRequest.message}”</p>
                  </div>
                )}
              </div>

              {/* Rescuer Offline Export Button */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Offline Physical Rescuer Display
                  </span>
                  <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
                    Direct Optical Handshake
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If local cellular towers fail or responders arrive on-site, present this scannable QR Code or high-contrast rescue text placard directly to rescuers.
                </p>
                <button
                  id="active-export-sos-btn"
                  type="button"
                  onClick={() => setStep('export')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Export SOS Details (Rescuer QR / Text Placard)</span>
                </button>
              </div>

              {/* Direct Emergency Call Button */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Immediate Voice Contact</span>
                  <span className="text-[11px] text-slate-400">If your phone line is working, speak to human dispatchers</span>
                </div>
                <a
                  href="tel:911"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono-num"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 911 / 112</span>
                </a>
              </div>

              {/* Actions: Cancel SOS or Close Modal */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  id="cancel-sos-btn"
                  type="button"
                  onClick={() => {
                    clearCachedSosFromStorage();
                    setCachedSos(null);
                    setConnectionRestoredNotice(false);
                    onCancelSos(activeSosRequest.id);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-800 transition-all"
                >
                  Cancel SOS Request (Safe)
                </button>

                <button
                  id="close-sos-view-btn"
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold font-tech uppercase tracking-wider transition-all"
                >
                  Keep Active & Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: OFFLINE SOS EXPORT (QR CODE & TEXT BLOCK) */}
          {step === 'export' && (
            <div id="sos-step-export" className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <QrCode className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-tech font-bold uppercase tracking-wider text-white">
                      Export SOS Details
                    </h3>
                    <span className="text-[11px] text-slate-400 block">
                      Offline Physical Handshake for Responders & Drones
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(activeSosRequest ? 'active' : 'details')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-tech font-bold uppercase tracking-wider border border-slate-800 transition-all"
                >
                  ← Back to {activeSosRequest ? 'Beacon' : 'Form'}
                </button>
              </div>

              {/* Online Notification in Export view if network became available */}
              {cachedSos && !effectiveOffline && (
                <div
                  id="export-retry-notice"
                  className="p-3.5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-200"
                >
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Connection restored! You can transmit this cached SOS to dispatch immediately.
                    </span>
                  </div>
                  <button
                    id="export-retry-send-btn"
                    type="button"
                    onClick={handleRetrySend}
                    disabled={isRetrying}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-bold uppercase tracking-wider text-xs shadow transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Sending...' : 'Retry Send'}</span>
                  </button>
                </div>
              )}

              <OfflineSosExport
                data={{
                  id:
                    activeSosRequest?.id ||
                    cachedSos?.id ||
                    `SOS-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
                  locationName:
                    activeSosRequest?.locationName ||
                    cachedSos?.payload.locationName ||
                    locationName.trim() ||
                    defaultLocationName ||
                    'Disaster Zone',
                  latitude:
                    activeSosRequest ? activeSosRequest.latitude : cachedSos ? cachedSos.payload.latitude : coords.lat,
                  longitude:
                    activeSosRequest ? activeSosRequest.longitude : cachedSos ? cachedSos.payload.longitude : coords.lng,
                  isGpsConfirmed:
                    activeSosRequest
                      ? activeSosRequest.isGpsConfirmed
                      : cachedSos
                      ? cachedSos.payload.isGpsConfirmed
                      : isGpsConfirmed,
                  disasterType:
                    activeSosRequest
                      ? activeSosRequest.disasterType
                      : cachedSos
                      ? cachedSos.payload.disasterType
                      : disasterType,
                  severity:
                    activeSosRequest
                      ? activeSosRequest.severity
                      : cachedSos
                      ? cachedSos.payload.severity
                      : defaultSeverity || 'CRITICAL',
                  situation:
                    activeSosRequest
                      ? activeSosRequest.situation
                      : cachedSos
                      ? cachedSos.payload.situation
                      : situation,
                  peopleCount:
                    activeSosRequest
                      ? activeSosRequest.peopleCount
                      : cachedSos
                      ? cachedSos.payload.peopleCount
                      : peopleCount,
                  message:
                    activeSosRequest
                      ? activeSosRequest.message
                      : cachedSos
                      ? cachedSos.payload.message
                      : message.trim() || `Immediate rescue required for ${situation.toLowerCase()} situation.`,
                  timestamp:
                    activeSosRequest
                      ? activeSosRequest.timestamp
                      : cachedSos
                      ? `${cachedSos.cachedAt} (Cached)`
                      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }}
                onClose={() => setStep(activeSosRequest ? 'active' : 'details')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
