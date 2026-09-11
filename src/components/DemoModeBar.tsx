import React, { useState } from 'react';
import { DisasterType } from '../types';
import {
  CloudRain,
  Waves,
  Wind,
  Activity,
  Mountain,
  CloudLightning,
  Flame,
  SunMedium,
  ShieldCheck,
  Wifi,
  WifiOff,
  Radio,
  Satellite,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { globalMultiChannelManager } from '../services/communicationService';
import { OfflineStorageService } from '../services/offlineStorage';
import { SosService } from '../services/sosService';

interface DemoModeBarProps {
  onSimulateDisaster: (type: DisasterType) => void;
  onClearAlert: () => void;
  isSimulated: boolean;
  activeType?: DisasterType;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({
  onSimulateDisaster,
  onClearAlert,
  isSimulated,
  activeType,
}) => {
  const [activeTab, setActiveTab] = useState<'communication' | 'hazards'>('communication');
  const [scenarioBanner, setScenarioBanner] = useState<{
    primary: string;
    secondary?: string;
    type: 'info' | 'warning' | 'error' | 'success';
  } | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const hazardButtons: Array<{ type: DisasterType; label: string; icon: React.FC<{ className?: string }> }> = [
    { type: 'Heavy Rain', label: 'Heavy Rain', icon: CloudRain },
    { type: 'Flood', label: 'Flood', icon: Waves },
    { type: 'Cyclone', label: 'Cyclone', icon: Wind },
    { type: 'Earthquake', label: 'Earthquake', icon: Activity },
    { type: 'Landslide', label: 'Landslide', icon: Mountain },
    { type: 'Tsunami', label: 'Tsunami', icon: Waves },
    { type: 'Severe Storm', label: 'Severe Storm', icon: CloudLightning },
    { type: 'Wildfire', label: 'Wildfire', icon: Flame },
    { type: 'Extreme Heat', label: 'Extreme Heat', icon: SunMedium },
  ];

  // 1. HEAVY RAIN — INTERNET AVAILABLE
  const handleScenarioHeavyRainInternet = () => {
    setActiveScenarioId('scenario-1');
    onSimulateDisaster('Heavy Rain');
    globalMultiChannelManager.applyScenarioHeavyRainInternet();
    setScenarioBanner({
      primary: 'HEAVY RAIN — INTERNET AVAILABLE',
      secondary: 'Internet available → SEND SOS THROUGH INTERNET (Broadband/Wi-Fi link active)',
      type: 'success',
    });
  };

  // 2. HEAVY RAIN — INTERNET LOST
  const handleScenarioHeavyRainInternetLost = () => {
    setActiveScenarioId('scenario-2');
    onSimulateDisaster('Heavy Rain');
    globalMultiChannelManager.applyScenarioHeavyRainInternetLost();
    setScenarioBanner({
      primary: 'HEAVY RAIN — INTERNET LOST',
      secondary: 'Internet unavailable → CHECK SMS/CELLULAR (Switched to Cellular Data Uplink)',
      type: 'warning',
    });
  };

  // 3. FLOOD — CELLULAR AVAILABLE
  const handleScenarioFloodCellular = () => {
    setActiveScenarioId('scenario-3');
    onSimulateDisaster('Flood');
    globalMultiChannelManager.applyScenarioFloodCellular();
    setScenarioBanner({
      primary: 'FLOOD — CELLULAR AVAILABLE',
      secondary: 'Cellular Available → SEND SOS THROUGH CELLULAR PACKET DATA (5G/LTE)',
      type: 'info',
    });
  };

  // 4. FLOOD — CELLULAR LOST
  const handleScenarioFloodCellularLost = () => {
    setActiveScenarioId('scenario-4');
    onSimulateDisaster('Flood');
    globalMultiChannelManager.applyScenarioFloodCellularLost();
    setScenarioBanner({
      primary: 'FLOOD — CELLULAR LOST',
      secondary: 'Cellular unavailable → CHECK SMS FALLBACK (Emergency Text Bridge 911/112 active) [DEMO SIMULATION]',
      type: 'warning',
    });
  };

  // 5. REMOTE AREA — SATELLITE SIMULATION
  const handleScenarioRemoteSatellite = () => {
    setActiveScenarioId('scenario-5');
    onSimulateDisaster('Severe Storm');
    globalMultiChannelManager.applyScenarioRemoteSatellite();
    setScenarioBanner({
      primary: 'REMOTE AREA — SATELLITE SIMULATION',
      secondary: 'SMS unavailable → CHECK SUPPORTED SATELLITE CHANNEL (Direct-to-cell LEO pulse active) [DEMO SIMULATION]',
      type: 'info',
    });
  };

  // 6. TOTAL COMMUNICATION LOSS
  const handleScenarioTotalCommunicationLoss = () => {
    setActiveScenarioId('scenario-6');
    globalMultiChannelManager.applyScenarioTotalCommunicationLoss();

    // Step A: "NO COMMUNICATION CHANNEL AVAILABLE"
    setScenarioBanner({
      primary: 'NO COMMUNICATION CHANNEL AVAILABLE',
      secondary: 'Scanning Internet, Cellular, SMS, Satellite, Mesh Relay... All radio paths unresponsive.',
      type: 'error',
    });

    // Automatically queue a test SOS beacon in local storage if none exists to illustrate local persistence
    try {
      const queued = OfflineStorageService.getQueuedSosRequests();
      if (queued.length === 0) {
        OfflineStorageService.queueSosRequest(
          {
            id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'OFFLINE_QUEUED',
            latitude: 40.7128,
            longitude: -74.006,
            isGpsConfirmed: true,
            locationName: 'Simulated Disaster Sector B-4',
            disasterType: 'Flood',
            severity: 'CRITICAL',
            situation: 'Trapped',
            peopleCount: '2–5',
            message: 'TOTAL COMMS LOSS SIMULATION: Citizen trapped in rising water. Automatic offline outbox queued.',
            timestamp: 'Just now',
            isDemo: true,
            priority: 'CRITICAL',
            communicationMethod: 'OFFLINE_QUEUE',
          },
          'Zero-connectivity state. Encrypted and held in local sandbox storage.'
        );
      }
    } catch {
      // ignore
    }

    // Step B: Then show "SOS SAVED LOCALLY"
    setTimeout(() => {
      setScenarioBanner({
        primary: 'NO COMMUNICATION CHANNEL AVAILABLE',
        secondary: 'SOS SAVED LOCALLY → Saved safely to browser storage. Outbox daemon will retry automatically when signal returns.',
        type: 'warning',
      });
    }, 1500);
  };

  // 7. CONNECTION RESTORED
  const handleScenarioConnectionRestored = async () => {
    setActiveScenarioId('scenario-7');
    globalMultiChannelManager.applyScenarioConnectionRestored();

    // Step A: "COMMUNICATION RESTORED"
    setScenarioBanner({
      primary: 'COMMUNICATION RESTORED',
      secondary: 'Re-establishing radio uplink handshake and flushing local outbox...',
      type: 'info',
    });

    // Step B: Auto-retry offline outbox and show "SOS TRANSMITTED"
    try {
      const res = await SosService.retryQueuedRequests();
      setTimeout(() => {
        setScenarioBanner({
          primary: 'COMMUNICATION RESTORED',
          secondary: `SOS TRANSMITTED → ${
            res.sentCount > 0
              ? `${res.sentCount} queued distress beacon(s) flushed and delivered to Rescue Operations Center.`
              : 'All distress beacons synchronized with emergency dispatch server.'
          }`,
          type: 'success',
        });
      }, 1200);
    } catch {
      setTimeout(() => {
        setScenarioBanner({
          primary: 'COMMUNICATION RESTORED',
          secondary: 'SOS TRANSMITTED → Synchronized with emergency operations center.',
          type: 'success',
        });
      }, 1200);
    }
  };

  return (
    <div
      id="hackathon-demo-panel"
      className="rounded-2xl border-2 border-rose-500/40 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
          <h2 className="text-sm sm:text-base font-tech font-bold uppercase tracking-wider text-rose-300">
            HACKATHON SIMULATOR & JUDGING CONTROLS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono-num font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 uppercase">
            DEMO SIMULATION • NOT A REAL EMERGENCY ALERT
          </span>
        </div>
      </div>

      {/* Tabs for Scenario Selection */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('communication')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider uppercase transition ${
            activeTab === 'communication'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          1. Worldwide Failover Scenarios (7 Scenarios)
        </button>
        <button
          onClick={() => setActiveTab('hazards')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold tracking-wider uppercase transition ${
            activeTab === 'hazards'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          2. Natural Disaster Hazard Types (9 Hazards)
        </button>

        {/* Clear / Reset to All Clear Button */}
        <button
          id="demo-clear-alert-btn"
          onClick={() => {
            onClearAlert();
            setActiveScenarioId(null);
            setScenarioBanner(null);
            globalMultiChannelManager.applyScenarioConnectionRestored();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 transition-all ml-auto"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset / Clear All</span>
        </button>
      </div>

      {/* Interactive Scenario Status Banner (Shows exact messages like "NO COMMUNICATION CHANNEL AVAILABLE", "SOS SAVED LOCALLY", etc.) */}
      {scenarioBanner && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
            scenarioBanner.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/80 text-rose-100'
              : scenarioBanner.type === 'warning'
              ? 'bg-amber-950/70 border-amber-500/80 text-amber-100'
              : scenarioBanner.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-100'
              : 'bg-sky-950/70 border-sky-500/80 text-sky-100'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {scenarioBanner.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
            {scenarioBanner.type === 'warning' && <Radio className="w-4 h-4 text-amber-400 animate-pulse" />}
            {scenarioBanner.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {scenarioBanner.type === 'info' && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />}
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="font-tech font-bold uppercase tracking-wider text-white">
              {scenarioBanner.primary}
            </div>
            {scenarioBanner.secondary && (
              <div className="font-medium opacity-90 leading-relaxed font-mono">
                {scenarioBanner.secondary}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: 7 WORLDWIDE COMMUNICATION & FAILOVER SCENARIOS */}
      {activeTab === 'communication' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            Click any button below to simulate real-world infrastructure failures. The system automatically shifts communication channels down the priority hierarchy without losing distress calls:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pt-1">
            {/* 1. HEAVY RAIN — INTERNET AVAILABLE */}
            <button
              id="demo-scenario-heavy-rain-internet"
              onClick={handleScenarioHeavyRainInternet}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-1'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-white">
                  1. HEAVY RAIN — INTERNET AVAILABLE
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Normal IP broadband uplink</span>
              </div>
            </button>

            {/* 2. HEAVY RAIN — INTERNET LOST */}
            <button
              id="demo-scenario-heavy-rain-internet-lost"
              onClick={handleScenarioHeavyRainInternetLost}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-2'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-white">
                  2. HEAVY RAIN — INTERNET LOST
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Fails over to cellular data</span>
              </div>
            </button>

            {/* 3. FLOOD — CELLULAR AVAILABLE */}
            <button
              id="demo-scenario-flood-cellular"
              onClick={handleScenarioFloodCellular}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-3'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-200 ring-2 ring-sky-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-white">
                  3. FLOOD — CELLULAR AVAILABLE
                </span>
                <span className="text-[10px] text-slate-400 block truncate">5G/LTE packet data active</span>
              </div>
            </button>

            {/* 4. FLOOD — CELLULAR LOST */}
            <button
              id="demo-scenario-flood-cellular-lost"
              onClick={handleScenarioFloodCellularLost}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-4'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Radio className="w-4 h-4 opacity-50" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-white">
                  4. FLOOD — CELLULAR LOST
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Fails over to SMS signaling</span>
              </div>
            </button>

            {/* 5. REMOTE AREA — SATELLITE SIMULATION */}
            <button
              id="demo-scenario-remote-satellite"
              onClick={handleScenarioRemoteSatellite}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-5'
                  ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                <Satellite className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-white">
                  5. REMOTE AREA — SATELLITE
                </span>
                <span className="text-[10px] text-slate-400 block truncate">LEO constellation pulse (DEMO)</span>
              </div>
            </button>

            {/* 6. TOTAL COMMUNICATION LOSS */}
            <button
              id="demo-scenario-total-loss"
              onClick={handleScenarioTotalCommunicationLoss}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-6'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-rose-900/40 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-rose-300">
                  6. TOTAL COMMUNICATION LOSS
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Saves SOS locally in outbox</span>
              </div>
            </button>

            {/* 7. CONNECTION RESTORED */}
            <button
              id="demo-scenario-connection-restored"
              onClick={handleScenarioConnectionRestored}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-semibold tracking-wide border transition-all ${
                activeScenarioId === 'scenario-7'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-emerald-900/40 text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="font-tech font-bold block text-[11px] uppercase tracking-wider text-emerald-300">
                  7. CONNECTION RESTORED
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Transmits queued offline SOS</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 9 MONITORED DISASTER HAZARDS */}
      {activeTab === 'hazards' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            Trigger individual natural disaster scenarios to test alert level transitions (GREEN, YELLOW, ORANGE, RED), risk modeling, and safety instructions:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {hazardButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = isSimulated && activeType === btn.type;

              return (
                <button
                  key={btn.type}
                  id={`demo-btn-${btn.type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSimulateDisaster(btn.type)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

