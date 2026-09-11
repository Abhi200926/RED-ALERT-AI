import { CountryEmergencyConfig, WorldwideLocation, AuthorizedEmergencyProvider } from '../types';

export const WORLDWIDE_COUNTRIES: CountryEmergencyConfig[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    universalEmergency: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    disasterAgency: 'FEMA / National Weather Service (NWS)',
    defaultTimezone: 'America/New_York (UTC-5)',
    cities: [
      { name: 'San Francisco', region: 'California', lat: 37.7749, lng: -122.4194 },
      { name: 'Miami', region: 'Florida', lat: 25.7617, lng: -80.1918 },
      { name: 'New Orleans', region: 'Louisiana', lat: 29.9511, lng: -90.0715 },
      { name: 'Seattle', region: 'Washington', lat: 47.6062, lng: -122.3321 },
      { name: 'Houston', region: 'Texas', lat: 29.7604, lng: -95.3698 },
    ],
    authorizedProviders: [
      {
        id: 'US-FEMA-01',
        name: 'FEMA National Response Coordination Center (NRCC)',
        category: 'Civil Defense',
        contactNumber: '1-800-621-3362',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'United States Federal',
      },
      {
        id: 'US-USCG-01',
        name: 'U.S. Coast Guard Search & Rescue',
        category: 'Coast Guard',
        contactNumber: '911 / VHF Channel 16',
        dispatchProtocol: 'RADIO-GATEWAY',
        jurisdiction: 'Coastal & Navigable Waterways',
      },
      {
        id: 'US-CALFIRE-01',
        name: 'CAL FIRE / OES Command',
        category: 'Fire & Rescue',
        contactNumber: '911',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'State of California',
      },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    universalEmergency: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    disasterAgency: 'Public Safety Canada / Canadian Red Cross',
    defaultTimezone: 'America/Toronto (UTC-5)',
    cities: [
      { name: 'Vancouver', region: 'British Columbia', lat: 49.2827, lng: -123.1207 },
      { name: 'Calgary', region: 'Alberta', lat: 51.0447, lng: -114.0719 },
      { name: 'Toronto', region: 'Ontario', lat: 43.6532, lng: -79.3832 },
      { name: 'Montreal', region: 'Quebec', lat: 45.5017, lng: -73.5673 },
    ],
    authorizedProviders: [
      {
        id: 'CA-GOC-01',
        name: 'Government Operations Centre (GOC)',
        category: 'Civil Defense',
        contactNumber: '1-613-991-7000',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'Canada Federal',
      },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    universalEmergency: '999',
    police: '999',
    ambulance: '999',
    fire: '999',
    disasterAgency: 'Environment Agency / Met Office',
    defaultTimezone: 'Europe/London (UTC+0)',
    cities: [
      { name: 'London', region: 'Greater London', lat: 51.5074, lng: -0.1278 },
      { name: 'Manchester', region: 'Greater Manchester', lat: 53.4808, lng: -2.2426 },
      { name: 'Edinburgh', region: 'Scotland', lat: 55.9533, lng: -3.1883 },
      { name: 'Cardiff', region: 'Wales', lat: 51.4816, lng: -3.1791 },
    ],
    authorizedProviders: [
      {
        id: 'GB-EA-01',
        name: 'Environment Agency Floodline',
        category: 'Civil Defense',
        contactNumber: '0345 988 1188',
        dispatchProtocol: 'TELEPHONE',
        jurisdiction: 'England & Wales Flood Defense',
      },
      {
        id: 'GB-HM-CG-01',
        name: 'HM Coastguard Maritime Rescue',
        category: 'Coast Guard',
        contactNumber: '999',
        dispatchProtocol: 'RADIO-GATEWAY',
        jurisdiction: 'UK Coastal & Maritime',
      },
    ],
  },
  {
    code: 'EU',
    name: 'European Union (Germany/France)',
    flag: '🇪🇺',
    universalEmergency: '112',
    police: '112',
    ambulance: '112',
    fire: '112',
    disasterAgency: 'Emergency Response Coordination Centre (ERCC)',
    defaultTimezone: 'Europe/Brussels (UTC+1)',
    cities: [
      { name: 'Berlin', region: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
      { name: 'Paris', region: 'Île-de-France, France', lat: 48.8566, lng: 2.3522 },
      { name: 'Rome', region: 'Lazio, Italy', lat: 41.9028, lng: 12.4964 },
      { name: 'Madrid', region: 'Madrid, Spain', lat: 40.4168, lng: -3.7038 },
      { name: 'Athens', region: 'Attica, Greece', lat: 37.9838, lng: 23.7275 },
    ],
    authorizedProviders: [
      {
        id: 'EU-ERCC-01',
        name: 'EU Civil Protection Mechanism (ERCC)',
        category: 'Civil Defense',
        contactNumber: '112',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'European Union Member States',
      },
    ],
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    universalEmergency: '112',
    police: '100 / 112',
    ambulance: '108 / 112',
    fire: '101 / 112',
    disasterAgency: 'NDRF / National Disaster Management Authority (NDMA)',
    defaultTimezone: 'Asia/Kolkata (IST, UTC+5:30)',
    cities: [
      { name: 'Mumbai', region: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
      { name: 'Chennai', region: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
      { name: 'Kolkata', region: 'West Bengal', lat: 22.5726, lng: 88.3639 },
      { name: 'Delhi NCR', region: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Kochi', region: 'Kerala', lat: 9.9312, lng: 76.2673 },
    ],
    authorizedProviders: [
      {
        id: 'IN-NDRF-01',
        name: 'National Disaster Response Force (NDRF HQ Control Room)',
        category: 'Civil Defense',
        contactNumber: '011-24363260',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'India National Disaster Grid',
      },
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    universalEmergency: '119 / 110',
    police: '110',
    ambulance: '119',
    fire: '119',
    disasterAgency: 'Japan Meteorological Agency (JMA) / FDMA',
    defaultTimezone: 'Asia/Tokyo (JST, UTC+9)',
    cities: [
      { name: 'Tokyo', region: 'Kanto', lat: 35.6762, lng: 139.6503 },
      { name: 'Osaka', region: 'Kansai', lat: 34.6937, lng: 135.5023 },
      { name: 'Sendai', region: 'Tohoku', lat: 38.2682, lng: 140.8694 },
      { name: 'Fukuoka', region: 'Kyushu', lat: 33.5904, lng: 130.4017 },
    ],
    authorizedProviders: [
      {
        id: 'JP-FDMA-01',
        name: 'Fire and Disaster Management Agency (FDMA Control Center)',
        category: 'Fire & Rescue',
        contactNumber: '119',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'Japan Prefecture Rescue Command',
      },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    universalEmergency: '000',
    police: '000',
    ambulance: '000',
    fire: '000',
    disasterAgency: 'State Emergency Service (SES) / BOM',
    defaultTimezone: 'Australia/Sydney (AEST, UTC+10)',
    cities: [
      { name: 'Sydney', region: 'New South Wales', lat: -33.8688, lng: 151.2093 },
      { name: 'Brisbane', region: 'Queensland', lat: -27.4698, lng: 153.0251 },
      { name: 'Melbourne', region: 'Victoria', lat: -37.8136, lng: 144.9631 },
      { name: 'Cairns', region: 'Queensland', lat: -16.9186, lng: 145.7781 },
    ],
    authorizedProviders: [
      {
        id: 'AU-SES-01',
        name: 'NSW State Emergency Service (SES)',
        category: 'Civil Defense',
        contactNumber: '132 500',
        dispatchProtocol: 'TELEPHONE',
        jurisdiction: 'Flood & Storm Emergency Response',
      },
    ],
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    universalEmergency: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    disasterAgency: 'NDRRMC / PAGASA',
    defaultTimezone: 'Asia/Manila (PHT, UTC+8)',
    cities: [
      { name: 'Manila', region: 'National Capital Region', lat: 14.5995, lng: 120.9842 },
      { name: 'Cebu City', region: 'Central Visayas', lat: 10.3157, lng: 123.8854 },
      { name: 'Davao City', region: 'Davao Region', lat: 7.1907, lng: 125.4553 },
      { name: 'Tacloban', region: 'Eastern Visayas', lat: 11.2433, lng: 125.0047 },
    ],
    authorizedProviders: [
      {
        id: 'PH-NDRRMC-01',
        name: 'National Disaster Risk Reduction and Management Operations Center',
        category: 'Civil Defense',
        contactNumber: '(02) 8911-5061',
        dispatchProtocol: 'RADIO-GATEWAY',
        jurisdiction: 'Philippines National Civil Defense',
      },
    ],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    universalEmergency: '111',
    police: '111',
    ambulance: '111',
    fire: '111',
    disasterAgency: 'National Emergency Management Agency (NEMA) / GeoNet',
    defaultTimezone: 'Pacific/Auckland (NZST, UTC+12)',
    cities: [
      { name: 'Auckland', region: 'North Island', lat: -36.8485, lng: 174.7633 },
      { name: 'Wellington', region: 'North Island', lat: -41.2865, lng: 174.7762 },
      { name: 'Christchurch', region: 'South Island', lat: -43.5321, lng: 172.6362 },
    ],
    authorizedProviders: [
      {
        id: 'NZ-NEMA-01',
        name: 'National Crisis Management Centre (NCMC)',
        category: 'Civil Defense',
        contactNumber: '111',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'New Zealand Civil Defense',
      },
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    universalEmergency: '190 / 193',
    police: '190',
    ambulance: '192',
    fire: '193',
    disasterAgency: 'Defesa Civil Nacional (SEDEC) / CEMADEN',
    defaultTimezone: 'America/Sao_Paulo (BRT, UTC-3)',
    cities: [
      { name: 'Rio de Janeiro', region: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
      { name: 'São Paulo', region: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { name: 'Porto Alegre', region: 'Rio Grande do Sul', lat: -30.0346, lng: -51.2177 },
      { name: 'Recife', region: 'Pernambuco', lat: -8.0476, lng: -34.8770 },
    ],
    authorizedProviders: [
      {
        id: 'BR-DEFESA-01',
        name: 'Centro Nacional de Gerenciamento de Riscos e Desastres (CENAD)',
        category: 'Civil Defense',
        contactNumber: '199',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'Brazil National Civil Defense',
      },
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    universalEmergency: '112',
    police: '10111',
    ambulance: '10177',
    fire: '112',
    disasterAgency: 'National Disaster Management Centre (NDMC)',
    defaultTimezone: 'Africa/Johannesburg (SAST, UTC+2)',
    cities: [
      { name: 'Cape Town', region: 'Western Cape', lat: -33.9249, lng: 18.4241 },
      { name: 'Durban', region: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
      { name: 'Johannesburg', region: 'Gauteng', lat: -26.2041, lng: 28.0473 },
    ],
    authorizedProviders: [
      {
        id: 'ZA-NDMC-01',
        name: 'National Disaster Management Centre (NDMC)',
        category: 'Civil Defense',
        contactNumber: '112',
        dispatchProtocol: 'CAD-API',
        jurisdiction: 'South Africa National Grid',
      },
    ],
  },
];

const LAST_KNOWN_LOCATION_KEY = 'redalert_last_known_worldwide_location_v2';
const CUSTOM_PROVIDERS_KEY = 'redalert_custom_emergency_providers_v1';

export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isConfirmed: boolean;
  source: 'GPS_HARDWARE' | 'CACHED_LAST_KNOWN' | 'PRESET_FALLBACK';
  timestamp: string;
  isLastKnownLocation: boolean;
  displayMessage?: string;
}

export class LocationService {
  /**
   * Request GPS coordinates strictly with user permission.
   * If GPS is unavailable, clearly indicates: "Using last known location."
   * Never pretends that an outdated location is the user's current location.
   */
  static async requestEmergencyLocation(): Promise<GpsLocationResult> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const last = this.getLastKnownLocation();
      return {
        ...last,
        isConfirmed: false,
        isLastKnownLocation: true,
        displayMessage: 'Using last known location.',
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res: GpsLocationResult = {
            latitude: lat,
            longitude: lng,
            accuracyMeters: Math.round(position.coords.accuracy),
            isConfirmed: true,
            isLastKnownLocation: false,
            source: 'GPS_HARDWARE',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            displayMessage: 'Live GPS Acquired',
          };
          this.saveLastKnownLocation(lat, lng, true);
          resolve(res);
        },
        (error) => {
          console.warn('Geolocation unavailable/denied, displaying last known location notice:', error);
          const cached = this.getLastKnownLocation();
          resolve({
            ...cached,
            isConfirmed: false,
            isLastKnownLocation: true,
            displayMessage: 'Using last known location.',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000,
        }
      );
    });
  }

  static saveLastKnownLocation(lat: number, lng: number, wasGpsLive = false) {
    try {
      if (typeof window !== 'undefined') {
        const country = this.getDefaultCountry();
        const nearestCity = country.cities[0] || { name: 'Current Sector', region: 'Region' };

        const payload: WorldwideLocation = {
          country: country.name,
          countryCode: country.code,
          region: nearestCity.region,
          city: nearestCity.name,
          latitude: lat,
          longitude: lng,
          timezone: country.defaultTimezone,
          isGpsConfirmed: wasGpsLive,
          isLastKnownLocation: !wasGpsLive,
          lastKnownTimestamp: new Date().toLocaleString(),
          source: wasGpsLive ? 'GPS_HARDWARE' : 'LAST_KNOWN_LOCATION',
        };
        localStorage.setItem(LAST_KNOWN_LOCATION_KEY, JSON.stringify(payload));
      }
    } catch {
      // ignore
    }
  }

  static getLastKnownLocation(): GpsLocationResult {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LAST_KNOWN_LOCATION_KEY) : null;
      if (raw) {
        const parsed: WorldwideLocation = JSON.parse(raw);
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          accuracyMeters: 50,
          isConfirmed: false,
          isLastKnownLocation: true,
          source: 'CACHED_LAST_KNOWN',
          timestamp: parsed.lastKnownTimestamp || 'Previously Cached Position',
          displayMessage: 'Using last known location.',
        };
      }
    } catch {
      // fallback
    }

    // Default fallback baseline
    const country = this.getDefaultCountry();
    const city = country.cities[0] || { name: 'Capital District', region: 'Region', lat: 37.7749, lng: -122.4194 };
    return {
      latitude: city.lat,
      longitude: city.lng,
      accuracyMeters: 100,
      isConfirmed: false,
      isLastKnownLocation: true,
      source: 'PRESET_FALLBACK',
      timestamp: 'Fallback Baseline Sector',
      displayMessage: 'Using last known location.',
    };
  }

  static getWorldwideLocation(): WorldwideLocation {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LAST_KNOWN_LOCATION_KEY) : null;
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }

    const country = this.getDefaultCountry();
    const city = country.cities[0] || { name: 'Metropolitan Area', region: 'Central', lat: 37.7749, lng: -122.4194 };
    return {
      country: country.name,
      countryCode: country.code,
      region: city.region,
      city: city.name,
      latitude: city.lat,
      longitude: city.lng,
      timezone: country.defaultTimezone,
      isGpsConfirmed: false,
      isLastKnownLocation: true,
      lastKnownTimestamp: new Date().toLocaleTimeString(),
      source: 'DEFAULT_PRESET',
    };
  }

  static getCountryConfig(code: string): CountryEmergencyConfig {
    const list = this.getAllCountries();
    return list.find((c) => c.code === code) || list[0];
  }

  static getAllCountries(): CountryEmergencyConfig[] {
    let customList: CountryEmergencyConfig[] = [...WORLDWIDE_COUNTRIES];
    try {
      if (typeof window !== 'undefined') {
        const rawCustom = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
        if (rawCustom) {
          const customProviders: { countryCode: string; provider: AuthorizedEmergencyProvider }[] = JSON.parse(rawCustom);
          customList = customList.map((c) => {
            const added = customProviders.filter((p) => p.countryCode === c.code).map((p) => p.provider);
            return {
              ...c,
              authorizedProviders: [...(c.authorizedProviders || []), ...added],
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return customList;
  }

  static addAuthorizedProvider(countryCode: string, provider: AuthorizedEmergencyProvider) {
    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
        const list: { countryCode: string; provider: AuthorizedEmergencyProvider }[] = existing ? JSON.parse(existing) : [];
        list.push({ countryCode, provider });
        localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to save authorized provider:', e);
    }
  }

  static getDefaultCountry(): CountryEmergencyConfig {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('redalert_selected_country_code_v1');
        if (saved) {
          const match = this.getAllCountries().find((c) => c.code === saved);
          if (match) return match;
        }
      }
    } catch {
      // ignore
    }
    return WORLDWIDE_COUNTRIES[0];
  }

  static setDefaultCountryCode(code: string) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redalert_selected_country_code_v1', code);
      }
    } catch {
      // ignore
    }
  }
}

