import { Alert, DisasterType, AlertSeverity } from '../types';
import { DEMO_PRESETS, ALL_CLEAR_ALERT, HISTORICAL_ALERTS } from '../data/mockDisasters';
import { OfflineStorageService } from './offlineStorage';

export class AlertService {
  static getInitialAlert(): Alert {
    const cached = OfflineStorageService.getCachedAlerts();
    return cached.length > 0 ? cached[0] : ALL_CLEAR_ALERT;
  }

  static getDisasterPresets(): Record<string, Alert> {
    return DEMO_PRESETS;
  }

  static getHistoricalAlerts(): Alert[] {
    return HISTORICAL_ALERTS;
  }

  static generateCustomAlert(params: {
    disasterType: DisasterType;
    severity: AlertSeverity;
    location: string;
    latitude: number;
    longitude: number;
  }): Alert {
    const base = DEMO_PRESETS[params.disasterType] || DEMO_PRESETS['Flood'];
    return {
      ...base,
      id: `alert-custom-${Date.now()}`,
      disasterType: params.disasterType,
      severity: params.severity,
      location: params.location,
      latitude: params.latitude,
      longitude: params.longitude,
      timestamp: 'Just now',
      isDemo: true,
    };
  }
}
