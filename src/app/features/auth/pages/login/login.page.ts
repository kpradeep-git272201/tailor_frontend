import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';

type LoginStep = 'mobile' | 'otp';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonSpinner,
  ],
})
export class LoginPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // Component reactive states
  public readonly step = signal<LoginStep>('mobile');
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly resendCountdown = signal<number>(0);
  public readonly testOtpHint = signal<string>('123456');

  // Country config
  public readonly countryCode = '+91';
  public readonly testMobileHint = '9999999999';

  // Mobile number form
  public readonly mobileForm = new FormGroup({
    mobile: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern('^[6-9][0-9]{9}$'),
      ],
    }),
  });

  // OTP verification form
  public readonly otpForm = new FormGroup({
    otp: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]{6}$'),
      ],
    }),
  });

  private countdownIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // Clean up timer on component destruction
    this.destroyRef.onDestroy(() => {
      this.clearResendTimer();
    });
  }

  /**
   * Sanitizes mobile number input to allow only digits up to 10 chars.
   */
  public onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
    this.mobileForm.controls.mobile.setValue(cleaned, { emitEvent: false });
    input.value = cleaned;
    this.clearErrors();
  }

  /**
   * Sanitizes OTP input to digits only.
   */
  public onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 6);
    this.otpForm.controls.otp.setValue(cleaned, { emitEvent: false });
    input.value = cleaned;
    this.clearErrors();

    // Auto-submit when 6 digits are typed
    if (cleaned.length === 6 && !this.isLoading()) {
      this.onVerifyOtp();
    }
  }

  /**
   * Convenience helper for fast testing
   */
  public useTestMobile(): void {
    this.mobileForm.controls.mobile.setValue(this.testMobileHint);
    this.clearErrors();
  }

  public useTestOtp(): void {
    this.otpForm.controls.otp.setValue(this.testOtpHint());
    this.clearErrors();
  }

  /**
   * Step 1: Request OTP for mobile number
   */
  public onGetOtp(): void {
    if (this.mobileForm.invalid || this.isLoading()) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.clearErrors();

    const mobileNumber = this.mobileForm.controls.mobile.value;

    this.authService
      .requestOtp({
        countryCode: this.countryCode,
        mobileNumber,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.authService.setPendingMobile(mobileNumber);
          this.router.navigate(['/otp'], { queryParams: { mobile: mobileNumber } });
        },

        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.message || 'Unable to send OTP. Please check the mobile number.'
          );
        },
      });
  }

  /**
   * Step 2: Verify OTP
   */
  public onVerifyOtp(): void {
    if (this.otpForm.invalid || this.isLoading()) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.clearErrors();

    const mobileNumber = this.mobileForm.controls.mobile.value;
    const otp = this.otpForm.controls.otp.value;

    this.authService
      .verifyOtp({
        countryCode: this.countryCode,
        mobileNumber,
        otp,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(response.message);
          this.clearResendTimer();
          // Navigate to Home dashboard after brief success confirmation
          setTimeout(() => {
            this.router.navigate(['/home'], { replaceUrl: true });
          }, 350);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.message || 'Verification failed. Please enter the valid test OTP.'
          );
        },
      });
  }

  /**
   * Resend OTP with countdown guard
   */
  public onResendOtp(): void {
    if (this.resendCountdown() > 0 || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.clearErrors();

    const mobileNumber = this.mobileForm.controls.mobile.value;

    this.authService
      .resendOtp({
        countryCode: this.countryCode,
        mobileNumber,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.startResendTimer(response.cooldownSeconds || 30);
          this.successMessage.set('A new OTP has been sent successfully.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to resend OTP.');
        },
      });
  }

  /**
   * Switch back to mobile number editing
   */
  public onEditMobile(): void {
    this.step.set('mobile');
    this.otpForm.reset();
    this.clearErrors();
    this.clearResendTimer();
  }

  /**
   * Skip authentication and continue as guest to Home page
   */
  public onSkip(): void {
    this.router.navigate(['/home']);
  }

  private clearErrors(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private startResendTimer(seconds: number): void {
    this.clearResendTimer();
    this.resendCountdown.set(seconds);

    this.countdownIntervalId = setInterval(() => {
      const current = this.resendCountdown();
      if (current <= 1) {
        this.clearResendTimer();
      } else {
        this.resendCountdown.set(current - 1);
      }
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
    this.resendCountdown.set(0);
  }
}
