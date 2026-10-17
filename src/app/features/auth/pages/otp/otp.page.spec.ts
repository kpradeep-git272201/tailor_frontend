import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OtpPage } from './otp.page';
import { AuthService } from '../../../../core/services/auth.service';

describe('OtpPage', () => {
  let component: OtpPage;
  let fixture: ComponentFixture<OtpPage>;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 6 empty digits', () => {
    expect(component.otpDigits()).toEqual(['', '', '', '', '', '']);
    expect(component.isOtpComplete).toBe(false);
  });

  it('should format mobile number with country code', () => {
    component.mobileNumber.set('9876543210');
    expect(component.formattedMobile).toBe('+91 98765 43210');
  });

  it('should detect when 6 digits are completed', () => {
    component.otpDigits.set(['1', '2', '3', '4', '5', '6']);
    expect(component.completeOtp).toBe('123456');
    expect(component.isOtpComplete).toBe(true);
  });

  it('should update digit on onInput', () => {
    const inputElement = document.createElement('input');
    inputElement.value = '5';
    const event = { target: inputElement } as unknown as Event;

    component.onInput(0, event);

    expect(component.otpDigits()[0]).toBe('5');
  });

  it('should handle backspace on onKeyDown', () => {
    component.otpDigits.set(['1', '2', '', '', '', '']);
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    // On index 2 (which is empty), backspace should clear index 1
    component.onKeyDown(2, event);

    expect(component.otpDigits()[1]).toBe('');
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should parse pasted 6-digit code in onPaste', () => {
    const clipboardData = {
      getData: vi.fn().mockReturnValue('123456'),
    } as unknown as DataTransfer;

    const event = {
      preventDefault: vi.fn(),
      clipboardData,
    } as unknown as ClipboardEvent;

    component.onPaste(event);

    expect(component.otpDigits()).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(component.completeOtp).toBe('123456');
    expect(component.isOtpComplete).toBe(true);
  });

  it('should navigate to /login when onEditMobile is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEditMobile();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should not call verifyOtp if OTP is incomplete', () => {
    const verifySpy = vi.spyOn(authService, 'verifyOtp');
    component.otpDigits.set(['1', '2', '3', '4', '5', '']);

    component.onVerify();

    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('should call verifyOtp and navigate to /home on verification success', () => {
    vi.useFakeTimers();
    const verifySpy = vi.spyOn(authService, 'verifyOtp').mockReturnValue(
      of({
        success: true,
        message: 'OTP verified successfully.',
      })
    );
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.mobileNumber.set('9999999999');
    component.otpDigits.set(['1', '2', '3', '4', '5', '6']);

    component.onVerify();

    expect(verifySpy).toHaveBeenCalledWith({
      countryCode: '+91',
      mobileNumber: '9999999999',
      otp: '123456',
    });

    vi.advanceTimersByTime(400);
    expect(navigateSpy).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
    vi.useRealTimers();
  });

  it('should set error message when verifyOtp fails', () => {
    vi.spyOn(authService, 'verifyOtp').mockReturnValue(
      throwError(() => new Error('Invalid verification code.'))
    );

    component.mobileNumber.set('9999999999');
    component.otpDigits.set(['9', '9', '9', '9', '9', '9']);

    component.onVerify();

    expect(component.errorMessage()).toBe('Invalid verification code.');
  });

  it('should clear OTP digits and error banner when onResendOtp is called', () => {
    vi.spyOn(authService, 'resendOtp').mockReturnValue(
      of({
        success: true,
        message: 'OTP resent',
        cooldownSeconds: 30,
      })
    );

    component.otpDigits.set(['1', '2', '3', '4', '4', '4']);
    component.errorMessage.set('Invalid OTP. Please enter the test OTP: 123456');
    component.resendCountdown.set(0);

    component.onResendOtp();

    expect(component.otpDigits()).toEqual(['', '', '', '', '', '']);
    expect(component.errorMessage()).toBeNull();
    expect(component.successMessage()).toBe('A new OTP has been sent successfully.');
  });

  it('should update digits and trigger auto-verify on onHiddenInput when 6 digits are typed', () => {
    const verifySpy = vi.spyOn(authService, 'verifyOtp').mockReturnValue(
      of({ success: true, message: 'Verified' })
    );

    const inputEl = document.createElement('input');
    inputEl.value = '123456';
    const event = { target: inputEl } as unknown as Event;

    component.onHiddenInput(event);

    expect(component.otpDigits()).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(component.completeOtp).toBe('123456');
    expect(verifySpy).toHaveBeenCalled();
  });

  it('should toggle isFocused on onInputFocus and onInputBlur', () => {
    component.onInputFocus();
    expect(component.isFocused()).toBe(true);

    component.onInputBlur();
    expect(component.isFocused()).toBe(false);
  });

  it('should track dynamic cursorPosition based on entered digits', () => {
    expect(component.cursorPosition).toBe(0);

    component.otpDigits.set(['6', '', '', '', '', '']);
    expect(component.cursorPosition).toBe(1);

    component.otpDigits.set(['6', '4', '5', '', '', '']);
    expect(component.cursorPosition).toBe(3);

    component.otpDigits.set(['6', '4', '5', '6', '7', '5']);
    expect(component.cursorPosition).toBe(6);
  });
});
