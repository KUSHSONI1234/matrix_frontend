import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://192.168.28.44:5000/api/Auth';
  private aesKey = '1234567890123456';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  private encryptAES(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      text,
      CryptoJS.enc.Utf8.parse(this.aesKey),
      {
        mode: CryptoJS.mode.CBC,
        iv: CryptoJS.enc.Utf8.parse('0000000000000000'),
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return encrypted.toString();
  }

  getFormData() {
    return this.http.get<any[]>(this.apiUrl, {
      withCredentials: false
    });
  }

  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, {
      username: user.username,
      password: this.encryptAES(user.password)
    }, {
      responseType: 'text' as 'json',
      withCredentials: false
    });
  }

  login(user: any) {
    return this.http.post(`${this.apiUrl}/login`, {
      username: user.username,
      password: this.encryptAES(user.password)
    }, {
      withCredentials: false
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
