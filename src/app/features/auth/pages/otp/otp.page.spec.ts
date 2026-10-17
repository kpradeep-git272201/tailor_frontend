import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { OtpPage } from './otp.page';

describe('OtpPage', () => {
  let component: OtpPage;
  let fixture: ComponentFixture<OtpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 4 empty digits', () => {
    expect(component.otpDigits()).toEqual(['', '', '', '']);
    expect(component.isOtpComplete).toBe(false);
  });

  it('should detect when 4 digits are completed', () => {
    component.otpDigits.set(['1', '2', '3', '4']);
    expect(component.completeOtp).toBe('1234');
    expect(component.isOtpComplete).toBe(true);
  });
});
