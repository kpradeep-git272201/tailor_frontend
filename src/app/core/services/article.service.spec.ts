import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import { ArticleItem } from '../models/home.models';
import { ArticleDetail } from '../models/article.models';

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;

  const mockArticles: ArticleDetail[] = [
    {
      id: 'art_shirt',
      name: 'Shirt',
      imageUrl: 'assets/images/articles/shirt.jpg',
      category: 'shirts',
      startingPrice: 399,
      materials: [
        { id: 'cotton', name: 'Cotton', imageUrl: 'assets/images/articles/material_cotton.png' },
      ],
      fabrics: [
        {
          id: 'fab_1',
          name: 'Mint Mandarin Shirt',
          material: 'cotton',
          imageUrl: 'assets/images/articles/shirt_front.png',
        },
      ],
    },
    {
      id: 'art_pant',
      name: 'Pant',
      imageUrl: 'assets/images/articles/pant.jpg',
      category: 'pants',
      startingPrice: 499,
      materials: [],
      fabrics: [],
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

    expect(result).toBeDefined();
    expect(result?.length).toBe(2);
    expect(result?.[0].name).toBe('Shirt');

    // Second call should return cached result without another HTTP request
    let cachedResult: ArticleItem[] | undefined;
    service.getArticles().subscribe((data) => {
      cachedResult = data;
    });
    httpMock.expectNone('assets/mock-data/articles/articles.json');
    expect(cachedResult?.length).toBe(2);
  });

  it('should find article by id, category, or name with getArticleById', () => {
    let article: ArticleDetail | undefined;

    service.getArticleById('art_shirt').subscribe((res) => {
      article = res;
    });

    const req = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req.flush(mockArticles);

    expect(article).toBeDefined();
    expect(article?.id).toBe('art_shirt');
    expect(article?.name).toBe('Shirt');
    expect(article?.materials.length).toBe(1);
  });

  it('should find article by category case-insensitively', () => {
    let article: ArticleDetail | undefined;

    service.getArticleById('PANTS').subscribe((res) => {
      article = res;
    });

    const req = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req.flush(mockArticles);

    expect(article).toBeDefined();
    expect(article?.id).toBe('art_pant');
  });

  it('should fallback gracefully to first article for unknown ID or empty string', () => {
    let article: ArticleDetail | undefined;

    service.getArticleById('unknown_xyz').subscribe((res) => {
      article = res;
    });

    const req = httpMock.expectOne('assets/mock-data/articles/articles.json');
    req.flush(mockArticles);

    expect(article).toBeDefined();
    expect(article?.id).toBe('art_shirt');
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
