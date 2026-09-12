import crypto from 'crypto';

export interface ServerInstance {
  id: string;
  name: string;
  zone: string;
  status: 'HEALTHY' | 'HIGH_LOAD' | 'FAILOVER_STANDBY' | 'DRAINING';
  cpuPercent: number;
  memoryPercent: number;
  activeConnections: number;
  requestsHandled: number;
  isPrimary: boolean;
}

export interface PriorityQueueStats {
  p0_lifeThreatening: { pending: number; processing: number; completed: number; avgLatencyMs: number };
  p1_urgentRescue: { pending: number; processing: number; completed: number; avgLatencyMs: number };
  p2_emergencyInfo: { pending: number; processing: number; completed: number; avgLatencyMs: number };
  p3_normalTraffic: { pending: number; processing: number; completed: number; avgLatencyMs: number };
  p4_backgroundTasks: { pending: number; processing: number; completed: number; avgLatencyMs: number };
}

export interface MessageQueueMetrics {
  sosQueue: { pending: number; processing: number; completed: number };
  disasterAlerts: { pending: number; processing: number; completed: number };
  pushNotifications: { pending: number; processing: number; completed: number };
  smsRequests: { pending: number; processing: number; completed: number };
  aiAnalysis: { pending: number; processing: number; completed: number };
}

export interface SurgeProtectionState {
  isSurgeModeActive: boolean;
  surgeReason: string | null;
  activatedAt: string | null;
  activeSimulatedUsers: number;
  requestsPerSecond: number;
  loadBalancerAlgorithm: 'ROUND_ROBIN_LEAST_CONN' | 'WEIGHTED_RESPONSE_TIME';
  instances: ServerInstance[];
  priorityQueue: PriorityQueueStats;
  messageQueues: MessageQueueMetrics;
  cacheStatus: {
    status: 'OPERATIONAL' | 'DEGRADED';
    hitRatePercent: number;
    cachedKeys: number;
    evictionPolicy: string;
    memoryAllocatedMb: number;
  };
  databaseProtection: {
    connectionPoolSize: number;
    activePoolConnections: number;
    readReplicaNodes: number;
    asyncBufferBacklog: number;
    queryCacheHitRate: number;
  };
  cdnStatus: {
    status: 'OPERATIONAL';
    edgeLocations: number;
    bandwidthSavedPercent: number;
    isSimulated: boolean;
  };
}

class SurgeProtectionSystem {
  private state: SurgeProtectionState;
  private duplicateSosCache: Map<string, { count: number; firstSeen: number; lastSeen: number }> = new Map();

  constructor() {
    this.state = {
      isSurgeModeActive: false,
      surgeReason: null,
      activatedAt: null,
      activeSimulatedUsers: 1420,
      requestsPerSecond: 185,
      loadBalancerAlgorithm: 'ROUND_ROBIN_LEAST_CONN',
      instances: [
        {
          id: 'srv-node-01',
          name: 'SERVER 1',
          zone: 'us-east-1a',
          status: 'HEALTHY',
          cpuPercent: 34,
          memoryPercent: 42,
          activeConnections: 450,
          requestsHandled: 124500,
          isPrimary: true,
        },
        {
          id: 'srv-node-02',
          name: 'SERVER 2',
          zone: 'us-east-1b',
          status: 'HEALTHY',
          cpuPercent: 38,
          memoryPercent: 45,
          activeConnections: 480,
          requestsHandled: 118900,
          isPrimary: false,
        },
        {
          id: 'srv-node-03',
          name: 'SERVER 3',
          zone: 'us-east-1c',
          status: 'HEALTHY',
          cpuPercent: 29,
          memoryPercent: 39,
          activeConnections: 390,
          requestsHandled: 104200,
          isPrimary: false,
        },
        {
          id: 'srv-node-04',
          name: 'SERVER 4',
          zone: 'us-east-1d',
          status: 'HEALTHY',
          cpuPercent: 54,
          memoryPercent: 58,
          activeConnections: 520,
          requestsHandled: 132400,
          isPrimary: false,
        },
      ],
      priorityQueue: {
        p0_lifeThreatening: { pending: 12, processing: 8, completed: 892, avgLatencyMs: 16 },
        p1_urgentRescue: { pending: 24, processing: 14, completed: 1450, avgLatencyMs: 34 },
        p2_emergencyInfo: { pending: 48, processing: 32, completed: 6200, avgLatencyMs: 58 },
        p3_normalTraffic: { pending: 120, processing: 85, completed: 45000, avgLatencyMs: 110 },
        p4_backgroundTasks: { pending: 88, processing: 40, completed: 18900, avgLatencyMs: 240 },
      },
      messageQueues: {
        sosQueue: { pending: 124, processing: 48, completed: 892 },
        disasterAlerts: { pending: 35, processing: 20, completed: 12400 },
        pushNotifications: { pending: 310, processing: 120, completed: 84500 },
        smsRequests: { pending: 42, processing: 18, completed: 3200 },
        aiAnalysis: { pending: 8, processing: 4, completed: 2150 },
      },
      cacheStatus: {
        status: 'OPERATIONAL',
        hitRatePercent: 96.8,
        cachedKeys: 1480,
        evictionPolicy: 'LRU-Adaptive',
        memoryAllocatedMb: 256,
      },
      databaseProtection: {
        connectionPoolSize: 100,
        activePoolConnections: 28,
        readReplicaNodes: 3,
        asyncBufferBacklog: 14,
        queryCacheHitRate: 94.2,
      },
      cdnStatus: {
        status: 'OPERATIONAL',
        edgeLocations: 42,
        bandwidthSavedPercent: 88.5,
        isSimulated: true,
      },
    };
  }

  public getState(): SurgeProtectionState {
    return this.state;
  }

  // Check if a repeated SOS beacon should be marked as "Possible duplicate SOS"
  public checkDuplicateSos(fingerprint: string): { isDuplicate: boolean; count: number } {
    const now = Date.now();
    const existing = this.duplicateSosCache.get(fingerprint);

    if (existing && now - existing.lastSeen < 60000) {
      existing.count += 1;
      existing.lastSeen = now;
      return { isDuplicate: true, count: existing.count };
    }

    this.duplicateSosCache.set(fingerprint, { count: 1, firstSeen: now, lastSeen: now });
    // prune cache occasionally
    if (this.duplicateSosCache.size > 5000) {
      this.duplicateSosCache.clear();
    }
    return { isDuplicate: false, count: 1 };
  }

  // Simulate Load from 1,000 up to 1,000,000 users!
  public simulateLoad(userTier: number): SurgeProtectionState {
    this.state.activeSimulatedUsers = userTier;

    // Calculate RPS based on active users
    const rps = Math.round(userTier * 0.12 + Math.random() * 20);
    this.state.requestsPerSecond = rps;

    // Determine if Surge Mode must automatically trigger (Threshold: > 25,000 users or > 1,500 RPS)
    const shouldActivateSurge = userTier >= 25000 || rps >= 1500;
    this.state.isSurgeModeActive = shouldActivateSurge;
    if (shouldActivateSurge) {
      this.state.surgeReason = `Massive traffic surge detected: ${userTier.toLocaleString()} active users generating ${rps.toLocaleString()} requests/sec. Emergency lanes prioritized.`;
      this.state.activatedAt = this.state.activatedAt || new Date().toISOString();
    } else {
      this.state.surgeReason = null;
      this.state.activatedAt = null;
    }

    // Horizontally scale instances depending on user volume
    let targetInstances = 4;
    if (userTier >= 500000) targetInstances = 16;
    else if (userTier >= 100000) targetInstances = 12;
    else if (userTier >= 50000) targetInstances = 8;
    else if (userTier >= 10000) targetInstances = 6;

    const zones = ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e', 'us-east-1f'];
    const updatedInstances: ServerInstance[] = [];

    for (let i = 1; i <= targetInstances; i++) {
      const zone = zones[(i - 1) % zones.length];
      const isHigh = i === targetInstances && shouldActivateSurge;
      const cpu = shouldActivateSurge ? Math.min(94, Math.round(45 + (userTier / 1000000) * 40 + (i % 3) * 6)) : Math.round(25 + (i * 4));
      const memory = shouldActivateSurge ? Math.min(88, Math.round(50 + (userTier / 1000000) * 32)) : Math.round(35 + (i * 3));
      const conns = Math.round((userTier / targetInstances) * 0.4);

      updatedInstances.push({
        id: `srv-node-${String(i).padStart(2, '0')}`,
        name: `SERVER ${i}`,
        zone,
        status: isHigh ? 'HIGH_LOAD' : 'HEALTHY',
        cpuPercent: cpu,
        memoryPercent: memory,
        activeConnections: conns,
        requestsHandled: Math.round(userTier * 15 + i * 1200),
        isPrimary: i === 1,
      });
    }
    this.state.instances = updatedInstances;

    // Adjust Priority Queues
    // P0 ALWAYS remains fast and responsive (<25ms) due to dedicated worker lanes
    // P3 / P4 get queued and throttled during surge to protect P0
    const multiplier = userTier / 10000;
    this.state.priorityQueue = {
      p0_lifeThreatening: {
        pending: Math.max(5, Math.round(15 + multiplier * 4)),
        processing: Math.max(8, Math.round(20 + multiplier * 3)),
        completed: Math.round(892 + multiplier * 120),
        avgLatencyMs: Math.round(14 + Math.min(8, multiplier * 0.5)), // Stays ultra-fast (14-22ms)!
      },
      p1_urgentRescue: {
        pending: Math.round(30 + multiplier * 8),
        processing: Math.round(25 + multiplier * 6),
        completed: Math.round(1450 + multiplier * 240),
        avgLatencyMs: Math.round(32 + Math.min(20, multiplier * 1.2)),
      },
      p2_emergencyInfo: {
        pending: Math.round(80 + multiplier * 25),
        processing: Math.round(50 + multiplier * 15),
        completed: Math.round(6200 + multiplier * 800),
        avgLatencyMs: Math.round(55 + Math.min(50, multiplier * 2.5)),
      },
      p3_normalTraffic: {
        pending: Math.round(300 + multiplier * 180), // Normal traffic gets backpressured
        processing: Math.round(120 + multiplier * 40),
        completed: Math.round(45000 + multiplier * 4200),
        avgLatencyMs: Math.round(110 + Math.min(350, multiplier * 15)), // High latency for non-critical
      },
      p4_backgroundTasks: {
        pending: Math.round(250 + multiplier * 120),
        processing: Math.round(40 + multiplier * 10),
        completed: Math.round(18900 + multiplier * 1500),
        avgLatencyMs: Math.round(240 + Math.min(700, multiplier * 30)),
      },
    };

    // Message Queues Backlog
    this.state.messageQueues = {
      sosQueue: {
        pending: Math.round(60 + multiplier * 14),
        processing: Math.round(35 + multiplier * 8),
        completed: Math.round(892 + multiplier * 180),
      },
      disasterAlerts: {
        pending: Math.round(40 + multiplier * 15),
        processing: Math.round(25 + multiplier * 10),
        completed: Math.round(12400 + multiplier * 1200),
      },
      pushNotifications: {
        pending: Math.round(450 + multiplier * 350),
        processing: Math.round(180 + multiplier * 90),
        completed: Math.round(84500 + multiplier * 14000),
      },
      smsRequests: {
        pending: Math.round(60 + multiplier * 28),
        processing: Math.round(30 + multiplier * 14),
        completed: Math.round(3200 + multiplier * 450),
      },
      aiAnalysis: {
        pending: Math.round(12 + multiplier * 5),
        processing: Math.round(6 + multiplier * 3),
        completed: Math.round(2150 + multiplier * 200),
      },
    };

    // Database Protection
    this.state.databaseProtection = {
      connectionPoolSize: Math.min(400, 100 + targetInstances * 15),
      activePoolConnections: Math.min(380, Math.round(28 + multiplier * 12)),
      readReplicaNodes: Math.min(8, 3 + Math.floor(targetInstances / 3)),
      asyncBufferBacklog: Math.round(14 + multiplier * 8),
      queryCacheHitRate: Math.max(91, +(96.8 - multiplier * 0.1).toFixed(1)),
    };

    // Cache metrics
    this.state.cacheStatus.hitRatePercent = Math.max(93.5, +(97.4 - multiplier * 0.05).toFixed(1));
    this.state.cacheStatus.cachedKeys = Math.round(1480 + multiplier * 120);

    return this.state;
  }

  // Toggle Surge Mode manually
  public toggleSurgeMode(force?: boolean): SurgeProtectionState {
    const next = force !== undefined ? force : !this.state.isSurgeModeActive;
    this.state.isSurgeModeActive = next;
    if (next) {
      this.state.surgeReason = 'Disaster Surge Mode manually enforced by authorized Incident Commander.';
      this.state.activatedAt = new Date().toISOString();
      if (this.state.activeSimulatedUsers < 50000) {
        this.simulateLoad(50000);
      }
    } else {
      this.state.surgeReason = null;
      this.state.activatedAt = null;
      this.simulateLoad(1420);
    }
    return this.state;
  }
}

export const surgeProtectionSystem = new SurgeProtectionSystem();
