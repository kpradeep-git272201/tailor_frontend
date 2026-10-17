import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HomeService } from './home.service';
import { HomeData } from '../models/home.models';

describe('HomeService', () => {
  let service: HomeService;
  let httpMock: HttpTestingController;

  const mockFeed: HomeData = {
    location: { city: 'Agra', state: 'Uttar Pradesh', country: 'India' },
    searchPlaceholder: 'Search for Shirts, Kurta, etc.',
    banners: [
      {
        id: 'banner_linen_lux',
        title: 'Linen Lux - Up to 50% OFF!',
        subtext: 'Festival Special',
        imageUrl: 'assets/images/home/hero_banner_linen.jpg',
        actionRoute: '/fabrics',
        accentColor: '#c59a3f',
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
    ],
    topRatedFabrics: [
      {
        id: 'fab_cotton',
        name: 'Cotton',
        subtitle: 'Premium Quality',
        rating: 4.9,
        imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HomeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(HomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch home feed data and cache the result', () => {
    let result: HomeData | undefined;

    service.getHomeData().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/home/home-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockFeed);

    expect(result).toEqual(mockFeed);
    expect(result?.banners.length).toBe(1);
    expect(result?.banners[0].title).toBe('Linen Lux - Up to 50% OFF!');

    // Second call should return cached observable without firing another HTTP request
    let cachedResult: HomeData | undefined;
    service.getHomeData().subscribe((data) => {
      cachedResult = data;
    });
    httpMock.expectNone('assets/mock-data/home/home-data.json');
    expect(cachedResult).toEqual(mockFeed);
  });

  it('should return fallback data gracefully if HTTP request fails', () => {
    let result: HomeData | undefined;

    service.getHomeData().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/home/home-data.json');
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeDefined();
    expect(result?.location.city).toBe('Agra');
    expect(result?.banners[0].title).toContain('Linen Lux');
  });

  it('should reset cache and make a new request on refreshHomeData', () => {
    // Prime cache
    service.getHomeData().subscribe();
    const req1 = httpMock.expectOne('assets/mock-data/home/home-data.json');
    req1.flush(mockFeed);

    // Refresh
    service.refreshHomeData().subscribe();
    const req2 = httpMock.expectOne('assets/mock-data/home/home-data.json');
    req2.flush(mockFeed);
  });
});
