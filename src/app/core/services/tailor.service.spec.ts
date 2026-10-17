import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TailorService } from './tailor.service';
import { TopRatedTailor } from '../models/home.models';

describe('TailorService', () => {
  let service: TailorService;
  let httpMock: HttpTestingController;

  const mockTailors: TopRatedTailor[] = [
    {
      id: 'tailor_rajesh',
      name: 'Master Rajesh',
      specialty: 'Suits, Shirts & Kurtas',
      experience: '18+ yrs exp',
      rating: 4.9,
      distance: '1.2 km away',
      imageUrl: 'assets/images/home/tailor_expert_1.jpg',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TailorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TailorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tailors and cache the result', () => {
    let result: TopRatedTailor[] | undefined;

    service.getTailors().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/tailors/tailors.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockTailors);

    expect(result).toEqual(mockTailors);
    expect(result?.length).toBe(1);

    // Second call should return cached result without another HTTP request
    let cachedResult: TopRatedTailor[] | undefined;
    service.getTailors().subscribe((data) => {
      cachedResult = data;
    });
    httpMock.expectNone('assets/mock-data/tailors/tailors.json');
    expect(cachedResult).toEqual(mockTailors);
  });

  it('should return fallback data gracefully on HTTP failure', () => {
    let result: TopRatedTailor[] | undefined;

    service.getTailors().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/tailors/tailors.json');
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    expect(result?.[0].name).toBe('Master Rajesh');
  });

  it('should reset cache on refreshTailors', () => {
    service.getTailors().subscribe();
    const req1 = httpMock.expectOne('assets/mock-data/tailors/tailors.json');
    req1.flush(mockTailors);

    service.refreshTailors().subscribe();
    const req2 = httpMock.expectOne('assets/mock-data/tailors/tailors.json');
    req2.flush(mockTailors);
  });
});
