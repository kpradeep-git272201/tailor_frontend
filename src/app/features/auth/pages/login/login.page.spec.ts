import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginPage } from './login.page';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with mobile step and invalid form', () => {
    expect(component.step()).toBe('mobile');
    expect(component.mobileForm.valid).toBe(false);
  });

  it('should validate 10-digit mobile number starting with 6-9', () => {
    component.mobileForm.controls.mobile.setValue('9999999999');
    expect(component.mobileForm.valid).toBe(true);

    component.mobileForm.controls.mobile.setValue('12345');
    expect(component.mobileForm.valid).toBe(false);

    component.mobileForm.controls.mobile.setValue('5999999999');
    expect(component.mobileForm.valid).toBe(false);
  });

  it('should sanitize non-digits on input', () => {
    const inputElement = document.createElement('input');
    inputElement.value = '987-abc-6543210extra';
    const event = { target: inputElement } as unknown as Event;

    component.onMobileInput(event);

    expect(component.mobileForm.controls.mobile.value).toBe('9876543210');
  });

  it('should populate test mobile number on useTestMobile', () => {
    component.useTestMobile();
    expect(component.mobileForm.controls.mobile.value).toBe('9999999999');
    expect(component.mobileForm.valid).toBe(true);
  });

  it('should navigate to /home when onSkip is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onSkip();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('should call authService.requestOtp and navigate to /otp on successful onGetOtp', () => {
    const requestSpy = vi.spyOn(authService, 'requestOtp').mockReturnValue(
      of({
        success: true,
        message: 'OTP sent',
        cooldownSeconds: 30,
        devHintOtp: '1234',
      })
    );
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.mobileForm.controls.mobile.setValue('9999999999');
    component.onGetOtp();

    expect(requestSpy).toHaveBeenCalledWith({
      countryCode: '+91',
      mobileNumber: '9999999999',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/otp'], {
      queryParams: { mobile: '9999999999' },
    });
  });

  it('should set error message when requestOtp fails', () => {
    vi.spyOn(authService, 'requestOtp').mockReturnValue(
      throwError(() => new Error('Only test mobile number permitted'))
    );

    component.mobileForm.controls.mobile.setValue('9999999999');
    component.onGetOtp();

    expect(component.errorMessage()).toBe('Only test mobile number permitted');
  });
});
