import React from 'react';
import { DisasterType, AlertSeverity } from '../types';
import { DISASTER_TYPES_METADATA } from '../data/mockDisasters';
import { AlertLevelBadge } from './AlertLevelBadge';
import {
  Waves,
  Wind,
  Activity,
  Mountain,
  CloudLightning,
  Flame,
  Anchor,
  SunMedium,
  CloudRain,
  Clock,
  PlayCircle,
} from 'lucide-react';

interface DisasterGridProps {
  activeDisasterType?: DisasterType;
  currentSeverity: AlertSeverity;
  onSelectDisasterDemo: (type: DisasterType) => void;
}

export const DisasterGrid: React.FC<DisasterGridProps> = ({
  activeDisasterType,
  currentSeverity,
  onSelectDisasterDemo,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return CloudRain;
      case 'Waves':
        return Waves;
      case 'Wind':
        return Wind;
      case 'Activity':
        return Activity;
      case 'Mountain':
        return Mountain;
      case 'CloudLightning':
        return CloudLightning;
      case 'Flame':
        return Flame;
      case 'Anchor':
        return Anchor;
      case 'SunMedium':
        return SunMedium;
      default:
        return Activity;
    }
  };

  return (
    <div id="disaster-types-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-tech uppercase tracking-wider text-slate-200">
            Multi-Hazard Surveillance Grid
          </h2>
          <p className="text-xs text-slate-400">
            Click any disaster profile to simulate real-time emergency telemetry
          </p>
        </div>
        <span className="text-xs font-mono-num text-slate-400">
          {DISASTER_TYPES_METADATA.length} Perils Monitored
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {DISASTER_TYPES_METADATA.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive = activeDisasterType === item.type;
          const severity: AlertSeverity = isActive ? currentSeverity : 'SAFE';

          return (
            <div
              key={item.type}
              id={`disaster-card-${item.type.toLowerCase().replace(/\s+/g, '-')}`}
              className={`rounded-xl border p-4 transition-all duration-300 relative flex flex-col justify-between group ${
                isActive && severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                  : isActive && severity === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                  : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isActive && severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                        : isActive && severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 group-hover:text-rose-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <AlertLevelBadge severity={severity} size="sm" showPulse={isActive && severity === 'CRITICAL'} />
                </div>

                <h3 className="font-tech text-sm font-bold text-white tracking-wide">
                  {item.type}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono-num flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {isActive ? 'Active stream' : 'Synced'}
                </span>

                <button
                  id={`simulate-btn-${item.type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectDisasterDemo(item.type)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 group-hover:underline focus:outline-none"
                  title={`Simulate ${item.type} hazard`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
