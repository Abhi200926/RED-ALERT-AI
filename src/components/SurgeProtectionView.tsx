import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  Cpu,
  Database,
  Layers,
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  ArrowRight,
  TrendingUp,
  Sliders,
  LifeBuoy,
  MessageSquare,
  Bell,
  Sparkles,
  Copy,
  Lock,
} from 'lucide-react';
import { SurgeProtectionState, ServerInstance } from '../types';

interface SurgeProtectionViewProps {
  surgeState: SurgeProtectionState | null;
  onSimulateLoad: (users: number) => Promise<void>;
  onToggleSurgeMode: () => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const SurgeProtectionView: React.FC<SurgeProtectionViewProps> = ({
  surgeState,
  onSimulateLoad,
  onToggleSurgeMode,
  onRefresh,
  isLoading = false,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(surgeState?.activeSimulatedUsers || 10000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleSelectTier = async (tier: number) => {
    setSelectedTier(tier);
    setIsSimulating(true);
    try {
      await onSimulateLoad(tier);
    } finally {
      setIsSimulating(false);
    }
  };

  const isSurge = surgeState?.isSurgeModeActive ?? false;
  const instances = surgeState?.instances || [];
  const priority = surgeState?.priorityQueue;
  const queues = surgeState?.messageQueues;
  const cache = surgeState?.cacheStatus;
  const db = surgeState?.databaseProtection;

  const loadTiers = [
    { label: '1,000 Users', value: 1000, desc: 'Normal Day-to-Day Operations', icon: Radio },
    { label: '10,000 Users', value: 10000, desc: 'Severe Weather Warning', icon: Bell },
    { label: '50,000 Users', value: 50000, desc: 'Cyclone Approaching Coast (Surge)', icon: AlertTriangle },
    { label: '100,000 Users', value: 100000, desc: 'Catastrophic Flood Event (Surge)', icon: Flame },
    { label: '500,000 Users', value: 500000, desc: 'Mega Regional Earthquake (12 Nodes)', icon: Activity },
    { label: '1,000,000 Users', value: 1000000, desc: 'National Emergency Peak (16 Nodes)', icon: Zap },
  ];

  return (
    <div id="surge-protection-view" className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-tech font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Disaster Surge & High-Concurrence Engine
            </span>
            <span className="text-xs text-slate-400">• Horizontal Auto-Scaler v4.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-tech font-bold uppercase tracking-wide text-white mt-1">
            Massive Traffic & Surge Protection System
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Multi-tiered load balancing, prioritized SOS queues, edge caching, and automated horizontal scaling engineered to withstand 1,000,000+ simultaneous disaster refugees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="refresh-surge-metrics-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
            title="Refresh live telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            id="toggle-surge-mode-btn"
            onClick={onToggleSurgeMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-tech font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
              isSurge
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isSurge ? 'Deactivate Surge Mode' : 'Force Surge Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT DISASTER SURGE STATUS CARD */}
      <div
        id="disaster-surge-status-banner"
        className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
          isSurge
            ? 'bg-gradient-to-r from-red-950/90 via-rose-950/80 to-amber-950/70 border-rose-500/80 shadow-2xl shadow-rose-950/60'
            : 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/70 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-all ${
                isSurge
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-tech font-bold uppercase tracking-wider text-white">
                  {isSurge ? '🚨 DISASTER SURGE MODE' : '🟢 SURGE ENGINE: STANDBY (NORMAL LOAD)'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-num font-bold uppercase border ${
                    isSurge
                      ? 'bg-rose-500/30 text-rose-200 border-rose-400/50 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isSurge ? 'ACTIVE' : 'NOMINAL'}
                </span>
              </div>

              <p className="text-sm font-medium mt-1.5 text-slate-200">
                {isSurge ? (
                  <span className="text-rose-200 font-semibold">
                    System traffic is extremely high. Emergency services are being prioritized.
                  </span>
                ) : (
                  <span className="text-slate-400">
                    System operating at standard capacity. All background services and analytical feeds operational.
                  </span>
                )}
              </p>

              {isSurge && surgeState?.surgeReason && (
                <p className="text-xs text-rose-300/80 font-mono-num mt-2 bg-black/40 px-3 py-1.5 rounded-lg border border-rose-500/30 inline-block">
                  Trigger: {surgeState.surgeReason}
                </p>
              )}
            </div>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-black/40 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-tech text-slate-400">Active Users</div>
              <div className="text-lg sm:text-xl font-mono-num font-bold text-white mt-0.5">
                {surgeState?.activeSimulatedUsers.toLocaleString() || '1,420'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono-num">Real-Time</div>
            </div>

            <div className="bg-black/40 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-tech text-slate-400">Throughput</div>
              <div className="text-lg sm:text-xl font-mono-num font-bold text-amber-400 mt-0.5">
                {surgeState?.requestsPerSecond.toLocaleString() || '185'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono-num">Req / Sec</div>
            </div>

            <div className="bg-black/40 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-tech text-slate-400">Active Nodes</div>
              <div className="text-lg sm:text-xl font-mono-num font-bold text-cyan-400 mt-0.5">
                {instances.length}
              </div>
              <div className="text-[10px] text-slate-400 font-mono-num">Auto-Scaled</div>
            </div>

            <div className="bg-black/40 border border-slate-800 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-tech text-slate-400">P0 Latency</div>
              <div className="text-lg sm:text-xl font-mono-num font-bold text-rose-400 mt-0.5">
                {priority?.p0_lifeThreatening.avgLatencyMs || 16}ms
              </div>
              <div className="text-[10px] text-rose-300 font-mono-num">Dedicated Lane</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE LOAD SIMULATOR (1K to 1M Users) */}
      <div id="demo-load-simulator-card" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>Massive Disaster Traffic Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a catastrophic surge scenario to watch the load balancer, message queues, and horizontal auto-scaler adapt in real time.
            </p>
          </div>
          <span className="text-[11px] font-mono-num text-slate-400">
            Selected Tier: <strong className="text-rose-400">{selectedTier.toLocaleString()} Concurrent Users</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loadTiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.value;
            return (
              <button
                key={tier.value}
                id={`simulate-tier-${tier.value}`}
                onClick={() => handleSelectTier(tier.value)}
                disabled={isSimulating}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span className={`font-tech font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {tier.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-tech font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-snug">{tier.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SCALABLE BACKEND ARCHITECTURE & LOAD BALANCER VISUALIZATION */}
      <div id="backend-architecture-card" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Tier High-Availability Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Traffic flows through redundant failover layers to guarantee zero downtime for life-saving SOS beacons.
            </p>
          </div>
          <span className="text-[11px] font-mono-num text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/60">
            Algorithm: Least-Connections (Adaptive Dynamic Weighting)
          </span>
        </div>

        {/* Visual Architecture Pipeline Flow */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between text-center text-xs font-tech">
            {/* Step 1 */}
            <div className="flex-1 px-2 py-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Traffic Source</div>
              <div className="text-white font-bold mt-1 text-sm">Disaster Refugees</div>
              <div className="text-[10px] text-emerald-400 font-mono-num mt-1">
                {surgeState?.activeSimulatedUsers.toLocaleString()} Citizens
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 mx-2 shrink-0" />

            {/* Step 2 */}
            <div className="flex-1 px-2 py-3 rounded-lg bg-slate-900/90 border border-rose-500/40">
              <div className="text-[10px] text-rose-400 uppercase tracking-wide">Layer 4 / 7</div>
              <div className="text-white font-bold mt-1 text-sm">Load Balancer</div>
              <div className="text-[10px] text-amber-400 font-mono-num mt-1">
                {surgeState?.requestsPerSecond.toLocaleString()} RPS Ingress
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 mx-2 shrink-0" />

            {/* Step 3 */}
            <div className="flex-1 px-2 py-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Compute Nodes</div>
              <div className="text-white font-bold mt-1 text-sm">App Servers</div>
              <div className="text-[10px] text-cyan-400 font-mono-num mt-1">
                {instances.length} Auto-Scaled
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 mx-2 shrink-0" />

            {/* Step 4 */}
            <div className="flex-1 px-2 py-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Priority Broker</div>
              <div className="text-white font-bold mt-1 text-sm">Message Queues</div>
              <div className="text-[10px] text-rose-400 font-mono-num mt-1">
                P0-P4 Separation
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 mx-2 shrink-0" />

            {/* Step 5 */}
            <div className="flex-1 px-2 py-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Storage & Edge</div>
              <div className="text-white font-bold mt-1 text-sm">DB & LRU Cache</div>
              <div className="text-[10px] text-emerald-400 font-mono-num mt-1">
                {cache?.hitRatePercent}% Cache Hit
              </div>
            </div>
          </div>
        </div>

        {/* Live Server Instances Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-tech font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Application Server Cluster ({instances.length} Nodes Online)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono-num">
              Cluster CPU: {Math.round(instances.reduce((acc, i) => acc + i.cpuPercent, 0) / (instances.length || 1))}% Avg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {instances.map((srv) => {
              const isHigh = srv.status === 'HIGH_LOAD';
              return (
                <div
                  key={srv.id}
                  id={`server-instance-${srv.id}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isHigh
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-tech font-bold text-white text-sm">{srv.name}</span>
                      {srv.isPrimary && (
                        <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] text-slate-300 font-mono-num">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isHigh ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono-num font-bold ${
                          isHigh ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {isHigh ? '🟡 HIGH LOAD' : '🟢 HEALTHY'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono-num text-slate-500 mt-1">{srv.zone}</div>

                  <div className="mt-3 space-y-2 text-xs">
                    {/* CPU */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400">
                        <span>CPU Usage</span>
                        <span className={srv.cpuPercent > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {srv.cpuPercent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            srv.cpuPercent > 80
                              ? 'bg-rose-500'
                              : srv.cpuPercent > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${srv.cpuPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* RAM */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400">
                        <span>Memory</span>
                        <span className="text-slate-300">{srv.memoryPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${srv.memoryPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Active Connections */}
                    <div className="flex items-center justify-between text-[11px] font-mono-num pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500">Connections</span>
                      <span className="text-slate-300 font-bold">{srv.activeConnections.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. SOS PRIORITY QUEUE SYSTEM (P0 to P4) */}
      <div id="sos-priority-queue-card" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>SOS Priority Queue Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Emergency requests take strict precedence over non-critical app features during surge load.
            </p>
          </div>
          <span className="text-[11px] font-mono-num text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/60">
            P0 Workers: Dedicated Non-Preemptible Thread Pool
          </span>
        </div>

        <div className="space-y-3">
          {/* P0 */}
          <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-tech font-extrabold text-sm shrink-0 shadow-md shadow-rose-600/40">
                P0
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-tech font-bold text-white text-sm">LIFE-THREATENING SOS</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                    HIGHEST PRIORITY
                  </span>
                </div>
                <p className="text-xs text-rose-200/80">Trapped survivors, medical emergencies, drowning, structural collapses</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-num text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Pending</span>
                <span className="font-bold text-white">{priority?.p0_lifeThreatening.pending || 12}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Processing</span>
                <span className="font-bold text-amber-400">{priority?.p0_lifeThreatening.processing || 8}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Completed</span>
                <span className="font-bold text-emerald-400">{priority?.p0_lifeThreatening.completed || 892}</span>
              </div>
              <div className="bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/40 text-center">
                <span className="text-rose-400 text-[10px] block uppercase">Avg Latency</span>
                <span className="font-bold text-rose-200">{priority?.p0_lifeThreatening.avgLatencyMs || 16}ms</span>
              </div>
            </div>
          </div>

          {/* P1 */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-tech font-extrabold text-sm shrink-0">
                P1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-tech font-bold text-white text-sm">URGENT RESCUE</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px] font-bold">HIGH</span>
                </div>
                <p className="text-xs text-amber-200/80">Rising waters, stranded elderlies, cut-off access roads</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-num text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Pending</span>
                <span className="font-bold text-white">{priority?.p1_urgentRescue.pending || 24}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Processing</span>
                <span className="font-bold text-amber-400">{priority?.p1_urgentRescue.processing || 14}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Completed</span>
                <span className="font-bold text-emerald-400">{priority?.p1_urgentRescue.completed || 1450}</span>
              </div>
              <div className="bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/30 text-center">
                <span className="text-amber-400 text-[10px] block uppercase">Avg Latency</span>
                <span className="font-bold text-amber-200">{priority?.p1_urgentRescue.avgLatencyMs || 34}ms</span>
              </div>
            </div>
          </div>

          {/* P2 */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-tech font-extrabold text-sm shrink-0">
                P2
              </div>
              <div>
                <span className="font-tech font-bold text-white text-sm">EMERGENCY INFORMATION</span>
                <p className="text-xs text-slate-400">Official evacuation corridors, shelter capacity, civil protection broadcasts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-num text-slate-400">
              <div>
                <span className="text-[10px] block uppercase">Pending</span>
                <span className="font-bold text-white">{priority?.p2_emergencyInfo.pending || 48}</span>
              </div>
              <div>
                <span className="text-[10px] block uppercase">Latency</span>
                <span className="font-bold text-slate-200">{priority?.p2_emergencyInfo.avgLatencyMs || 58}ms</span>
              </div>
            </div>
          </div>

          {/* P3 & P4 (Throttle during Surge) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-tech font-bold text-xs">P3</span>
                  <span className="font-tech font-bold text-slate-300 text-xs">NORMAL APP TRAFFIC</span>
                </div>
                {isSurge && (
                  <span className="text-[10px] font-mono-num text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800">
                    THROTTLED DURING SURGE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">General app queries, history browsing, radar map tiles</p>
              <div className="flex items-center justify-between text-xs font-mono-num text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Backlog: {priority?.p3_normalTraffic.pending || 120}</span>
                <span>Latency: {priority?.p3_normalTraffic.avgLatencyMs || 110}ms</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-tech font-bold text-xs">P4</span>
                  <span className="font-tech font-bold text-slate-300 text-xs">NON-CRITICAL BACKGROUND</span>
                </div>
                {isSurge && (
                  <span className="text-[10px] font-mono-num text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800">
                    DEFERRED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Telemetry analytics aggregation, audit rollups, log archives</p>
              <div className="flex items-center justify-between text-xs font-mono-num text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Backlog: {priority?.p4_backgroundTasks.pending || 88}</span>
                <span>Latency: {priority?.p4_backgroundTasks.avgLatencyMs || 240}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MESSAGE QUEUES STATUS & METRICS */}
      <div id="message-queues-card" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Distributed Message Queues Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Decoupled worker queues process async dispatches without stalling the main web tier.
            </p>
          </div>
          <span className="text-[11px] font-mono-num text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Worker Pool Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* SOS Queue */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/40">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-rose-400" />
              <span className="font-tech font-bold text-white text-xs">SOS QUEUE</span>
            </div>
            <div className="mt-2 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pending:</span>
                <span className="text-white font-bold">{queues?.sosQueue.pending || 124}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing:</span>
                <span className="text-amber-400">{queues?.sosQueue.processing || 48}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-emerald-400">{queues?.sosQueue.completed || 892}</span>
              </div>
            </div>
          </div>

          {/* Disaster Alerts */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-tech font-bold text-white text-xs">ALERTS QUEUE</span>
            </div>
            <div className="mt-2 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pending:</span>
                <span className="text-white font-bold">{queues?.disasterAlerts.pending || 35}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing:</span>
                <span className="text-amber-400">{queues?.disasterAlerts.processing || 20}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-emerald-400">{queues?.disasterAlerts.completed || 12400}</span>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="font-tech font-bold text-white text-xs">PUSH QUEUE</span>
            </div>
            <div className="mt-2 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pending:</span>
                <span className="text-white font-bold">{queues?.pushNotifications.pending || 310}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing:</span>
                <span className="text-amber-400">{queues?.pushNotifications.processing || 120}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-emerald-400">{queues?.pushNotifications.completed || 84500}</span>
              </div>
            </div>
          </div>

          {/* SMS Requests */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="font-tech font-bold text-white text-xs">SMS DISPATCH</span>
            </div>
            <div className="mt-2 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pending:</span>
                <span className="text-white font-bold">{queues?.smsRequests.pending || 42}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing:</span>
                <span className="text-amber-400">{queues?.smsRequests.processing || 18}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-emerald-400">{queues?.smsRequests.completed || 3200}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="font-tech font-bold text-white text-xs">AI ANALYSIS</span>
            </div>
            <div className="mt-2 space-y-1 font-mono-num text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pending:</span>
                <span className="text-white font-bold">{queues?.aiAnalysis.pending || 8}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing:</span>
                <span className="text-amber-400">{queues?.aiAnalysis.processing || 4}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-emerald-400">{queues?.aiAnalysis.completed || 2150}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. DATABASE & CACHING PROTECTION + DUPLICATE SOS PROTECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Database & Caching */}
        <div id="database-caching-card" className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Database & Edge Cache Protection</span>
            </h3>
            <span className="text-[11px] font-tech font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CACHE STATUS: 🟢 Operational</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">Distributed Edge Cache Hit Rate</span>
                <span className="font-mono-num font-bold text-emerald-400">{cache?.hitRatePercent || 96.8}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Static safety instructions, regional shelters, and historical alert templates served directly from LRU RAM.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono-num">
                <span className="text-[10px] text-slate-400 block uppercase">Connection Pool</span>
                <span className="font-bold text-white text-sm">
                  {db?.activePoolConnections || 28} / {db?.connectionPoolSize || 100}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Auto-Scaling</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono-num">
                <span className="text-[10px] text-slate-400 block uppercase">Read Replicas</span>
                <span className="font-bold text-cyan-400 text-sm">{db?.readReplicaNodes || 3} Nodes Active</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Read/Write Separation</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
              <span>Asynchronous Buffer Backlog:</span>
              <span className="font-mono-num text-white font-bold">{db?.asyncBufferBacklog || 14} batches</span>
            </div>
          </div>
        </div>

        {/* Duplicate SOS Protection */}
        <div id="duplicate-sos-protection-card" className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-tech text-base font-bold uppercase text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Duplicate SOS Protection Engine</span>
            </h3>
            <span className="text-[10px] font-mono-num font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
              Zero Silent Drops
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-300 leading-relaxed">
              During panic, terrified citizens frequently tap the emergency beacon multiple times. <strong>RED ALERT AI never discards emergency requests</strong>. Instead, rapid repeated beacons from the same client/location are grouped:
            </p>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Example Grouped Beacon Output</span>
              </div>
              <div className="bg-black/50 p-2.5 rounded font-mono-num text-[11px] text-slate-300 border border-slate-800">
                [Possible duplicate SOS — Device beacon count: 4] Need evacuation at Riverside 4th Floor
              </div>
              <p className="text-[11px] text-amber-200/80">
                Rescue operators see the accumulated repetition count while the rescue ticket maintains its unified thread without flooding the database.
              </p>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full cryptographic audit trail recorded in secure tamper-proof ledger.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
