import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://192.168.28.44:5000/api/Auth'; // API URL for authentication
  private aesKey = '1234567890123456'; // AES key for encryption
  private tokenKey = 'token'; // Key for storing the token in localStorage
  private rights: any = {};

  constructor(private http: HttpClient) {}

  // AES encryption method for passwords
  private encryptAES(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      text,
      CryptoJS.enc.Utf8.parse(this.aesKey),
      {
        mode: CryptoJS.mode.CBC,
        iv: CryptoJS.enc.Utf8.parse('0000000000000000'),
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  }

  // Get accessible pages based on the username
  getAccessiblePages(username: string): Observable<string[]> {
    const apiUrl = 'http://192.168.28.44:5038/api/pageRights/access-pages';
    return this.http.get<string[]>(`${apiUrl}?username=${username}`);
  }

  // Fetch form data
  getFormData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      withCredentials: false,
    });
  }

  // Register user with encrypted password
  register(user: any): Observable<string> {
    const encryptedPassword = this.encryptAES(user.password);
    return this.http.post<string>(
      `${this.apiUrl}/register`,
      {
        username: user.username,
        password: encryptedPassword,
      },
      {
        responseType: 'text' as 'json',
        withCredentials: false,
      }
    );
  }

  // Login user with encrypted password
  login(user: any): Observable<any> {
    const encryptedPassword = this.encryptAES(user.password);
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        username: user.username,
        password: encryptedPassword,
      },
      {
        withCredentials: false,
      }
    );
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove token from localStorage
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Get user rights for pages
  getPageRights(username: string): Observable<any[]> {
    const apiUrl = 'http://192.168.28.44:5038/api/pageRights/' + username;
    return this.http.get<any[]>(apiUrl);
  }

  // Store rights locally for session use
  setRights(page: string, permissions: any) {
    this.rights[page] = permissions;
  }

  getRights(page: string): any {
    return this.rights[page] || {};
  }
}
