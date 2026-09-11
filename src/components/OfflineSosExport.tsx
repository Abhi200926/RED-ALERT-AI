import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  FileText,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  WifiOff,
  AlertTriangle,
  Share2,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { DisasterType, SosSituation, PeopleNeedingHelp, AlertSeverity } from '../types';

export interface OfflineSosData {
  id: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  isGpsConfirmed: boolean;
  disasterType: DisasterType | 'Other';
  severity: AlertSeverity;
  situation: SosSituation;
  peopleCount: PeopleNeedingHelp;
  message: string;
  timestamp: string;
}

interface OfflineSosExportProps {
  data: OfflineSosData;
  onClose?: () => void;
}

export const OfflineSosExport: React.FC<OfflineSosExportProps> = ({ data, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<'qr' | 'text'>('qr');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreenBeacon, setIsFullscreenBeacon] = useState<boolean>(false);

  // Structured plain-text emergency placard representation
  const textPlacard = `=== EMERGENCY RESCUE SOS PLACARD ===
[RED ALERT AI - EMERGENCY RESCUE BEACON]
REQUEST ID: ${data.id}
TIMESTAMP: ${data.timestamp}

-- LOCATION DETAILS --
LOCATION: ${data.locationName}
COORDINATES: ${
    data.latitude && data.longitude
      ? `${data.latitude}°N, ${data.longitude}°E (${data.isGpsConfirmed ? 'GPS VERIFIED' : 'MANUAL'})`
      : 'MANUAL ENTRY - NO GPS'
  }

-- SITUATION ASSESSMENT --
PERIL / DISASTER: ${data.disasterType}
SEVERITY: ${data.severity}
IMMEDIATE SITUATION: ${data.situation}
PEOPLE NEEDING HELP: ${data.peopleCount}

-- VICTIM SITUATION MESSAGE --
"${data.message || 'Immediate rescue needed.'}"

-- FIELD INSTRUCTIONS FOR RESCUERS --
1. Check victim for injuries or entrapment.
2. Confirm identity using Request ID: ${data.id}.
3. Forward coordinates to Incident Command CAD unit.
====================================`;

  // Dense JSON/compact payload for the QR code
  const qrPayload = JSON.stringify({
    app: 'RED_ALERT_AI_SOS',
    id: data.id,
    type: data.disasterType,
    sev: data.severity,
    loc: data.locationName,
    lat: data.latitude,
    lng: data.longitude,
    gps: data.isGpsConfirmed,
    sit: data.situation,
    people: data.peopleCount,
    msg: data.message,
    ts: data.timestamp,
  });

  // Generate QR Code SVG
  useEffect(() => {
    QRCode.toString(
      qrPayload,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, svgString) => {
        if (!err && svgString) {
          setQrSvg(svgString);
        } else {
          console.error('Failed to generate QR code SVG:', err);
        }
      }
    );
  }, [qrPayload]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textPlacard);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = textPlacard;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPlacard = () => {
    const blob = new Blob([textPlacard], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EMERGENCY-SOS-${data.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="offline-sos-export-panel" className="space-y-4">
      {/* Offline Alert Context Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-200 text-xs space-y-1">
        <div className="flex items-center gap-2 font-tech font-bold uppercase tracking-wider text-amber-300">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Offline Distress Protocol Active</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          When cellular or internet coverage is down, show this high-contrast QR code or placard directly to first responders, emergency drones, or nearby civilian search teams.
        </p>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
        <button
          type="button"
          onClick={() => setActiveFormat('qr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-tech font-bold uppercase tracking-wider transition-all ${
            activeFormat === 'qr'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Rescuer QR Code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFormat('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-tech font-bold uppercase tracking-wider transition-all ${
            activeFormat === 'text'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text Placard</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreenBeacon(!isFullscreenBeacon)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-tech font-bold uppercase border border-slate-800"
          title="Fullscreen High-Visibility Window Mode"
        >
          {isFullscreenBeacon ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreenBeacon ? 'Exit Window' : 'Max Brightness'}</span>
        </button>
      </div>

      {/* QR Code Display Tab */}
      {activeFormat === 'qr' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-mono-num font-bold text-rose-400 uppercase tracking-widest block">
              SEARCH & RESCUE SCANNABLE CODE
            </span>
            <h4 className="text-base font-bold text-white">
              Request #{data.id} ({data.situation})
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Any phone camera or responder tablet can scan this without needing internet access to decode your exact GPS coordinates and situation.
            </p>
          </div>

          {/* Render SVG QR Code with white background padding for high optical contrast */}
          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-rose-600/40">
            {qrSvg ? (
              <div
                className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-600 font-mono-num animate-pulse">
                Generating QR SVG...
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono-num text-slate-400">
            📍 {data.locationName} • {data.peopleCount} Person(s)
          </div>
        </div>
      )}

      {/* Text Block Display Tab */}
      {activeFormat === 'text' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold uppercase text-slate-300">
              Formatted Emergency Text Block
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Placard'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPlacard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-tech uppercase tracking-wider transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .txt</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono-num text-[11px] leading-relaxed overflow-x-auto select-all max-h-64 whitespace-pre-wrap">
            {textPlacard}
          </pre>
        </div>
      )}

      {/* FULLSCREEN MAXIMUM VISIBILITY BEACON MODAL */}
      {isFullscreenBeacon && (
        <div className="fixed inset-0 z-50 bg-white text-black p-6 flex flex-col items-center justify-between animate-in fade-in duration-150">
          <div className="w-full flex items-center justify-between border-b-4 border-black pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-600 block">
                EMERGENCY RESCUE DISPLAY (HOLD UP TO WINDOW / RESCUERS)
              </span>
              <h1 className="text-3xl sm:text-4xl font-black font-tech uppercase tracking-tight">
                SOS: {data.situation.toUpperCase()}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenBeacon(false)}
              className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-sm uppercase tracking-wider"
            >
              Exit Fullscreen
            </button>
          </div>

          <div className="my-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left max-w-4xl">
            {qrSvg && (
              <div
                className="w-64 h-64 sm:w-80 sm:h-80 border-4 border-black p-2 rounded-2xl [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}

            <div className="space-y-3 font-mono-num text-left">
              <div className="text-xl font-bold bg-red-600 text-white px-3 py-1 inline-block">
                ID: {data.id}
              </div>
              <div className="text-2xl sm:text-3xl font-black">
                {data.peopleCount} PERSON(S) NEED RESCUE
              </div>
              <div className="text-lg font-bold text-slate-800">
                PERIL: {data.disasterType.toUpperCase()} ({data.severity})
              </div>
              <div className="text-base font-semibold text-slate-900 border-l-4 border-red-600 pl-3">
                📍 {data.locationName}
                {data.latitude && (
                  <span className="block text-sm text-slate-700">
                    GPS: {data.latitude}°N, {data.longitude}°E
                  </span>
                )}
              </div>
              {data.message && (
                <div className="text-sm italic text-slate-800 bg-slate-100 p-2.5 rounded border border-slate-300">
                  “{data.message}”
                </div>
              )}
            </div>
          </div>

          <div className="w-full text-center text-xs font-bold uppercase tracking-wider text-slate-600 border-t border-black pt-3">
            RED ALERT AI EMERGENCY BEACON • SCREEN OPTICAL RESCUE PLACARD
          </div>
        </div>
      )}
    </div>
  );
};
