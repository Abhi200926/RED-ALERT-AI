import { Alert, SafetyGuide, EmergencyRequest } from '../types';
import { SAFETY_GUIDES, ALL_CLEAR_ALERT, HISTORICAL_ALERTS } from '../data/mockDisasters';

const CACHE_ALERTS_KEY = 'redalert_cached_alerts_v1';
const CACHE_SAFETY_KEY = 'redalert_cached_safety_guides_v1';
const CACHE_OUTBOX_KEY = 'redalert_sos_outbox_v1';

export interface OutboxItem {
  id: string;
  request: EmergencyRequest;
  queuedAt: string;
  retryAttempts: number;
  lastAttemptAt?: string;
  lastError?: string;
}

export class OfflineStorageService {
  /**
   * Initializes offline cache with base safety guides & alerts so PWA is fully populated offline.
   */
  static initializeOfflineCache() {
    if (typeof window === 'undefined') return;

    try {
      if (!localStorage.getItem(CACHE_SAFETY_KEY)) {
        localStorage.setItem(CACHE_SAFETY_KEY, JSON.stringify(SAFETY_GUIDES));
      }
      if (!localStorage.getItem(CACHE_ALERTS_KEY)) {
        localStorage.setItem(CACHE_ALERTS_KEY, JSON.stringify([ALL_CLEAR_ALERT, ...HISTORICAL_ALERTS]));
      }
    } catch (e) {
      console.warn('Offline cache init error:', e);
    }
  }

  static getCachedSafetyGuides(): SafetyGuide[] {
    try {
      const raw = localStorage.getItem(CACHE_SAFETY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return Object.values(SAFETY_GUIDES);
  }

  static cacheAlerts(alerts: Alert[]) {
    try {
      localStorage.setItem(CACHE_ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to cache alerts:', e);
    }
  }

  static getCachedAlerts(): Alert[] {
    try {
      const raw = localStorage.getItem(CACHE_ALERTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [ALL_CLEAR_ALERT, ...HISTORICAL_ALERTS];
  }

  // Outbox Queue for Emergency SOS requests
  static queueSosRequest(request: EmergencyRequest, reason?: string) {
    try {
      const outbox = this.getQueuedSosRequests();
      const existingIdx = outbox.findIndex((item) => item.id === request.id);

      const outboxItem: OutboxItem = {
        id: request.id,
        request: {
          ...request,
          status: 'OFFLINE_QUEUED',
          communicationMethod: 'OFFLINE_QUEUE',
        },
        queuedAt: new Date().toISOString(),
        retryAttempts: existingIdx >= 0 ? outbox[existingIdx].retryAttempts : 0,
        lastError: reason || 'Network uplink unavailable',
      };

      if (existingIdx >= 0) {
        outbox[existingIdx] = outboxItem;
      } else {
        outbox.unshift(outboxItem);
      }

      localStorage.setItem(CACHE_OUTBOX_KEY, JSON.stringify(outbox));
      console.log(`[OFFLINE OUTBOX] Queued SOS request #${request.id} for auto-retry.`);
    } catch (e) {
      console.warn('Failed to queue SOS to outbox:', e);
    }
  }

  static getQueuedSosRequests(): OutboxItem[] {
    try {
      const raw = localStorage.getItem(CACHE_OUTBOX_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  static removeQueuedSos(id: string) {
    try {
      const outbox = this.getQueuedSosRequests().filter((item) => item.id !== id);
      localStorage.setItem(CACHE_OUTBOX_KEY, JSON.stringify(outbox));
    } catch (e) {
      console.warn('Failed to remove SOS from outbox:', e);
    }
  }

  static getStorageDiagnostics() {
    let totalBytes = 0;
    let itemCount = 0;
    if (typeof window !== 'undefined' && localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('redalert_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
          itemCount++;
        }
      }
    }
    return {
      totalBytes,
      itemCount,
      outboxCount: this.getQueuedSosRequests().length,
      cachedGuidesCount: this.getCachedSafetyGuides().length,
      cachedAlertsCount: this.getCachedAlerts().length,
      hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    };
  }
}
