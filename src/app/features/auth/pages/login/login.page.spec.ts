import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
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
  });
});
