import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FabricService } from './fabric.service';
import { TopRatedFabric } from '../models/home.models';

describe('FabricService', () => {
  let service: FabricService;
  let httpMock: HttpTestingController;

  const mockFabrics: TopRatedFabric[] = [
    {
      id: 'fab_cotton',
      name: 'Cotton',
      subtitle: 'Premium Quality',
      rating: 4.9,
      imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
      startingPrice: 499,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FabricService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FabricService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch fabrics and cache the result', () => {
    let result: TopRatedFabric[] | undefined;

    service.getFabrics().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/fabrics/fabrics.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockFabrics);

    expect(result).toEqual(mockFabrics);
    expect(result?.length).toBe(1);

    // Second call should return cached result without another HTTP request
    let cachedResult: TopRatedFabric[] | undefined;
    service.getFabrics().subscribe((data) => {
      cachedResult = data;
    });
    httpMock.expectNone('assets/mock-data/fabrics/fabrics.json');
    expect(cachedResult).toEqual(mockFabrics);
  });

  it('should return fallback data gracefully on HTTP failure', () => {
    let result: TopRatedFabric[] | undefined;

    service.getFabrics().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/fabrics/fabrics.json');
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    expect(result?.[0].name).toBe('Cotton');
  });

  it('should reset cache on refreshFabrics', () => {
    service.getFabrics().subscribe();
    const req1 = httpMock.expectOne('assets/mock-data/fabrics/fabrics.json');
    req1.flush(mockFabrics);

    service.refreshFabrics().subscribe();
    const req2 = httpMock.expectOne('assets/mock-data/fabrics/fabrics.json');
    req2.flush(mockFabrics);
  });
});
