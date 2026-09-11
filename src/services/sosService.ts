import { EmergencyRequest, SosStatus, RescuePriority, DisasterType, SosSituation, PeopleNeedingHelp, CommunicationChannel } from '../types';
import { LocationService } from './locationService';
import { globalMultiChannelManager, SosTransmissionPayload } from './communicationService';
import { OfflineStorageService } from './offlineStorage';
import { authService } from './authService';
import { offlineSecurityService } from './offlineSecurity';

export class SosService {
  /**
   * Generates a cryptographically secure unique SOS request ID
   */
  static generateSosId(): string {
    try {
      const array = new Uint8Array(3);
      window.crypto.getRandomValues(array);
      const hex = Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      return `SOS-${hex}`;
    } catch {
      const random = Math.floor(1000 + Math.random() * 9000);
      return `SOS-${random}`;
    }
  }

  /**
   * Calculates initial algorithmic priority based on situation and severity
   */
  static evaluatePriority(situation: SosSituation, disasterType: string, peopleCount: PeopleNeedingHelp): RescuePriority {
    if (situation === 'Trapped' || situation === 'Injured' || peopleCount === 'More than 10') {
      return 'CRITICAL';
    }
    if (situation === 'Floodwater nearby' || situation === 'Building damaged' || peopleCount === '6–10' || peopleCount === '2–5') {
      return 'HIGH';
    }
    if (situation === 'Road blocked') {
      return 'MEDIUM';
    }
    return 'HIGH';
  }

  /**
   * Dispatches an Emergency SOS using the multi-channel fallback engine.
   */
  static async submitSos(params: {
    disasterType: DisasterType | 'Other';
    situation: SosSituation;
    peopleCount: PeopleNeedingHelp;
    message: string;
    locationName: string;
    latitude?: number | null;
    longitude?: number | null;
    isGpsConfirmed?: boolean;
    isDemo?: boolean;
  }): Promise<{
    request: EmergencyRequest;
    channelUsed: CommunicationChannel;
    transmissionDetails: string;
    isOfflineQueued: boolean;
  }> {
    const id = this.generateSosId();
    const priority = this.evaluatePriority(params.situation, params.disasterType, params.peopleCount);
    const currentUser = authService.getUser();

    // If coordinates were not passed, retrieve them (or fallback to cached)
    let lat = params.latitude ?? null;
    let lng = params.longitude ?? null;
    let gpsConfirmed = params.isGpsConfirmed ?? false;

    if (lat === null || lng === null) {
      const loc = await LocationService.requestEmergencyLocation();
      lat = loc.latitude;
      lng = loc.longitude;
      gpsConfirmed = loc.isConfirmed;
    }

    const payload: SosTransmissionPayload = {
      id,
      locationName: params.locationName,
      latitude: lat,
      longitude: lng,
      isGpsConfirmed: gpsConfirmed,
      disasterType: params.disasterType,
      severity: 'CRITICAL',
      situation: params.situation,
      peopleCount: params.peopleCount,
      message: params.message || 'Immediate rescue requested via RED ALERT AI distress beacon.',
      priority,
      isDemo: params.isDemo ?? true,
    };

    // Multi-channel dispatch
    const { result, channelUsed, fallbackHops } = await globalMultiChannelManager.transmitSos(payload);

    const isOfflineQueued = channelUsed === 'OFFLINE_QUEUE' || result.status === 'QUEUED_LOCALLY';
    const status: SosStatus = isOfflineQueued ? 'OFFLINE_QUEUED' : 'SERVER_RECEIVED';

    const logs: string[] = fallbackHops.map((h) =>
      h.attempted
        ? `Attempted channel [${h.channel}]: ${h.reason ? `Failed (${h.reason})` : 'Success'}`
        : `Skipped channel [${h.channel}]: ${h.reason || 'Unavailable'}`
    );
    logs.push(`Final Channel: ${channelUsed} — Status: ${status}`);

    const locInfo = LocationService.getWorldwideLocation();
    const emergencyRequest: EmergencyRequest = {
      id,
      status,
      userId: currentUser?.id || 'ANONYMOUS_CITIZEN',
      userEmail: currentUser?.email,
      country: locInfo.country,
      region: locInfo.region,
      latitude: lat,
      longitude: lng,
      isGpsConfirmed: gpsConfirmed,
      locationName: params.locationName || `${locInfo.city}, ${locInfo.region}`,
      disasterType: params.disasterType,
      severity: 'CRITICAL',
      situation: params.situation,
      peopleCount: params.peopleCount,
      message: params.message,
      timestamp: 'Just now',
      isDemo: params.isDemo ?? true,
      priority,
      communicationMethod: channelUsed,
      channelLogs: logs,
      isEncryptedAtRest: true,
    };

    if (isOfflineQueued) {
      OfflineStorageService.queueSosRequest(emergencyRequest, result.details);
      // Also store in AES-GCM encrypted secure storage
      offlineSecurityService.storeOfflineBeacon(emergencyRequest);
    } else {
      // If transmission was successful, purge any previous offline copies of this beacon
      offlineSecurityService.purgeTransmittedBeacon(id);
    }

    return {
      request: emergencyRequest,
      channelUsed,
      transmissionDetails: result.details,
      isOfflineQueued,
    };
  }

  /**
   * Retries transmission for all queued requests in the offline outbox
   */
  static async retryQueuedRequests(): Promise<{ sentCount: number; remainingCount: number }> {
    const queuedItems = OfflineStorageService.getQueuedSosRequests();
    if (queuedItems.length === 0) {
      return { sentCount: 0, remainingCount: 0 };
    }

    let sentCount = 0;
    for (const item of queuedItems) {
      const payload: SosTransmissionPayload = {
        id: item.request.id,
        locationName: item.request.locationName,
        latitude: item.request.latitude,
        longitude: item.request.longitude,
        isGpsConfirmed: item.request.isGpsConfirmed,
        disasterType: item.request.disasterType,
        severity: item.request.severity,
        situation: item.request.situation,
        peopleCount: item.request.peopleCount,
        message: item.request.message,
        priority: item.request.priority,
        isDemo: item.request.isDemo,
      };

      try {
        const { result, channelUsed } = await globalMultiChannelManager.transmitSos(payload);
        if (channelUsed !== 'OFFLINE_QUEUE' && result.success) {
          OfflineStorageService.removeQueuedSos(item.id);
          // Automatically remove successfully transmitted SOS data from secure offline storage
          offlineSecurityService.purgeTransmittedBeacon(item.id);
          sentCount++;
        }
      } catch (err) {
        console.warn(`Retry for #${item.id} failed:`, err);
      }
    }

    return {
      sentCount,
      remainingCount: OfflineStorageService.getQueuedSosRequests().length,
    };
  }
}
