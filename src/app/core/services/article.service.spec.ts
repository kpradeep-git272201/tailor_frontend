import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleItem } from '../models/home.models';

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;

  const mockArticles: ArticleItem[] = [
    {
      id: 'art_shirt',
      name: 'Shirt',
      imageUrl: 'assets/images/articles/shirt.jpg',
      category: 'shirts',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticleService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ArticleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch articles and cache the result', () => {
    let result: ArticleItem[] | undefined;

    service.getArticles().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/articles/articles.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockArticles);

    expect(result).toEqual(mockArticles);
    expect(result?.length).toBe(1);

    // Second call should return cached result without another HTTP request
    let cachedResult: ArticleItem[] | undefined;
    service.getArticles().subscribe((data) => {
      cachedResult = data;
    });
    httpMock.expectNone('assets/mock-data/articles/articles.json');
    expect(cachedResult).toEqual(mockArticles);
  });

  it('should return fallback data gracefully on HTTP failure', () => {
    let result: ArticleItem[] | undefined;

    service.getArticles().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    expect(result?.[0].name).toBe('Shirt');
  });

  it('should reset cache on refreshArticles', () => {
    service.getArticles().subscribe();
    const req1 = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req1.flush(mockArticles);

    service.refreshArticles().subscribe();
    const req2 = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req2.flush(mockArticles);
  });
});
