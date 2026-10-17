import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthMockData } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockData: AuthMockData = {
    testMobileNumber: '9999999999',
    countryCode: '+91',
    testOtp: '123456',
    otpResendCooldownSeconds: 30,
    mockSessionDurationSeconds: 86400,
    mockUser: {
      id: 'usr_test_123',
      mobileNumber: '9999999999',
      countryCode: '+91',
      name: 'Test Tailor User',
      email: 'test@tailorapp.local',
      isProfileComplete: false,
      createdAt: '2026-10-17T08:00:00Z',
    },
    mockAuthToken: 'mock-test-token-12345',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('pendingMobile', () => {
    it('should set and get pending mobile number', () => {
      service.setPendingMobile('9876543210');
      expect(service.pendingMobile()).toBe('9876543210');
    });

    it('should strip non-digits when setting pending mobile number', () => {
      service.setPendingMobile('99999-99999');
      expect(service.pendingMobile()).toBe('9999999999');
    });
  });

  describe('requestOtp', () => {
    it('should fail if mobile number is not 10 digits', async () => {
      let error: any;
      try {
        await firstValueFrom(
          service.requestOtp({ countryCode: '+91', mobileNumber: '123' })
        );
      } catch (err) {
        error = err;
      }
      expect(error).toBeTruthy();
      expect(error.message).toContain('Please enter a valid 10-digit mobile number.');
    });

    it('should succeed for configured test mobile number', async () => {
      vi.useFakeTimers();
      const promise = firstValueFrom(
        service.requestOtp({ countryCode: '+91', mobileNumber: '9999999999' })
      );

      const req = httpMock.expectOne('assets/mock-data/auth/login.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await vi.advanceTimersByTimeAsync(700);
      const res = await promise;

      expect(res.success).toBe(true);
      expect(res.cooldownSeconds).toBe(30);
      expect(res.devHintOtp).toBe('123456');
      expect(service.pendingMobile()).toBe('9999999999');
      vi.useRealTimers();
    });

    it('should fail if mobile number does not match configured test number', async () => {
      vi.useFakeTimers();
      let error: any;

      service
        .requestOtp({ countryCode: '+91', mobileNumber: '9876543210' })
        .subscribe({
          next: () => {},
          error: (err) => {
            error = err;
          },
        });

      const req = httpMock.expectOne('assets/mock-data/auth/login.json');
      req.flush(mockData);

      await vi.advanceTimersByTimeAsync(700);

      expect(error).toBeTruthy();
      expect(error.message).toContain('Only the test mobile number 9999999999 is permitted');
      vi.useRealTimers();
    });
  });

  describe('verifyOtp', () => {
    it('should fail if OTP is less than 6 digits', async () => {
      let error: any;
      try {
        await firstValueFrom(
          service.verifyOtp({
            countryCode: '+91',
            mobileNumber: '9999999999',
            otp: '1234',
          })
        );
      } catch (err) {
        error = err;
      }
      expect(error).toBeTruthy();
      expect(error.message).toContain('Please enter the full 6-digit OTP code.');
    });

    it('should fail if OTP is incorrect', async () => {
      vi.useFakeTimers();
      let error: any;

      service
        .verifyOtp({
          countryCode: '+91',
          mobileNumber: '9999999999',
          otp: '999999',
        })
        .subscribe({
          next: () => {},
          error: (err) => {
            error = err;
          },
        });

      const req = httpMock.expectOne('assets/mock-data/auth/login.json');
      req.flush(mockData);

      await vi.advanceTimersByTimeAsync(800);

      expect(error).toBeTruthy();
      expect(error.message).toContain('Invalid OTP. Please enter the test OTP: 123456');
      vi.useRealTimers();
    });

    it('should succeed and set session when OTP is correct', async () => {
      vi.useFakeTimers();
      const promise = firstValueFrom(
        service.verifyOtp({
          countryCode: '+91',
          mobileNumber: '9999999999',
          otp: '123456',
        })
      );

      const req = httpMock.expectOne('assets/mock-data/auth/login.json');
      req.flush(mockData);

      await vi.advanceTimersByTimeAsync(800);
      const res = await promise;

      expect(res.success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.mobileNumber).toBe('9999999999');
      expect(service.currentUser()?.name).toBe('Test Tailor User');
      vi.useRealTimers();
    });
  });

  describe('logout and session', () => {
    it('should clear session and current user on logout', () => {
      service.logout();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
