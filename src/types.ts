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
  integritySignature?: string;
  isEncryptedAtRest?: boolean;
  isAnonymized?: boolean;
  retentionExpiry?: string;
}

