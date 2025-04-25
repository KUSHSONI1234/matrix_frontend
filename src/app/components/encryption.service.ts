import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  // You should keep this key/IV secret and ideally NOT hardcoded in frontend
  private readonly AES_KEY = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012'); // 32 chars = 256-bit
  private readonly IV = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 chars = 128-bit

  encryptPassword(password: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(password),
      this.AES_KEY,
      {
        iv: this.IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString(); // base64 format
  }

  decryptPassword(encrypted: string): string {
    const decrypted = CryptoJS.AES.decrypt(encrypted, this.AES_KEY, {
      iv: this.IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted);
  }
}
