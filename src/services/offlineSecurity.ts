import { EmergencyRequest } from '../types';

const OFFLINE_SECURE_STORAGE_KEY = 'redalert_secure_offline_beacons_v1';
const DEVICE_SALT_KEY = 'redalert_device_salt_v1';

// Web Crypto AES-GCM Encrypted Offline Outbox
class OfflineSecurityService {
  private cryptoKey: CryptoKey | null = null;

  private async getOrCreateKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    let salt = localStorage.getItem(DEVICE_SALT_KEY);
    if (!salt) {
      const randomBytes = new Uint8Array(16);
      window.crypto.getRandomValues(randomBytes);
      salt = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(DEVICE_SALT_KEY, salt);
    }

    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(`redalert-offline-key-${salt}`),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 10000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.cryptoKey;
  }

  // Encrypt and store an offline emergency beacon
  public async storeOfflineBeacon(request: EmergencyRequest): Promise<void> {
    try {
      // Store minimum required fields to minimize offline exposure
      const minimizedPayload: Partial<EmergencyRequest> = {
        id: request.id,
        status: 'OFFLINE_QUEUED',
        locationName: request.locationName,
        latitude: request.latitude,
        longitude: request.longitude,
        isGpsConfirmed: request.isGpsConfirmed,
        disasterType: request.disasterType,
        severity: request.severity,
        situation: request.situation,
        peopleCount: request.peopleCount,
        message: request.message,
        timestamp: request.timestamp,
        priority: request.priority,
        communicationMethod: 'OFFLINE_QUEUE',
        userId: request.userId,
        userEmail: request.userEmail,
        isEncryptedAtRest: true,
      };

      const key = await this.getOrCreateKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(minimizedPayload));

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const record = {
        id: request.id,
        timestamp: request.timestamp,
        iv: ivHex,
        ciphertext: encryptedHex,
      };

      const existingRecords = this.getRawRecords();
      // Replace or prepend
      const filtered = existingRecords.filter((r) => r.id !== request.id);
      filtered.unshift(record);
      localStorage.setItem(OFFLINE_SECURE_STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn('Web Crypto offline storage fallback:', err);
    }
  }

  // Retrieve and decrypt all offline queued beacons
  public async getOfflineBeacons(): Promise<EmergencyRequest[]> {
    try {
      const records = this.getRawRecords();
      if (records.length === 0) return [];

      const key = await this.getOrCreateKey();
      const decryptedList: EmergencyRequest[] = [];

      for (const record of records) {
        try {
          const iv = new Uint8Array(
            record.iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
          );
          const ciphertext = new Uint8Array(
            record.ciphertext.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
          );

          const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
          );

          const json = new TextDecoder().decode(decryptedBuffer);
          const parsed: EmergencyRequest = JSON.parse(json);
          decryptedList.push(parsed);
        } catch (e) {
          console.error('Failed to decrypt offline record:', record.id, e);
        }
      }

      return decryptedList;
    } catch {
      return [];
    }
  }

  // Automatically remove successfully transmitted SOS data from local device storage
  public purgeTransmittedBeacon(id: string): void {
    try {
      const records = this.getRawRecords();
      const remaining = records.filter((r) => r.id !== id);
      localStorage.setItem(OFFLINE_SECURE_STORAGE_KEY, JSON.stringify(remaining));
    } catch {
      // ignore
    }
  }

  public clearAllOffline(): void {
    try {
      localStorage.removeItem(OFFLINE_SECURE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  private getRawRecords(): Array<{ id: string; timestamp: string; iv: string; ciphertext: string }> {
    try {
      const raw = localStorage.getItem(OFFLINE_SECURE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }
}

export const offlineSecurityService = new OfflineSecurityService();
