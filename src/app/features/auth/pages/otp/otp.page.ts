import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSpinner,
  ],
})
export class OtpPage implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChildren('otpBox') private otpBoxElements!: QueryList<ElementRef<HTMLInputElement>>;

  // Reactive states
  public readonly mobileNumber = signal<string>('9999999999');
  public readonly countryCode = signal<string>('+91');
  public readonly otpDigits = signal<string[]>(['', '', '', '']);
  public readonly activeBoxIndex = signal<number>(1); // 1-indexed or focused index
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly resendCountdown = signal<number>(29);

  private countdownIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // Read mobile number from route query params or AuthService state
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const queryMobile = params['mobile'];
        if (queryMobile) {
          this.mobileNumber.set(queryMobile);
          this.authService.setPendingMobile(queryMobile);
        } else {
          this.mobileNumber.set(this.authService.pendingMobile());
        }
      });

    this.startResendTimer(29);

    this.destroyRef.onDestroy(() => {
      this.clearResendTimer();
    });
  }

  ngAfterViewInit(): void {
    // Auto-focus on first empty box or box 0
    setTimeout(() => {
      this.focusBox(0);
    }, 250);
  }

  /**
   * Formatted display of mobile number (e.g. +91 99999 99999)
   */
  public get formattedMobile(): string {
    const raw = this.mobileNumber().replace(/\D/g, '');
    if (raw.length === 10) {
      return `${this.countryCode()} ${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    return `${this.countryCode()} ${raw}`;
  }

  /**
   * Combined 4-digit OTP string
   */
  public get completeOtp(): string {
    return this.otpDigits().join('');
  }

  public get isOtpComplete(): boolean {
    return this.completeOtp.length === 4;
  }

  /**
   * Handle single digit input
   */
  public onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    const digits = [...this.otpDigits()];
    if (value.length > 0) {
      // Pick the last typed character
      digits[index] = value.slice(-1);
      this.otpDigits.set(digits);
      input.value = digits[index];
      this.clearErrors();

      // Move focus to next input if available
      if (index < 3) {
        this.focusBox(index + 1);
      } else {
        input.blur();
        // Auto-verify if all 4 digits entered
        if (this.isOtpComplete && !this.isLoading()) {
          this.onVerify();
        }
      }
    } else {
      digits[index] = '';
      this.otpDigits.set(digits);
      input.value = '';
    }
  }

  /**
   * Handle keyboard navigation (Backspace, Arrow keys)
   */
  public onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const digits = [...this.otpDigits()];
      if (!digits[index] && index > 0) {
        // If current box is already empty, move to previous and clear it
        digits[index - 1] = '';
        this.otpDigits.set(digits);
        this.focusBox(index - 1);
        event.preventDefault();
      } else {
        digits[index] = '';
        this.otpDigits.set(digits);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusBox(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < 3) {
      this.focusBox(index + 1);
      event.preventDefault();
    } else if (event.key === 'Enter' && this.isOtpComplete) {
      this.onVerify();
    }
  }

  /**
   * Handle clipboard paste (e.g. user pastes "1234" or "0234")
   */
  public onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const cleanNumbers = clipboardData.replace(/\D/g, '').slice(0, 4);

    if (cleanNumbers.length > 0) {
      const digits = ['', '', '', ''];
      for (let i = 0; i < cleanNumbers.length; i++) {
        digits[i] = cleanNumbers[i];
      }
      this.otpDigits.set(digits);

      // Update native input element values
      this.otpBoxElements.forEach((elRef, i) => {
        elRef.nativeElement.value = digits[i] || '';
      });

      this.clearErrors();

      const nextFocus = Math.min(cleanNumbers.length, 3);
      this.focusBox(nextFocus);

      if (cleanNumbers.length === 4 && !this.isLoading()) {
        this.onVerify();
      }
    }
  }

  public onFocus(index: number): void {
    this.activeBoxIndex.set(index);
    const box = this.otpBoxElements?.get(index)?.nativeElement;
    if (box) {
      box.select();
    }
  }

  private focusBox(index: number): void {
    const box = this.otpBoxElements?.get(index)?.nativeElement;
    if (box) {
      box.focus();
      box.select();
      this.activeBoxIndex.set(index);
    }
  }

  /**
   * Verify entered 4-digit OTP
   */
  public onVerify(): void {
    if (!this.isOtpComplete || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.clearErrors();

    const payload = {
      countryCode: this.countryCode(),
      mobileNumber: this.mobileNumber(),
      otp: this.completeOtp,
    };

    this.authService
      .verifyOtp(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(response.message);
          this.clearResendTimer();
          setTimeout(() => {
            this.router.navigate(['/home'], { replaceUrl: true });
          }, 350);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.message || 'Invalid verification code. Please check and try again.'
          );
        },
      });
  }

  /**
   * Resend OTP request
   */
  public onResendOtp(): void {
    if (this.resendCountdown() > 0 || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.clearErrors();

    this.authService
      .resendOtp({
        countryCode: this.countryCode(),
        mobileNumber: this.mobileNumber(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.startResendTimer(response.cooldownSeconds || 29);
          this.successMessage.set('A new OTP has been sent successfully.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to resend OTP.');
        },
      });
  }

  /**
   * Navigate back to login page to edit mobile number
   */
  public onEditMobile(): void {
    this.router.navigate(['/login']);
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
