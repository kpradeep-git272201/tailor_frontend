import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ArticlesPage } from './articles.page';
import { ArticleService } from '../../../../core/services/article.service';
import { ArticleDetail } from '../../../../core/models/article.models';

describe('ArticlesPage', () => {
  let component: ArticlesPage;
  let fixture: ComponentFixture<ArticlesPage>;
  let router: Router;
  let articleService: ArticleService;

  const mockArticleDetail: ArticleDetail = {
    id: 'art_shirt',
    name: 'Shirt',
    imageUrl: 'assets/images/articles/shirt.jpg',
    category: 'shirts',
    startingPrice: 399,
    materials: [
      { id: 'cotton', name: 'Cotton', imageUrl: 'assets/images/articles/material_cotton.png' },
      { id: 'linen', name: 'Linen', imageUrl: 'assets/images/articles/material_linen.png' },
    ],
    banner: {
      id: 'promo_shirt',
      title: 'Summer vs Winter on Tailoring Services',
      imageUrl: 'assets/images/articles/summer_winter_banner_ref.png',
    },
    fabrics: [
      {
        id: 'fab_1',
        name: 'Mint Mandarin Shirt - Back',
        material: 'cotton',
        imageUrl: 'assets/images/articles/shirt_back.png',
        price: 499,
        rating: 4.9,
      },
      {
        id: 'fab_2',
        name: 'Mint Mandarin Shirt - Front',
        material: 'cotton',
        imageUrl: 'assets/images/articles/shirt_front.png',
        price: 499,
        rating: 4.8,
      },
      {
        id: 'fab_3',
        name: 'Linen Classic',
        material: 'linen',
        imageUrl: 'assets/images/home/hero_banner_linen.jpg',
        price: 649,
        rating: 4.8,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'art_shirt' })),
          },
        },
        {
          provide: ArticleService,
          useValue: {
            getArticleById: vi.fn().mockReturnValue(of(mockArticleDetail)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    articleService = TestBed.inject(ArticleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load article details on init', () => {
    expect(articleService.getArticleById).toHaveBeenCalledWith('art_shirt');
    expect(component.article()).toEqual(mockArticleDetail);
    expect(component.filteredFabrics().length).toBe(3);
  });

  it('should filter fabrics when a material is selected', () => {
    const cottonMaterial = mockArticleDetail.materials[0];
    component.onSelectMaterial(cottonMaterial);
    expect(component.selectedMaterial()).toBe('cotton');
    expect(component.filteredFabrics().length).toBe(2);
    expect(component.filteredFabrics()[0].material).toBe('cotton');

    // Clicking again should toggle selection off
    component.onSelectMaterial(cottonMaterial);
    expect(component.selectedMaterial()).toBeNull();
    expect(component.filteredFabrics().length).toBe(3);
  });

  it('should filter fabrics by search query', () => {
    const event = { target: { value: 'Linen' } } as unknown as Event;
    component.onSearchInput(event);
    expect(component.searchQuery()).toBe('Linen');
    expect(component.filteredFabrics().length).toBe(1);
    expect(component.filteredFabrics()[0].name).toBe('Linen Classic');

    component.onClearSearch();
    expect(component.searchQuery()).toBe('');
    expect(component.filteredFabrics().length).toBe(3);
  });

  it('should navigate back to /home on onGoBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onGoBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to /fabrics on onSelectFabric', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fabric = mockArticleDetail.fabrics[0];
    component.onSelectFabric(fabric);
    expect(navigateSpy).toHaveBeenCalledWith(['/fabrics']);
  });

  it('should navigate when bottom navigation tab is selected', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onSelectTab('home');
    expect(component.activeTab()).toBe('home');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);

    component.onSelectTab('tailors');
    expect(component.activeTab()).toBe('tailors');
    expect(navigateSpy).toHaveBeenCalledWith(['/tailors']);

    component.onSelectTab('fabric');
    expect(component.activeTab()).toBe('fabric');
    expect(navigateSpy).toHaveBeenCalledWith(['/fabrics']);
  });
});
