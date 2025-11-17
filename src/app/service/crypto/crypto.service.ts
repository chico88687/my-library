import { Injectable } from '@angular/core';

/**
 * CryptoService provides AES-GCM encryption/decryption using the Web Crypto API.
 * - Uses a persistent symmetric key stored (base64) in localStorage.
 * - Uses a random 12-byte IV per encryption.
 * - Returns/accepts base64 strings that contain IV || ciphertext.
 */
@Injectable({ providedIn: 'root' })
export class CryptoService {
  private static readonly KEY_STORAGE = 'mlib_k';
  private static readonly IV_LENGTH = 12; // 96-bit nonce as recommended for AES-GCM

  private cachedKey: Promise<CryptoKey> | null = null;

  async encrypt(text: string): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(CryptoService.IV_LENGTH));

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));

    // Concatenate IV + ciphertext
    const combined = new Uint8Array(iv.length + encrypted.length);
    combined.set(iv, 0);
    combined.set(encrypted, iv.length);

    return CryptoService.bytesToBase64(combined);
  }

  async decrypt(payload: string): Promise<string> {
    const bytes = CryptoService.base64ToBytes(payload);
    if (bytes.length <= CryptoService.IV_LENGTH) {
      throw new Error('Invalid encrypted payload');
    }

    const iv = bytes.slice(0, CryptoService.IV_LENGTH);
    const ciphertext = bytes.slice(CryptoService.IV_LENGTH);

    const key = await this.getKey();

    const decrypted = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private async getKey(): Promise<CryptoKey> {
    if (this.cachedKey) return this.cachedKey;
    this.cachedKey = (async () => {
      let rawKeyB64 = localStorage.getItem(CryptoService.KEY_STORAGE);
      if (!rawKeyB64) {
        const raw = new Uint8Array(32); // 256-bit key
        crypto.getRandomValues(raw);
        rawKeyB64 = CryptoService.bytesToBase64(raw);
        localStorage.setItem(CryptoService.KEY_STORAGE, rawKeyB64);
      }
      const rawKey = CryptoService.base64ToBytes(rawKeyB64);
      return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    })();
    return this.cachedKey;
  }

  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
