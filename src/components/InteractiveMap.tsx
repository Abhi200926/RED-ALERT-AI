import React, { useState } from 'react';
import { Alert, DisasterType } from '../types';
import {
  Compass,
  Radar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-react';

interface InteractiveMapProps {
  currentAlert: Alert;
  locationName: string;
  latitude: number;
  longitude: number;
  onMarkerClick?: (type: DisasterType) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentAlert,
  locationName,
  latitude,
  longitude,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRadarSweeping, setIsRadarSweeping] = useState(true);

  const isSafe = currentAlert.severity === 'SAFE';
  const isCritical = currentAlert.severity === 'CRITICAL';
  const isWarning = currentAlert.severity === 'WARNING';

  // Map hazard color
  const hazardColor = isCritical
    ? '#f43f5e'
    : isWarning
    ? '#f59e0b'
    : currentAlert.severity === 'WATCH'
    ? '#eab308'
    : '#10b981';

  // Nearby simulated perimeter telemetry stations
  const nearbySensors = [
    { id: 'S1', name: 'Valley Hydrological Stn 4', x: 280, y: 190, status: isCritical ? 'ALERT' : 'NORMAL' },
    { id: 'S2', name: 'Coastal Tide Gauge Buoy 12', x: 170, y: 320, status: isWarning || isCritical ? 'WARN' : 'NORMAL' },
    { id: 'S3', name: 'Seismic Array Crest 8', x: 440, y: 220, status: 'NORMAL' },
    { id: 'S4', name: 'Met Doppler Tower Alpha', x: 370, y: 360, status: isCritical ? 'ALERT' : 'NORMAL' },
  ];

  return (
    <div
      id="tactical-radar-map-card"
      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 backdrop-blur-md space-y-3 relative overflow-hidden"
    >
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-rose-400">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-tech uppercase tracking-wider text-white">
              Tactical Situational Radar
            </h2>
            <p className="text-[11px] text-slate-400">
              Real-time spatial projection & hazard radius perimeter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Radar sweep toggle */}
          <button
            id="map-radar-sweep-toggle"
            onClick={() => setIsRadarSweeping(!isRadarSweeping)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isRadarSweeping
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Radar: {isRadarSweeping ? 'Active' : 'Paused'}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              id="map-zoom-in-btn"
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="map-zoom-out-btn"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Radar Tactical Map Viewport */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl bg-[#070b14] border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* SVG Tactical Display */}
        <svg
          className="w-full h-full"
          viewBox="0 0 600 450"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.25s ease-out' }}
        >
          <defs>
            {/* Radar gradient sweep */}
            <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={hazardColor} stopOpacity="0.35" />
              <stop offset="60%" stopColor={hazardColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={hazardColor} stopOpacity="0" />
            </radialGradient>

            {/* Danger perimeter fill */}
            <radialGradient id="hazardRadiusGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={hazardColor} stopOpacity="0.45" />
              <stop offset="70%" stopColor={hazardColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={hazardColor} stopOpacity="0" />
            </radialGradient>

            {/* Tactical Grid Pattern */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="600" height="450" fill="url(#tacticalGrid)" />

          {/* Stylized Coastal Terrain & Topographic Contours */}
          <g opacity="0.35" stroke="#334155" fill="none" strokeWidth="1.2">
            <path d="M 30,80 Q 90,140 180,110 T 320,180 T 450,150 T 570,240" />
            <path d="M 20,130 Q 110,190 200,160 T 350,220 T 470,200 T 580,280" />
            <path d="M 10,210 Q 120,240 230,220 T 380,290 T 500,270 T 590,340" />
            <path d="M 50,320 Q 160,340 270,330 T 420,380 T 560,390" />
          </g>

          {/* Concentric Distance Range Rings from Center (300, 225) */}
          <g stroke="#334155" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="3,3">
            <circle cx="300" cy="225" r="60" />
            <circle cx="300" cy="225" r="120" />
            <circle cx="300" cy="225" r="180" />
          </g>

          {/* Distance Labels */}
          <text x="305" y="162" fill="#64748b" fontSize="10" fontFamily="Space Mono">15 km</text>
          <text x="305" y="102" fill="#64748b" fontSize="10" fontFamily="Space Mono">30 km</text>
          <text x="305" y="42" fill="#64748b" fontSize="10" fontFamily="Space Mono">45 km</text>

          {/* Crosshair Target Axes */}
          <line x1="300" y1="20" x2="300" y2="430" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="20" y1="225" x2="580" y2="225" stroke="#1e293b" strokeWidth="1.2" />

          {/* Active Rotating Radar Sweep Cone */}
          {isRadarSweeping && (
            <g className="animate-radar">
              <circle cx="300" cy="225" r="190" fill="url(#radarSweepGradient)" />
              <line x1="300" y1="225" x2="300" y2="35" stroke={hazardColor} strokeWidth="1.8" strokeOpacity="0.8" />
            </g>
          )}

          {/* Hazard Impact Zone / Affected Danger Radius */}
          {!isSafe && (
            <g>
              {/* Threat perimeter circle */}
              <circle
                cx="330"
                cy="210"
                r={Math.min(150, Math.max(50, currentAlert.affectedRadiusKm * 3.5))}
                fill="url(#hazardRadiusGradient)"
                stroke={hazardColor}
                strokeWidth="1.8"
                strokeDasharray="5,4"
                className="animate-pulse"
              />

              {/* Hazard epicenter / source marker */}
              <g transform="translate(330, 210)">
                <circle r="14" fill={hazardColor} fillOpacity="0.25" />
                <circle r="7" fill={hazardColor} className="animate-ping" />
                <circle r="4" fill="#ffffff" />
                <text x="12" y="-8" fill={hazardColor} fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                  EPICENTER [{currentAlert.disasterType.toUpperCase()}]
                </text>
              </g>
            </g>
          )}

          {/* Selected User Location Pin at (270, 240) */}
          <g transform="translate(270, 240)">
            <circle r="18" fill="#3b82f6" fillOpacity="0.15" />
            <circle r="6" fill="#3b82f6" />
            <circle r="2.5" fill="#ffffff" />
            {/* Location Label Box */}
            <rect x="10" y="-18" width="135" height="22" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" fillOpacity="0.9" />
            <text x="16" y="-4" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="Plus Jakarta Sans">
              YOU: {locationName.split(',')[0]}
            </text>
          </g>

          {/* Nearby Telemetry Sensor Stations */}
          {nearbySensors.map((sensor) => (
            <g key={sensor.id} transform={`translate(${sensor.x}, ${sensor.y})`}>
              <polygon
                points="0,-5 5,5 -5,5"
                fill={sensor.status === 'ALERT' ? '#f43f5e' : sensor.status === 'WARN' ? '#f59e0b' : '#10b981'}
              />
              <text x="7" y="3" fill="#94a3b8" fontSize="8" fontFamily="Space Mono">
                {sensor.id}: {sensor.status}
              </text>
            </g>
          ))}
        </svg>

        {/* Tactical HUD Overlay Elements */}
        <div className="absolute top-3 left-3 bg-slate-950/85 border border-slate-800 rounded-lg p-2 text-[10px] font-mono-num text-slate-300 space-y-0.5 pointer-events-none backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Compass className="w-3 h-3 text-rose-400" />
            <span>GRID: WGS84 TAC-GEO</span>
          </div>
          <div>LAT: {latitude}°N | LNG: {longitude}°E</div>
          <div>AZIMUTH: 042° NE | RANGE: 50km</div>
        </div>

        {/* Hazard Zone Readout */}
        <div className="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono-num text-slate-300 flex items-center gap-2 pointer-events-none backdrop-blur-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: hazardColor }}
          />
          <span>
            {isSafe ? 'ZONE STATUS: SECURE' : `DANGER RADIUS: ~${currentAlert.affectedRadiusKm} km`}
          </span>
        </div>
      </div>

      {/* Safety & Prototype Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            Situational visualization only. In actual events, consult official evacuation boundary maps.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-300 font-mono-num">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Surveillance Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};
