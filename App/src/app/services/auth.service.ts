import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated()); // Tracks authentication status

  authStatus$ = this.authStatusSubject.asObservable(); // Observable for components to subscribe

  constructor(private http: HttpClient) {}

  login(email: string, password: string, loginType: 'EMPLOYEE' | 'CLIENT'): Observable<{ token: string }> {
    const apiUrl = `${this.baseUrl}/login/${loginType}`;
    return new Observable(observer => {
      this.http.post<{ token: string }>(apiUrl, { email, password }).subscribe({
        next: (response) => {
          this.saveToken(response.token);
          this.authStatusSubject.next(true); // 🔹 Notify subscribers that the user is logged in
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  logout(): void {
    sessionStorage.removeItem('jwt');
    this.authStatusSubject.next(false);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('jwt');
  }

  saveToken(token: string): void {
    sessionStorage.setItem('jwt', token);
    this.authStatusSubject.next(true);

  }

  getToken(): string | null {
    return sessionStorage.getItem('jwt');
  }

  getUserPermissions(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || [];
    } catch (error) {
      console.error('Invalid JWT Token');
      return [];
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId || null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserPermissions().includes('ADMIN');
  }

  isEmployee(): boolean {
    return this.getUserPermissions().includes('EMPLOYEE');
  }

  isClient(): boolean {
    return this.getUserPermissions().includes('CLIENT');
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string | null, password: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/set-password`, { token, password });
  }
}
