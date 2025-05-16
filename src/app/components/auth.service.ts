import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApiUrl = 'http://192.168.28.44:5000/api/Auth';
  private readonly pageApiUrl = 'http://192.168.28.44:5038/api/pageRights';
  private readonly aesKey = '1234567890123456';
  private readonly tokenKey = 'token';

  private rightsCache: Record<string, any> = {};

  constructor(private http: HttpClient) {}

  /** AES Encrypt Password */
  private encryptAES(password: string): string {
    return CryptoJS.AES.encrypt(
      password,
      CryptoJS.enc.Utf8.parse(this.aesKey),
      {
        mode: CryptoJS.mode.CBC,
        iv: CryptoJS.enc.Utf8.parse('0000000000000000'),
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();
  }

  /** Login with Encrypted Password */
  login(user: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.authApiUrl}/login`, {
      username: user.username,
      password: this.encryptAES(user.password),
    });
  }

  /** Register with Encrypted Password */
  register(user: { username: string; password: string }): Observable<string> {
    return this.http.post<string>(
      `${this.authApiUrl}/register`,
      {
        username: user.username,
        password: this.encryptAES(user.password),
      },
      {
        responseType: 'text' as 'json',
      }
    );
  }

  /** Fetch Accessible Pages */
  getAccessiblePages(username: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.pageApiUrl}/access-pages?username=${username}`
    );
  }

  /** Get All Auth Form Data */
  getFormData(): Observable<any[]> {
    return this.http.get<any[]>(this.authApiUrl);
  }

  /** Delete a User by Username */
  deleteUser(username: string): Observable<string> {
    return this.http.delete(`${this.authApiUrl}/${username}`, {
      responseType: 'text',
    });
  }

  /** Get Token from Local Storage */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Clear Token from Local Storage */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('username');
    localStorage.removeItem('allowedPages');
  }

  /** Fetch Page Rights for User */
  getPageRights(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.pageApiUrl}/${username}`);
  }

  /** Cache User Rights */
  setRights(page: string, permissions: any): void {
    this.rightsCache[page] = permissions;
  }

  getRights(page: string): any {
    return this.rightsCache[page] || {};
  }
}
