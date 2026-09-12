export type AlertSeverity = 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL';

export type DisasterType =
  | 'Heavy Rain'
  | 'Flood'
  | 'Cyclone'
  | 'Earthquake'
  | 'Landslide'
  | 'Tsunami'
  | 'Severe Storm'
  | 'Wildfire'
  | 'Extreme Heat';

export type CommunicationChannel =
  | 'INTERNET'
  | 'CELLULAR'
  | 'SMS'
  | 'SATELLITE'
  | 'RELAY'
  | 'OFFLINE_QUEUE';

export type NetworkStatusIndicator =
  | 'ONLINE'
  | 'CELLULAR ONLY'
  | 'SMS AVAILABLE'
  | 'WEAK CONNECTION'
  | 'OFFLINE'
  | 'SATELLITE AVAILABLE'
  | 'RELAY AVAILABLE';

export type RescuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskClassification = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactorWeight {
  factor: string;
  score: number;
  weight: string;
  impact: 'low' | 'moderate' | 'high' | 'critical';
  details: string;
}

export interface AiEmergencyRiskAssessment {
  riskScore: number; // 0–100
  priorityLevel: RiskClassification; // LOW | MODERATE | HIGH | CRITICAL
  explanation: string; // e.g. "Large affected population + rapidly developing hazard + limited evacuation time."
  mainFactors: RiskFactorWeight[];
  recommendedResponsePriority: string; // e.g. "Immediate Tactical Evacuation & ALS Units"
  disasterType: string;
  severity: string;
  peopleAffected: string;
  location: string;
  urgency: string;
  description: string;
  availableInfo: string;
  calculatedAt: string;
  model: string;
  isDemoSimulation: boolean;
}

export interface Alert {
  id: string;
  disasterType: DisasterType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  country?: string;
  region?: string;
  affectedArea?: string;
  lastUpdated?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  source: string;
  isDemo: boolean;
  confidence: 'Preliminary' | 'Moderate' | 'High';
  affectedRadiusKm: number;
  distanceKm?: number;
  officialWarning: string;
  parameters: Record<string, string | number>;
  isOfflineCached?: boolean;
  aiAnalysis?: {
    explanation: string;
    safetyActions: string[];
    confidenceIndicator: string;
    disclaimer: string;
  };
  riskAssessment?: AiEmergencyRiskAssessment;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  source: string;
  severity: AlertSeverity;
  disasterType: DisasterType;
  isDemo?: boolean;
}

export interface SafetyGuide {
  disasterType: DisasterType;
  iconName: string;
  summary: string;
  before: string[];
  during: string[];
  after: string[];
  evacuationTip: string;
}

export interface AuthorizedEmergencyProvider {
  id: string;
  name: string;
  category: 'Civil Defense' | 'Coast Guard' | 'Fire & Rescue' | 'Emergency Medical' | 'Police & Public Safety';
  contactNumber: string;
  dispatchProtocol: 'CAD-API' | 'RADIO-GATEWAY' | 'SMS-RELAY' | 'TELEPHONE';
  jurisdiction: string;
}

export interface CountryEmergencyConfig {
  code: string;
  name: string;
  flag: string;
  universalEmergency: string;
  police: string;
  ambulance: string;
  fire: string;
  disasterAgency: string;
  defaultTimezone: string;
  cities: { name: string; region: string; lat: number; lng: number }[];
  authorizedProviders?: AuthorizedEmergencyProvider[];
}

export interface WorldwideLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isGpsConfirmed: boolean;
  isLastKnownLocation: boolean;
  lastKnownTimestamp?: string;
  source: 'GPS_HARDWARE' | 'LAST_KNOWN_LOCATION' | 'MANUAL_SELECTION' | 'DEFAULT_PRESET';
}

export interface UserSettings {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  severityThreshold: AlertSeverity;
  autoRadarSweep?: boolean;
  autoResetDemoMinutes?: number;
  theme?: 'dark' | 'light';
  defaultLocation?: string;
  countryCode?: string;
  simulatedNetworkMode?: NetworkStatusIndicator;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export type SosStatus =
  | 'OFFLINE_QUEUED'
  | 'TRANSMITTING'
  | 'RECEIVED'
  | 'SERVER_RECEIVED'
  | 'ACKNOWLEDGED'
  | 'TEAM_ASSIGNED'
  | 'TEAM_EN_ROUTE'
  | 'RESOLVED'
  | 'FAILED_RETRYING'
  | 'PENDING'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'CANCELLED';

export type SosSituation =
  | 'Trapped'
  | 'Injured'
  | 'Building damaged'
  | 'Floodwater nearby'
  | 'Road blocked'
  | 'Need evacuation'
  | 'Other';

export type PeopleNeedingHelp = '1' | '2–5' | '6–10' | 'More than 10' | 'Unknown';

export type UserRole = 'CITIZEN' | 'RESCUE_OPERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  jurisdiction?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number; // millisecond timestamp
  sessionVersion: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorEmail: string;
  actorRole: UserRole;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'RATE_LIMITED' | 'ANONYMIZED';
  details: string;
}

export interface DataRetentionPolicy {
  autoAnonymizeResolvedHours: number;
  encryptLocationAtRest: boolean;
  maskExactCoordinatesForPublic: boolean;
  requireConsentForGps: boolean;
  activeEncryptedCount?: number;
  anonymizedCount?: number;
}

export interface EmergencyRequest {
  id: string;
  status: SosStatus;
  userId?: string;
  userEmail?: string;
  country?: string;
  region?: string;
  latitude: number | null;
  longitude: number | null;
  isGpsConfirmed: boolean;
  locationName: string;
  disasterType: DisasterType | 'Other';
  severity: AlertSeverity;
  situation: SosSituation;
  peopleCount: PeopleNeedingHelp;
  message: string;
  timestamp: string;
  isDemo: boolean;
  priority: RescuePriority;
  communicationMethod: CommunicationChannel;
  assignedTeam?: string;
  retryCount?: number;
  lastTransmissionAttempt?: string;
  channelLogs?: string[];
  aiPriorityReason?: string;
  riskAssessment?: AiEmergencyRiskAssessment;
  integritySignature?: string;
  isEncryptedAtRest?: boolean;
  isAnonymized?: boolean;
  retentionExpiry?: string;
}

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

export interface TestCaseResult {
  id: string;
  category: 'CORE' | 'DISASTER' | 'SOS' | 'COMMUNICATION' | 'SECURITY' | 'SURGE_PROTECTION' | 'AI_ENGINE';
  name: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  details: string;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRatePercent: number;
  evaluatorScore: number;
  criticalFailures: number;
  tests: TestCaseResult[];
  environment: {
    runtime: string;
    model: string;
    securityLevel: string;
    surgeProtection: string;
  };
}


