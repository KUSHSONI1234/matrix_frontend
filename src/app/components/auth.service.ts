import { HttpClient, HttpHeaders } from '@angular/common/http';
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
      CryptoJS.enc.Utf8.parse(this.aesKey), // Key in Utf8
      {
        mode: CryptoJS.mode.CBC,
        iv: CryptoJS.enc.Utf8.parse('0000000000000000'), // Initialization Vector (IV)
        padding: CryptoJS.pad.Pkcs7, // Padding scheme
      }
    );
    return encrypted.toString(); // Return encrypted text as string
  }

  // Get accessible pages based on the username (Updated API URL)
  getAccessiblePages(username: string): Observable<string[]> {
    const apiUrl = 'http://192.168.28.44:5038/api/pageRights/access-pages';
    return this.http.get<string[]>(`${apiUrl}?username=${username}`);
  }

  // Fetch form data (Updated to handle API requests)
  getFormData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      withCredentials: false, // No credentials sent with the request
    });
  }

  // Register a new user with encrypted password
  register(user: any): Observable<string> {
    const encryptedPassword = this.encryptAES(user.password); // Encrypt password
    return this.http.post<string>(
      `${this.apiUrl}/register`,
      {
        username: user.username,
        password: encryptedPassword, // Send encrypted password
      },
      {
        responseType: 'text' as 'json', // Response type as text (JSON)
        withCredentials: false, // No credentials for the request
      }
    );
  }

  // Login user with encrypted password
  login(user: any): Observable<any> {
    const encryptedPassword = this.encryptAES(user.password); // Encrypt password
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        username: user.username,
        password: encryptedPassword, // Send encrypted password
      },
      {
        withCredentials: false, // No credentials sent with the request
      }
    );
  }

  // Get stored token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove token from localStorage (Logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey); // Remove token
  }

  getPageRights(username: string): Observable<any[]> {
    const apiUrl = 'http://192.168.28.44:5038/api/pageRights/' + username;
    return this.http.get<any[]>(apiUrl);
  }

  setRights(page: string, permissions: any) {
    this.rights[page] = permissions;
  }

  getRights(page: string): any {
    return this.rights[page] || {};
  }
  
}
