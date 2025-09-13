import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Admin, LoginRequest, LoginResponse } from '../models/admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ADMIN_KEY = 'admin_data';
  private readonly LOGIN_TIME_KEY = 'login_time'; // 🔧 ADD: For last login tracking

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentAdminSubject = new BehaviorSubject<Admin | null>(this.getStoredAdmin());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentAdmin$ = this.currentAdminSubject.asObservable();

  // 🔑 HARDCODED ADMIN CREDENTIALS FOR TESTING
  private readonly fallbackAdmin: Admin = {
    id: 'admin-001',
    email: 'admin@onlybooks.com',
    name: 'System Administrator',
    role: 'admin',
    isActive: true,
    lastLogin: new Date()
  };
  private readonly fallbackPassword = 'admin123';

  // Account lockout tracking (US012 requirement: max 3 attempts)
  private loginAttempts = new Map<string, number>();
  private lockedUntil = new Map<string, number>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Check if account is locked
    if (this.isAccountLocked(credentials.email)) {
      const remainingTime = this.getRemainingLockTime(credentials.email);
      return throwError(() => new Error(`Account locked. Try again in ${remainingTime} minutes.`));
    }

    // 🔄 TRY HARDCODED ADMIN LOGIN FIRST (for development)
    if (credentials.email === this.fallbackAdmin.email) {
      if (credentials.password === this.fallbackPassword) {
        // ✅ Successful login - reset attempts
        this.resetLoginAttempts(credentials.email);
        
        // 🔧 UPDATE: Store login time and update lastLogin
        const loginTime = new Date();
        const updatedAdmin = {
          ...this.fallbackAdmin,
          lastLogin: loginTime
        };
        
        const mockResponse: LoginResponse = {
          token: 'fake-jwt-token-' + Date.now(),
          admin: updatedAdmin,
          expiresIn: 3600
        };
        
        this.handleLoginSuccess(mockResponse);
        return of(mockResponse).pipe(delay(800));
      } else {
        // ❌ Failed login - increment attempts
        this.incrementLoginAttempts(credentials.email);
        return throwError(() => new Error(this.getLoginErrorMessage(credentials.email)));
      }
    }

    // 🌐 TRY BACKEND API LOGIN
    return this.http.post<LoginResponse>(`${this.API_URL}/admin/login`, credentials)
      .pipe(
        tap(response => this.handleLoginSuccess(response)),
        catchError(error => {
          // If backend fails, increment attempts for this email
          this.incrementLoginAttempts(credentials.email);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
    localStorage.removeItem(this.LOGIN_TIME_KEY); // 🔧 ADD: Clear login time
    this.isAuthenticatedSubject.next(false);
    this.currentAdminSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleLoginSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(response.admin));
    localStorage.setItem(this.LOGIN_TIME_KEY, new Date().toISOString()); // 🔧 ADD: Store login time
    this.isAuthenticatedSubject.next(true);
    this.currentAdminSubject.next(response.admin);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token; // Add token expiry validation in production
  }

  private getStoredAdmin(): Admin | null {
    const adminData = localStorage.getItem(this.ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  }

  // 🔒 ACCOUNT LOCKOUT LOGIC (US012 requirement)
  private incrementLoginAttempts(email: string): void {
    const attempts = (this.loginAttempts.get(email) || 0) + 1;
    this.loginAttempts.set(email, attempts);
    
    if (attempts >= 3) {
      // Lock account for 15 minutes
      this.lockedUntil.set(email, Date.now() + (15 * 60 * 1000));
    }
  }

  private resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
    this.lockedUntil.delete(email);
  }

  private isAccountLocked(email: string): boolean {
    const lockTime = this.lockedUntil.get(email);
    return lockTime ? Date.now() < lockTime : false;
  }

  private getRemainingLockTime(email: string): number {
    const lockTime = this.lockedUntil.get(email);
    if (!lockTime) return 0;
    return Math.ceil((lockTime - Date.now()) / 1000 / 60);
  }

  private getLoginErrorMessage(email: string): string {
    const attempts = this.loginAttempts.get(email) || 0;
    const remainingAttempts = 3 - attempts;
    
    if (remainingAttempts <= 0) {
      return 'Account locked due to too many failed attempts. Try again in 15 minutes.';
    }
    
    return `Invalid credentials. ${remainingAttempts} attempt(s) remaining.`;
  }

  // 📤 PUBLIC METHODS (your existing ones)
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentAdmin(): Admin | null {
    return this.currentAdminSubject.value;
  }

  // 🔧 NEW METHODS FOR PROFILE INTEGRATION

  /**
   * Get the last login time for profile display
   */
  getLastLoginTime(): Date | null {
    const loginTime = localStorage.getItem(this.LOGIN_TIME_KEY);
    return loginTime ? new Date(loginTime) : null;
  }

  /**
   * Update current admin data and sync across components (for profile changes)
   */
  updateCurrentAdminData(updatedAdmin: Admin): void {
    // Update localStorage
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(updatedAdmin));
    
    // Update BehaviorSubject to notify all subscribers (including dashboard)
    this.currentAdminSubject.next(updatedAdmin);
  }

  /**
   * Check if backend is connected (detects fallback vs real backend)
   */
  isBackendConnected(): boolean {
    const currentAdmin = this.getCurrentAdmin();
    const token = this.getToken();
    
    // If using fallback admin or fake token, backend is not connected
    if (currentAdmin?.email === this.fallbackAdmin.email) return false;
    if (token?.startsWith('fake-jwt-token-')) return false;
    
    return true;
  }

  /**
   * Change password - ONLY works when backend is connected
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // Check if backend is connected
    if (!this.isBackendConnected()) {
      return throwError(() => new Error('Backend connection required for password changes'));
    }

    // 🔧 WHEN BACKEND IS CONNECTED, this will work
    return this.http.post(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Password change failed:', error);
        return throwError(() => new Error('Failed to change password'));
      })
    );
  }

  /**
   * Update admin profile - ONLY works when backend is connected
   */
  updateProfile(profileData: Partial<Admin>): Observable<Admin> {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) {
      return throwError(() => new Error('No admin logged in'));
    }

    // Check if backend is connected
    if (!this.isBackendConnected()) {
      return throwError(() => new Error('Backend connection required for profile updates'));
    }

    // 🔧 WHEN BACKEND IS CONNECTED, this will work
    return this.http.put<Admin>(`${this.API_URL}/profile`, profileData)
      .pipe(
        tap(updatedAdmin => this.updateCurrentAdminData(updatedAdmin)),
        catchError(error => {
          console.error('Profile update failed:', error);
          return throwError(() => new Error('Failed to update profile'));
        })
      );
  }
}
