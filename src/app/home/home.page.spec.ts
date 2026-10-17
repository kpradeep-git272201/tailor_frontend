import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { HomePage } from './home.page';
import { AuthService } from '../core/services/auth.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect guest mode when no user is logged in', () => {
    authService.logout();
    fixture.detectChanges();
    expect(component.currentUser()).toBeNull();
  });

  it('should navigate to /login when onGoToLogin is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onGoToLogin();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should call authService.logout and navigate to /login on onSignOut', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onSignOut();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
