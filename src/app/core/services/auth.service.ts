import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of, switchMap, throwError } from 'rxjs';
import {
  AuthMockData,
  AuthResponse,
  AuthSession,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  UserProfile,
} from '../models/auth.models';

/**
 * AuthService
 * 
 * Handles mobile number authentication, OTP generation, and OTP verification.
 * Currently backed by mock JSON data loaded via Angular HttpClient.
 * 
 * ==============================================================================
 * FUTURE BACKEND INTEGRATION GUIDE:
 * ==============================================================================
 * When real APIs become available:
 * 1. Update `apiUrl` to point to your backend baseUrl (e.g., environment.apiUrl).
 * 2. Replace the `http.get('assets/mock-data/auth/login.json')` simulation inside
 *    `requestOtp()` with:
 *      return this.http.post<OtpRequestResponse>(`${this.apiUrl}/auth/request-otp`, payload);
 * 3. Replace the mock verification in `verifyOtp()` with:
 *      return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-otp`, payload);
 * 4. The UI components (LoginPage, etc.) consume the exact same payload/response contracts,
 *    requiring ZERO UI rewrites.
 * ==============================================================================
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly mockDataUrl = 'assets/mock-data/auth/login.json';
  private readonly storageKey = 'tailor_app_session';

  // Signals for reactive, efficient state access
  private readonly _currentUser = signal<UserProfile | null>(this.getStoredSession()?.user ?? null);
  public readonly currentUser = this._currentUser.asReadonly();

  private readonly _pendingMobile = signal<string>('9999999999');
  public readonly pendingMobile = this._pendingMobile.asReadonly();

  constructor() {}

  public setPendingMobile(mobile: string): void {
    const clean = mobile.replace(/\D/g, '').trim();
    if (clean) {
      this._pendingMobile.set(clean);
    }
  }

  /**
   * Request OTP for a given mobile number.
   * Reads validation rules and test credentials from mock JSON.
   */
  public requestOtp(payload: OtpRequestPayload): Observable<OtpRequestResponse> {
    const cleanMobile = payload.mobileNumber.replace(/\D/g, '').trim();

    // Indian mobile numbers must be 10 digits
    if (cleanMobile.length !== 10) {
      return throwError(() => new Error('Please enter a valid 10-digit mobile number.'));
    }

    return this.http.get<AuthMockData>(this.mockDataUrl).pipe(
      delay(600), // Simulate realistic network latency for UI spinners
      switchMap((mockConfig) => {
        if (cleanMobile !== mockConfig.testMobileNumber) {
          return throwError(
            () =>
              new Error(
                `Only the test mobile number ${mockConfig.testMobileNumber} is permitted during this mock trial.`
              )
          );
        }

        this.setPendingMobile(cleanMobile);

        return of({
          success: true,
          message: `OTP sent successfully to ${payload.countryCode} ${cleanMobile}`,
          cooldownSeconds: mockConfig.otpResendCooldownSeconds,
          devHintOtp: mockConfig.testOtp,
        });
      })
    );
  }

  /**
   * Verify the entered OTP against mock data.
   */
  public verifyOtp(payload: OtpVerifyPayload): Observable<AuthResponse> {
    const cleanMobile = payload.mobileNumber.replace(/\D/g, '').trim();
    const cleanOtp = payload.otp.replace(/\D/g, '').trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      return throwError(() => new Error('Please enter the full 4-digit OTP code.'));
    }

    return this.http.get<AuthMockData>(this.mockDataUrl).pipe(
      delay(700), // Simulate realistic network roundtrip
      switchMap((mockConfig) => {
        if (cleanMobile !== mockConfig.testMobileNumber) {
          return throwError(
            () => new Error(`Invalid mobile number. Expected ${mockConfig.testMobileNumber}`)
          );
        }

        // Allow configured mock testOtp (e.g. 1234) or reference screenshot digits (0234)
        const isMatch = cleanOtp === mockConfig.testOtp || cleanOtp === '0234' || cleanOtp === '1234';
        if (!isMatch) {
          return throwError(
            () =>
              new Error(
                `Invalid OTP. Please enter the test OTP: ${mockConfig.testOtp}`
              )
          );
        }


        const session: AuthSession = {
          token: mockConfig.mockAuthToken,
          user: mockConfig.mockUser,
          expiresAt: Date.now() + mockConfig.mockSessionDurationSeconds * 1000,
        };

        this.saveSession(session);
        this._currentUser.set(session.user);

        return of({
          success: true,
          message: 'OTP verified successfully. Welcome to Tailor App!',
          session,
        });
      })
    );
  }

  /**
   * Resend OTP for the current mobile number.
   */
  public resendOtp(payload: OtpRequestPayload): Observable<OtpRequestResponse> {
    return this.requestOtp(payload);
  }

  /**
   * Clear current user session and state.
   */
  public logout(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore storage access errors
    }
    this._currentUser.set(null);
  }

  /**
   * Check if user is currently authenticated with a valid session.
   */
  public isAuthenticated(): boolean {
    const session = this.getStoredSession();
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.logout();
      return false;
    }
    return true;
  }

  private saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    } catch {
      // Storage unavailable / private mode fallback
    }
  }

  private getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      return JSON.parse(data) as AuthSession;
    } catch {
      return null;
    }
  }
}
