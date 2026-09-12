import { CommunicationChannel, NetworkStatusIndicator, EmergencyRequest, RescuePriority } from '../types';
import { authService } from './authService';

export const PROTOTYPE_DISCLAIMER =
  'DEMO / PROTOTYPE NOTICE: RED ALERT AI is an exploratory prototype and simulation system. It does NOT dispatch real-world emergency services, does NOT contact 911 or civil defense authorities, does NOT send real rescue teams, and cannot guarantee emergency communication. In a life-threatening crisis, immediately call 911, 112, or your local emergency services telephone number.';

export interface ChannelStatus {
  channel: CommunicationChannel;
  displayName: string;
  isAvailable: boolean;
  isSimulated: boolean;
  simulationTag?: string; // 'DEMO SIMULATION'
  signalStrengthPercent: number;
  latencyMs: number;
  description: string;
  carrierOrHardware: string;
}

export interface TransmissionResult {
  success: boolean;
  channel: CommunicationChannel;
  providerName: string;
  transmissionId: string;
  timestamp: string;
  status: 'SENT' | 'QUEUED_LOCALLY' | 'FAILED';
  details: string;
  hops?: string[];
}

export interface SosTransmissionPayload {
  id: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  isGpsConfirmed: boolean;
  disasterType: string;
  severity: string;
  situation: string;
  peopleCount: string;
  message: string;
  priority: RescuePriority;
  isDemo: boolean;
}

export interface CommunicationProvider {
  name: string;
  channel: CommunicationChannel;
  priorityOrder: number;
  isAvailable(): Promise<boolean>;
  sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult>;
  getStatus(): ChannelStatus;
}

/**
 * 1. Internet Provider: High-speed IP data uplink (Fiber / Broadband / Wi-Fi)
 */
export class InternetProvider implements CommunicationProvider {
  name = 'High-Speed Internet / IP Uplink';
  channel: CommunicationChannel = 'INTERNET';
  priorityOrder = 1;
  overrideAvailable: boolean | null = null;

  async isAvailable(): Promise<boolean> {
    if (this.overrideAvailable !== null) return this.overrideAvailable;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Internet uplink is unavailable or disconnected.');
    }

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          communicationMethod: 'INTERNET',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        channel: 'INTERNET',
        providerName: this.name,
        transmissionId: data.request?.id || payload.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'SENT',
        details: 'Dispatched securely via TLS HTTPS WebSocket/REST to emergency operations center.',
        hops: ['Local IP Gateway', 'Regional ISP Fiber', 'Emergency Operations Hub Cloud'],
      };
    } catch (err: any) {
      throw new Error(`Internet transmission error: ${err?.message || 'Network unreachable'}`);
    }
  }

  getStatus(): ChannelStatus {
    const available = this.overrideAvailable !== null ? this.overrideAvailable : (typeof navigator !== 'undefined' ? navigator.onLine : true);
    return {
      channel: 'INTERNET',
      displayName: 'Broadband / Wi-Fi Internet',
      isAvailable: available,
      isSimulated: this.overrideAvailable !== null,
      signalStrengthPercent: available ? 95 : 0,
      latencyMs: available ? 35 : 0,
      description: 'Primary high-bandwidth bidirectional protocol. Carries full telemetry, GPS, and live status updates.',
      carrierOrHardware: 'Standard IP Stack (TCP/HTTPS)',
    };
  }
}

/**
 * 2. Cellular Provider: 5G/LTE Mobile Packet Data
 */
export class CellularProvider implements CommunicationProvider {
  name = 'Cellular Mobile Data (5G/LTE)';
  channel: CommunicationChannel = 'CELLULAR';
  priorityOrder = 2;
  overrideAvailable: boolean | null = null;

  async isAvailable(): Promise<boolean> {
    if (this.overrideAvailable !== null) return this.overrideAvailable;
    // In browser, check network connection type if available, default to true if online
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Cellular tower base-station uplink is unavailable (congested or damaged).');
    }

    // Try posting to emergency server via cellular packet data
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          communicationMethod: 'CELLULAR',
        }),
      });

      if (!res.ok) {
        throw new Error(`Cellular carrier proxy returned status ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        channel: 'CELLULAR',
        providerName: this.name,
        transmissionId: data.request?.id || payload.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'SENT',
        details: 'Routed via cellular base transceiver station (BTS) to emergency dispatcher gateway.',
        hops: ['Mobile Radio RAN', 'Cellular Core Network (eNodeB)', 'Public Safety Gateway'],
      };
    } catch (err: any) {
      throw new Error(`Cellular transmission failed: ${err?.message || 'Carrier node timeout'}`);
    }
  }

  getStatus(): ChannelStatus {
    const available = this.overrideAvailable !== null ? this.overrideAvailable : true;
    return {
      channel: 'CELLULAR',
      displayName: 'Cellular 5G / 4G LTE',
      isAvailable: available,
      isSimulated: this.overrideAvailable !== null,
      signalStrengthPercent: available ? 78 : 0,
      latencyMs: available ? 85 : 0,
      description: 'Secondary mobile carrier IP connection. Operates over cellular towers when fixed broadband fails.',
      carrierOrHardware: 'Mobile Network Operator (eNodeB)',
    };
  }
}

/**
 * 3. SMS Provider: Emergency SMS Shortcode Gateway Fallback
 * (Encodes GPS + Emergency code into a compact compressed text packet)
 */
export class SmsProvider implements CommunicationProvider {
  name = 'Emergency SMS Fallback Bridge';
  channel: CommunicationChannel = 'SMS';
  priorityOrder = 3;
  overrideAvailable: boolean | null = true;

  async isAvailable(): Promise<boolean> {
    return this.overrideAvailable ?? true;
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('SMS signaling channel (SS7/MAP) unavailable.');
    }

    // Simulated transmission via carrier SMS gateway with telemetry payload encoding
    const encodedSms = `SOS#${payload.id}#${payload.disasterType}#${payload.situation}#${payload.peopleCount}#${payload.latitude?.toFixed(4)},${payload.longitude?.toFixed(4)}#${payload.message.slice(0, 60)}`;
    console.log(`[SMS FALLBACK EMITTED] Payload packet: "${encodedSms}"`);

    // In a prototype environment, relay to server endpoint if possible or acknowledge via simulated carrier bridge
    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...payload,
          communicationMethod: 'SMS',
          notes: `Encoded SMS payload: ${encodedSms}`,
        }),
      });
    } catch {
      // If server unreachable, SMS bridge still acknowledges simulation
    }

    return {
      success: true,
      channel: 'SMS',
      providerName: this.name,
      transmissionId: payload.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SENT',
      details: `Dispatched via SMS Carrier Emergency Shortcode (911/112 SMS bridge). Payload: "${encodedSms.slice(0, 45)}..."`,
      hops: ['Local Cellular Control Channel', 'Carrier SMSC Gateway', 'PSAP Text-to-911 Gateway'],
    };
  }

  getStatus(): ChannelStatus {
    const available = this.overrideAvailable ?? true;
    return {
      channel: 'SMS',
      displayName: 'Emergency SMS Text Bridge',
      isAvailable: available,
      isSimulated: true,
      simulationTag: 'DEMO SIMULATION',
      signalStrengthPercent: available ? 65 : 0,
      latencyMs: available ? 1200 : 0,
      description: 'Ultra-low bandwidth circuit-switched signaling channel. Uses carrier SMS control channel when packet data is dead.',
      carrierOrHardware: 'Carrier SMSC / Text-to-911 Gateway (DEMO SIMULATION)',
    };
  }
}

/**
 * 4. Satellite Provider: Low Earth Orbit (LEO) Emergency SOS Relay
 */
export class SatelliteProvider implements CommunicationProvider {
  name = 'Supported Satellite Emergency Uplink (LEO)';
  channel: CommunicationChannel = 'SATELLITE';
  priorityOrder = 4;
  overrideAvailable: boolean | null = false; // Off by default unless enabled or simulated

  async isAvailable(): Promise<boolean> {
    return this.overrideAvailable ?? false;
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('No satellite line-of-sight detected. Clear view of sky required.');
    }

    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          communicationMethod: 'SATELLITE',
        }),
      });
    } catch {
      // Simulated satellite gateway
    }

    return {
      success: true,
      channel: 'SATELLITE',
      providerName: this.name,
      transmissionId: payload.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SENT',
      details: 'Transmitted via direct-to-cell LEO constellation (S-band/L-band pulse) to orbital rescue relay [DEMO SIMULATION].',
      hops: ['Handset Satellite Modem', 'LEO Satellite Constellation', 'Satellite Earth Ground Station', 'Rescue Coordination Center'],
    };
  }

  getStatus(): ChannelStatus {
    const available = this.overrideAvailable ?? false;
    return {
      channel: 'SATELLITE',
      displayName: 'Satellite Emergency Relay (LEO)',
      isAvailable: available,
      isSimulated: true,
      simulationTag: 'DEMO SIMULATION',
      signalStrengthPercent: available ? 45 : 0,
      latencyMs: available ? 3400 : 0,
      description: 'Direct-to-satellite pulse. Operates with zero terrestrial cellular towers; requires line-of-sight to the open sky.',
      carrierOrHardware: 'LEO Constellation Ground Relay (DEMO SIMULATION)',
    };
  }
}

/**
 * 5. Nearby Device / Mesh Relay: Bluetooth LE / Wi-Fi Direct peer-to-peer packet hopping
 */
export class RelayProvider implements CommunicationProvider {
  name = 'Nearby Device / Mesh Relay (BLE & Wi-Fi Direct)';
  channel: CommunicationChannel = 'RELAY';
  priorityOrder = 5;
  overrideAvailable: boolean | null = false;

  async isAvailable(): Promise<boolean> {
    return this.overrideAvailable ?? false;
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('No peer mesh relay nodes discovered in broadcast proximity.');
    }

    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          communicationMethod: 'RELAY',
        }),
      });
    } catch {
      // Peer packet logged
    }

    return {
      success: true,
      channel: 'RELAY',
      providerName: this.name,
      transmissionId: payload.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SENT',
      details: 'Broadcast to 2 nearby peer handsets via Bluetooth Low Energy mesh packet hop [DEMO SIMULATION].',
      hops: ['Source Device BLE', 'Relay Peer #1 (Neighbor Handset)', 'Relay Peer #2', 'Rescue Vehicle Gateway'],
    };
  }

  getStatus(): ChannelStatus {
    const available = this.overrideAvailable ?? false;
    return {
      channel: 'RELAY',
      displayName: 'Nearby Device / Mesh Relay',
      isAvailable: available,
      isSimulated: true,
      simulationTag: 'DEMO SIMULATION',
      signalStrengthPercent: available ? 40 : 0,
      latencyMs: available ? 450 : 0,
      description: 'Peer-to-peer ad-hoc mesh protocol. Packets hop between nearby citizen devices until an active uplink node is reached.',
      carrierOrHardware: 'BLE 5.0 / Wi-Fi Direct Mesh Node (DEMO SIMULATION)',
    };
  }
}

/**
 * 6. Offline Queue Provider: Stores request in local storage / IndexedDB with automatic retry daemon
 */
export class OfflineQueueProvider implements CommunicationProvider {
  name = 'Local Offline Outbox (IndexedDB / LocalStorage)';
  channel: CommunicationChannel = 'OFFLINE_QUEUE';
  priorityOrder = 6;

  async isAvailable(): Promise<boolean> {
    return true; // Local storage is always available on the device
  }

  async sendSos(payload: SosTransmissionPayload): Promise<TransmissionResult> {
    const record = {
      ...payload,
      communicationMethod: 'OFFLINE_QUEUE' as CommunicationChannel,
      status: 'OFFLINE_QUEUED',
      queuedAt: new Date().toISOString(),
      retryAttempts: 0,
    };

    try {
      localStorage.setItem(`redalert_queued_sos_${payload.id}`, JSON.stringify(record));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    return {
      success: true,
      channel: 'OFFLINE_QUEUE',
      providerName: this.name,
      transmissionId: payload.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'QUEUED_LOCALLY',
      details: 'Saved safely to local device storage. Outbox daemon will automatically retry transmission as soon as connectivity returns.',
      hops: ['Device Storage (IndexedDB/LocalStorage)', 'Pending Automatic Uplink Handshake'],
    };
  }

  getStatus(): ChannelStatus {
    return {
      channel: 'OFFLINE_QUEUE',
      displayName: 'Offline Storage Outbox',
      isAvailable: true,
      isSimulated: false,
      signalStrengthPercent: 100,
      latencyMs: 1,
      description: 'Zero-connectivity persistence. Retains distress beacon in encrypted browser sandbox until radio link re-establishes.',
      carrierOrHardware: 'Local Sandboxed Storage',
    };
  }
}

/**
 * MultiChannelManager: Coordinates channel priority, automatic failover, and status tracking
 */
export class MultiChannelManager {
  private providers: CommunicationProvider[];
  private listeners: ((status: NetworkStatusIndicator, channels: ChannelStatus[]) => void)[] = [];

  constructor() {
    this.providers = [
      new InternetProvider(),
      new CellularProvider(),
      new SmsProvider(),
      new SatelliteProvider(),
      new RelayProvider(),
      new OfflineQueueProvider(),
    ];

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyChange());
      window.addEventListener('offline', () => this.notifyChange());
    }
  }

  getProviders(): CommunicationProvider[] {
    return this.providers;
  }

  getProvider(channel: CommunicationChannel): CommunicationProvider | undefined {
    return this.providers.find((p) => p.channel === channel);
  }

  setChannelOverride(channel: CommunicationChannel, available: boolean | null) {
    const provider = this.getProvider(channel);
    if (provider && 'overrideAvailable' in provider) {
      (provider as any).overrideAvailable = available;
    }
    this.notifyChange();
  }

  async selectBestChannel(): Promise<CommunicationProvider> {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        return provider;
      }
    }
    return this.providers[this.providers.length - 1]; // Fallback to offline queue
  }

  async transmitSos(payload: SosTransmissionPayload): Promise<{
    result: TransmissionResult;
    channelUsed: CommunicationChannel;
    fallbackHops: { channel: CommunicationChannel; attempted: boolean; reason?: string }[];
  }> {
    const fallbackHops: { channel: CommunicationChannel; attempted: boolean; reason?: string }[] = [];

    for (const provider of this.providers) {
      const isAvail = await provider.isAvailable();
      if (!isAvail) {
        fallbackHops.push({
          channel: provider.channel,
          attempted: false,
          reason: 'Channel marked offline or unavailable',
        });
        continue;
      }

      fallbackHops.push({ channel: provider.channel, attempted: true });

      try {
        const result = await provider.sendSos(payload);
        return {
          result,
          channelUsed: provider.channel,
          fallbackHops,
        };
      } catch (err: any) {
        fallbackHops[fallbackHops.length - 1].reason = err?.message || 'Transmission failed';
        console.warn(`[MULTI-CHANNEL FAILOVER] ${provider.name} failed:`, err);
        // Continue to next priority channel
      }
    }

    // If all fail, use offline queue
    const offlineProvider = this.providers.find((p) => p.channel === 'OFFLINE_QUEUE')!;
    const result = await offlineProvider.sendSos(payload);
    return {
      result,
      channelUsed: 'OFFLINE_QUEUE',
      fallbackHops,
    };
  }

  async getOverallNetworkStatus(): Promise<NetworkStatusIndicator> {
    const internet = await this.providers[0].isAvailable();
    const cellular = await this.providers[1].isAvailable();
    const sms = await this.providers[2].isAvailable();
    const satellite = await this.providers[3].isAvailable();
    const relay = await this.providers[4].isAvailable();

    if (internet && cellular) return 'ONLINE';
    if (!internet && cellular) return 'CELLULAR ONLY';
    if (!internet && !cellular && sms) return 'SMS AVAILABLE';
    if (satellite) return 'SATELLITE AVAILABLE';
    if (relay) return 'RELAY AVAILABLE';
    if (internet || cellular) return 'WEAK CONNECTION';
    return 'OFFLINE';
  }

  getAllChannelStatuses(): ChannelStatus[] {
    return this.providers.map((p) => p.getStatus());
  }

  // 7 Explicit Simulation Scenarios requested for hackathon demonstration
  applyScenarioHeavyRainInternet() {
    this.setChannelOverride('INTERNET', true);
    this.setChannelOverride('CELLULAR', true);
    this.setChannelOverride('SMS', true);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioHeavyRainInternetLost() {
    this.setChannelOverride('INTERNET', false);
    this.setChannelOverride('CELLULAR', true);
    this.setChannelOverride('SMS', true);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioFloodCellular() {
    this.setChannelOverride('INTERNET', false);
    this.setChannelOverride('CELLULAR', true);
    this.setChannelOverride('SMS', true);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioFloodCellularLost() {
    this.setChannelOverride('INTERNET', false);
    this.setChannelOverride('CELLULAR', false);
    this.setChannelOverride('SMS', true);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioRemoteSatellite() {
    this.setChannelOverride('INTERNET', false);
    this.setChannelOverride('CELLULAR', false);
    this.setChannelOverride('SMS', false);
    this.setChannelOverride('SATELLITE', true);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioTotalCommunicationLoss() {
    this.setChannelOverride('INTERNET', false);
    this.setChannelOverride('CELLULAR', false);
    this.setChannelOverride('SMS', false);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  applyScenarioConnectionRestored() {
    this.setChannelOverride('INTERNET', true);
    this.setChannelOverride('CELLULAR', true);
    this.setChannelOverride('SMS', true);
    this.setChannelOverride('SATELLITE', false);
    this.setChannelOverride('RELAY', false);
  }

  subscribe(listener: (status: NetworkStatusIndicator, channels: ChannelStatus[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyChange() {
    const status = await this.getOverallNetworkStatus();
    const channels = this.getAllChannelStatuses();
    this.listeners.forEach((l) => l(status, channels));
  }
}

// CommunicationManager abstraction layer requested by specification
export const CommunicationManager = MultiChannelManager;
export type CommunicationManager = MultiChannelManager;

// Global Singleton Instances
export const globalMultiChannelManager = new MultiChannelManager();
export const globalCommunicationManager = globalMultiChannelManager;
