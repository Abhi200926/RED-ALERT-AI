import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  Satellite,
  Share2,
  HardDrive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { NetworkStatusIndicator, CommunicationChannel } from '../types';
import { globalMultiChannelManager, ChannelStatus, PROTOTYPE_DISCLAIMER } from '../services/communicationService';
import { OfflineStorageService } from '../services/offlineStorage';
import { SosService } from '../services/sosService';

interface NetworkStatusIndicatorBarProps {
  onSimulateRainFloodScenario?: () => void;
}

export const NetworkStatusIndicatorBar: React.FC<NetworkStatusIndicatorBarProps> = ({
  onSimulateRainFloodScenario,
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusIndicator>('ONLINE');
  const [channels, setChannels] = useState<ChannelStatus[]>(globalMultiChannelManager.getAllChannelStatuses());
  const [expanded, setExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [outboxCount, setOutboxCount] = useState(OfflineStorageService.getQueuedSosRequests().length);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initial status
    globalMultiChannelManager.getOverallNetworkStatus().then((s) => setNetworkStatus(s));
    setChannels(globalMultiChannelManager.getAllChannelStatuses());

    const unsubscribe = globalMultiChannelManager.subscribe((status, updatedChannels) => {
      setNetworkStatus(status);
      setChannels(updatedChannels);
      setOutboxCount(OfflineStorageService.getQueuedSosRequests().length);
    });

    const interval = setInterval(() => {
      setOutboxCount(OfflineStorageService.getQueuedSosRequests().length);
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleToggleChannel = (channel: CommunicationChannel, currentAvailable: boolean) => {
    globalMultiChannelManager.setChannelOverride(channel, !currentAvailable);
    setChannels(globalMultiChannelManager.getAllChannelStatuses());
    globalMultiChannelManager.getOverallNetworkStatus().then(setNetworkStatus);
  };

  const handleSimulateAllOffline = () => {
    globalMultiChannelManager.setChannelOverride('INTERNET', false);
    globalMultiChannelManager.setChannelOverride('CELLULAR', false);
    globalMultiChannelManager.setChannelOverride('SMS', false);
    globalMultiChannelManager.setChannelOverride('SATELLITE', false);
    globalMultiChannelManager.setChannelOverride('RELAY', false);
    setChannels(globalMultiChannelManager.getAllChannelStatuses());
    setNetworkStatus('OFFLINE');
    setBannerMessage('All wireless networks severed. Prototype operating in Local Offline Outbox mode.');
  };

  const handleSimulateSmsOnly = () => {
    globalMultiChannelManager.setChannelOverride('INTERNET', false);
    globalMultiChannelManager.setChannelOverride('CELLULAR', false);
    globalMultiChannelManager.setChannelOverride('SMS', true);
    globalMultiChannelManager.setChannelOverride('SATELLITE', false);
    globalMultiChannelManager.setChannelOverride('RELAY', false);
    setChannels(globalMultiChannelManager.getAllChannelStatuses());
    setNetworkStatus('SMS AVAILABLE');
    setBannerMessage('Data uplink failed; switched to Emergency SMS Fallback signaling channel.');
  };

  const handleRestoreAllNetworks = () => {
    globalMultiChannelManager.setChannelOverride('INTERNET', true);
    globalMultiChannelManager.setChannelOverride('CELLULAR', true);
    globalMultiChannelManager.setChannelOverride('SMS', true);
    globalMultiChannelManager.setChannelOverride('SATELLITE', false);
    globalMultiChannelManager.setChannelOverride('RELAY', false);
    setChannels(globalMultiChannelManager.getAllChannelStatuses());
    setNetworkStatus('ONLINE');
    setBannerMessage('Broadband and cellular packet links fully restored.');
  };

  const handleRetryOutbox = async () => {
    setIsRetrying(true);
    try {
      const res = await SosService.retryQueuedRequests();
      setOutboxCount(res.remainingCount);
      if (res.sentCount > 0) {
        setBannerMessage(`Transmitted ${res.sentCount} queued SOS distress beacon(s) successfully.`);
      } else if (res.remainingCount > 0) {
        setBannerMessage('Uplink still offline. Requests remain safely queued in device outbox.');
      }
    } catch {
      setBannerMessage('Transmission retry pending network synchronization.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = () => {
    switch (networkStatus) {
      case 'ONLINE':
        return {
          icon: Wifi,
          label: 'ONLINE (HIGH BANDWIDTH)',
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'CELLULAR ONLY':
        return {
          icon: Radio,
          label: 'CELLULAR ONLY (5G/LTE)',
          bg: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
          dot: 'bg-blue-400',
        };
      case 'SMS AVAILABLE':
        return {
          icon: Radio,
          label: 'SMS FALLBACK AVAILABLE',
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'SATELLITE AVAILABLE':
        return {
          icon: Satellite,
          label: 'SATELLITE UPLINK ACTIVE',
          bg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
          dot: 'bg-indigo-400',
        };
      case 'RELAY AVAILABLE':
        return {
          icon: Share2,
          label: 'MESH RELAY ACTIVE',
          bg: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
          dot: 'bg-purple-400',
        };
      case 'WEAK CONNECTION':
        return {
          icon: Wifi,
          label: 'WEAK SIGNAL',
          bg: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
          dot: 'bg-yellow-400',
        };
      case 'OFFLINE':
      default:
        return {
          icon: WifiOff,
          label: 'OFFLINE — LOCAL OUTBOX ACTIVE',
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
          dot: 'bg-rose-500',
        };
    }
  };

  const badge = getStatusBadge();
  const StatusIcon = badge.icon;

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm text-xs">
      {/* Top compact bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono-num font-semibold text-[11px] ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </div>

          {outboxCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono-num font-medium">
              <HardDrive className="w-3 h-3" />
              <span>{outboxCount} SOS Queued in Device Outbox</span>
              <button
                onClick={handleRetryOutbox}
                disabled={isRetrying}
                className="ml-1 text-[10px] underline hover:text-white flex items-center gap-0.5"
                title="Retry sending queued distress beacon"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isRetrying ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSimulateRainFloodScenario && (
            <button
              onClick={onSimulateRainFloodScenario}
              className="px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/60 border border-rose-600/50 text-rose-200 text-[11px] font-medium transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Simulate Rain / Flood Outage</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
          >
            <span>Multi-Channel Controls</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-1.5 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {bannerMessage}
          </span>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-slate-100 text-[10px] ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expanded Multi-channel matrix & simulation cockpit */}
      {expanded && (
        <div className="border-t border-slate-800 bg-slate-900/95 p-4 max-w-7xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <h3 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">
                Multi-Channel Failover Hierarchy
              </h3>
              <p className="text-[11px] text-slate-400">
                When one channel fails due to storm damage, RED ALERT AI automatically routes through the next available path.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSimulateAllOffline}
                className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-[10px] font-mono-num"
              >
                Cut All Signals (Force Offline)
              </button>
              <button
                onClick={handleSimulateSmsOnly}
                className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-[10px] font-mono-num"
              >
                SMS Only Mode
              </button>
              <button
                onClick={handleRestoreAllNetworks}
                className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-[10px] font-mono-num"
              >
                Restore All Networks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {channels.map((ch, idx) => {
              const icons: Record<string, any> = {
                INTERNET: Wifi,
                CELLULAR: Radio,
                SMS: Radio,
                SATELLITE: Satellite,
                RELAY: Share2,
                OFFLINE_QUEUE: HardDrive,
              };
              const Icon = icons[ch.channel] || Wifi;

              return (
                <div
                  key={ch.channel}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between transition ${
                    ch.isAvailable
                      ? 'bg-slate-900 border-slate-700/80'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          ch.isAvailable
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                          <span>
                            {idx + 1}. {ch.displayName}
                          </span>
                          {ch.isSimulated && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase font-bold">
                              DEMO SIMULATION
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{ch.carrierOrHardware}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleChannel(ch.channel, ch.isAvailable)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                        ch.isAvailable
                          ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-rose-950 hover:text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-emerald-950 hover:text-emerald-300'
                      }`}
                    >
                      {ch.isAvailable ? 'ACTIVE' : 'OFFLINE'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {ch.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Prototype Disclaimer */}
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{PROTOTYPE_DISCLAIMER}</span>
          </div>
        </div>
      )}
    </div>
  );
};
