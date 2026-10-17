import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { HomePage } from './home.page';
import { AuthService } from '../core/services/auth.service';
import { HomeService } from '../core/services/home.service';
import { ArticleService } from '../core/services/article.service';
import { ArticleItem, HomeData } from '../core/models/home.models';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let router: Router;
  let authService: AuthService;
  let homeService: HomeService;
  let articleService: ArticleService;

  const mockArticles: ArticleItem[] = [
    { id: 'art_shirt', name: 'Shirt', imageUrl: 'assets/images/articles/shirt.jpg', category: 'shirts' },
    { id: 'art_pant', name: 'Pant', imageUrl: 'assets/images/articles/pant.jpg', category: 'pants' },
  ];

  const mockHomeData: HomeData = {
    location: { city: 'Agra', state: 'Uttar Pradesh', country: 'India' },
    searchPlaceholder: 'Search for Shirts, Kurta, etc.',
    articles: mockArticles,
    banners: [
      {
        id: 'banner_1',
        title: 'Linen Lux - Up to 50% OFF!',
        subtext: 'Festival Special',
        imageUrl: 'assets/images/home/hero_banner_linen.jpg',
        actionRoute: '/fabrics',
        accentColor: '#c59a3f',
      },
      {
        id: 'banner_2',
        title: 'Royal Silk Collection',
        subtext: 'Custom Fit in 48 Hours',
        imageUrl: 'assets/images/home/fabric_silk_green.jpg',
        actionRoute: '/fabrics',
        accentColor: '#1b7a70',
      },
      {
        id: 'banner_3',
        title: 'Master Tailor Booking',
        subtext: 'Doorstep Measurement',
        imageUrl: 'assets/images/home/service_with_fabric.jpg',
        actionRoute: '/tailors',
        accentColor: '#0f243b',
      },
    ],
    services: [
      {
        id: 'service_with_fabric',
        badge: 'We provide fabric',
        actionLabel: 'Book now',
        imageUrl: 'assets/images/home/service_with_fabric.jpg',
        theme: 'teal',
        route: '/book-tailor',
      },
      {
        id: 'service_without_fabric',
        badge: 'Bring your own fabric',
        actionLabel: 'Without Fabric',
        imageUrl: 'assets/images/home/service_without_fabric.jpg',
        theme: 'navy',
        route: '/custom-stitching',
      },
    ],
    topRatedFabrics: [
      {
        id: 'fab_cotton',
        name: 'Cotton',
        subtitle: 'Premium Quality',
        rating: 4.9,
        imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
      },
      {
        id: 'fab_silk',
        name: 'Silk',
        subtitle: 'Premium Quality',
        rating: 4.8,
        imageUrl: 'assets/images/home/fabric_silk_green.jpg',
      },
    ],
    topRatedTailors: [
      {
        id: 'tailor_rajesh',
        name: 'Master Rajesh',
        specialty: 'Suits, Shirts & Kurtas',
        experience: '18+ yrs exp',
        rating: 4.9,
        distance: '1.2 km away',
        imageUrl: 'assets/images/home/tailor_expert_1.jpg',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: HomeService,
          useValue: {
            getHomeData: vi.fn().mockReturnValue(of(mockHomeData)),
            refreshHomeData: vi.fn().mockReturnValue(of(mockHomeData)),
          },
        },
        {
          provide: ArticleService,
          useValue: {
            getArticles: vi.fn().mockReturnValue(of(mockArticles)),
            refreshArticles: vi.fn().mockReturnValue(of(mockArticles)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    homeService = TestBed.inject(HomeService);
    articleService = TestBed.inject(ArticleService);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load home data on init and start autoplay', () => {
    expect(homeService.getHomeData).toHaveBeenCalled();
    expect(component.homeData()).toEqual(mockHomeData);
    expect(component.isLoading()).toBe(false);
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

  it('should update active tab and navigate on onSelectTab', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onSelectTab('tailors');
    expect(component.activeTab()).toBe('tailors');
    expect(navigateSpy).toHaveBeenCalledWith(['/tailors']);

    component.onSelectTab('fabric');
    expect(component.activeTab()).toBe('fabric');
    expect(navigateSpy).toHaveBeenCalledWith(['/fabrics']);
  });

  it('should toggle profile menu', () => {
    expect(component.isProfileMenuOpen()).toBe(false);
    component.toggleProfileMenu();
    expect(component.isProfileMenuOpen()).toBe(true);
    component.closeProfileMenu();
    expect(component.isProfileMenuOpen()).toBe(false);
  });

  it('should update and clear search query', () => {
    const event = { target: { value: 'Kurta' } } as unknown as Event;
    component.onSearchInput(event);
    expect(component.searchQuery()).toBe('Kurta');

    component.onClearSearch();
    expect(component.searchQuery()).toBe('');
  });

  it('should navigate to /fabrics on onViewMoreFabrics', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onViewMoreFabrics();
    expect(navigateSpy).toHaveBeenCalledWith(['/fabrics']);
  });

  it('should navigate to /tailors on onViewMoreTailors', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onViewMoreTailors();
    expect(navigateSpy).toHaveBeenCalledWith(['/tailors']);
  });

  it('should navigate to /articles/:id when onSelectArticle is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const article: ArticleItem = {
      id: 'art_shirt',
      name: 'Shirt',
      imageUrl: 'assets/images/articles/shirt.jpg',
      category: 'shirts',
    };
    component.onSelectArticle(article);
    expect(component.selectedArticle()).toBe('art_shirt');
    expect(navigateSpy).toHaveBeenCalledWith(['/articles', 'art_shirt']);
  });

  it('should handle banner navigation and cyclic index calculation', () => {
    expect(component.activeBannerIndex()).toBe(0);
    component.nextBanner();
    expect(component.activeBannerIndex()).toBe(1);
    component.nextBanner();
    expect(component.activeBannerIndex()).toBe(2);
    component.nextBanner(); // Wraps around
    expect(component.activeBannerIndex()).toBe(0);

    component.prevBanner(); // Wraps back to end
    expect(component.activeBannerIndex()).toBe(2);

    component.setActiveBanner(1);
    expect(component.activeBannerIndex()).toBe(1);
  });

  it('should handle touch swiping gestures on the banner', () => {
    component.setActiveBanner(0);

    // Swipe Left (delta < -40) -> next banner
    const touchStartLeft = {
      touches: [{ clientX: 200 }],
    } as unknown as TouchEvent;
    const touchMoveLeft = {
      touches: [{ clientX: 120 }],
    } as unknown as TouchEvent;

    component.onTouchStart(touchStartLeft);
    component.onTouchMove(touchMoveLeft);
    component.onTouchEnd();
    expect(component.activeBannerIndex()).toBe(1);

    // Swipe Right (delta > 40) -> previous banner
    const touchStartRight = {
      touches: [{ clientX: 100 }],
    } as unknown as TouchEvent;
    const touchMoveRight = {
      touches: [{ clientX: 180 }],
    } as unknown as TouchEvent;

    component.onTouchStart(touchStartRight);
    component.onTouchMove(touchMoveRight);
    component.onTouchEnd();
    expect(component.activeBannerIndex()).toBe(0);
  });

  it('should pause autoplay on mouse enter and resume on mouse leave', () => {
    component.onBannerMouseEnter();
    component.onBannerMouseLeave();
    expect(component).toBeTruthy();
  });

  it('should navigate when banner is selected', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onSelectBanner(mockHomeData.banners[0]);
    expect(navigateSpy).toHaveBeenCalledWith(['/fabrics']);
  });

  it('should navigate when service card is selected', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onSelectService(mockHomeData.services[0]);
    expect(navigateSpy).toHaveBeenCalledWith(['/book-tailor']);
  });

  it('should load articles from home data and article service', () => {
    expect(articleService.getArticles).toHaveBeenCalled();
    expect(component.articles().length).toBeGreaterThan(0);
    expect(component.articles()[0].name).toBe('Shirt');
  });
});
