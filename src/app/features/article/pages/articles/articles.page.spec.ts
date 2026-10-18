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
    imagePath: 'assets/images/articles/shirt.jpg',
    imageUrl: 'assets/images/articles/shirt.jpg',
    category: 'shirts',
    startingPrice: 399,
    materials: [
      {
        id: 'cotton',
        name: 'Cotton',
        imagePath: 'assets/images/articles/material_cotton.png',
        imageUrl: 'assets/images/articles/material_cotton.png',
        pricePerMeter: 349,
        isTrending: true,
      },
      {
        id: 'linen',
        name: 'Linen',
        imagePath: 'assets/images/articles/material_linen.png',
        imageUrl: 'assets/images/articles/material_linen.png',
        pricePerMeter: 499,
        isFeatured: true,
      },
    ],
    banner: {
      id: 'promo_shirt',
      title: 'Summer vs Winter on Tailoring Services',
      imagePath: 'assets/images/articles/summer_winter_banner_ref.png',
      imageUrl: 'assets/images/articles/summer_winter_banner_ref.png',
    },
    fabrics: [
      {
        id: 'fab_1',
        name: 'Mint Mandarin Shirt - Back',
        material: 'cotton',
        imagePath: 'assets/images/articles/shirt_back.png',
        imageUrl: 'assets/images/articles/shirt_back.png',
        price: 499,
        pricePerMeter: 499,
        rating: 4.9,
        isTrending: true,
      },
      {
        id: 'fab_2',
        name: 'Mint Mandarin Shirt - Front',
        material: 'cotton',
        imagePath: 'assets/images/articles/shirt_front.png',
        imageUrl: 'assets/images/articles/shirt_front.png',
        price: 499,
        pricePerMeter: 499,
        rating: 4.8,
        isTrending: false,
        tag: 'Popular',
      },
      {
        id: 'fab_3',
        name: 'Linen Classic',
        material: 'linen',
        imagePath: 'assets/images/home/hero_banner_linen.jpg',
        imageUrl: 'assets/images/home/hero_banner_linen.jpg',
        price: 649,
        pricePerMeter: 649,
        rating: 4.8,
        isTrending: false,
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
            queryParamMap: of(convertToParamMap({})),
          },
        },
        {
          provide: ArticleService,
          useValue: {
            getArticleById: vi.fn().mockReturnValue(of(mockArticleDetail)),
            getFabricsByArticleId: vi.fn().mockReturnValue(of(mockArticleDetail.materials)),
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

  it('should handle broken images gracefully with fallback', () => {
    const imgElement = { src: 'broken-image.png' } as HTMLImageElement;
    const errorEvent = { target: imgElement } as unknown as Event;
    component.onImageError(errorEvent, 'assets/images/articles/shirt.jpg');
    expect(imgElement.src).toBe('assets/images/articles/shirt.jpg');
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

  it('should only show visible fabrics in fabricCategory when visibility configuration exists', () => {
    const articleWithVisibility: ArticleDetail = {
      ...mockArticleDetail,
      materials: [
        {
          id: 'cotton',
          fabricId: 'cotton',
          name: 'Cotton',
          isDefault: true,
          isVisible: true,
        },
        {
          id: 'linen',
          fabricId: 'linen',
          name: 'Linen',
          isDefault: false,
          isVisible: false,
        },
      ],
    };
    component.article.set(articleWithVisibility);
    expect(component.fabricCategory().length).toBe(1);
    expect(component.fabricCategory()[0].name).toBe('Cotton');
  });

  it('should filter related fabric categories by fabricId relationship', () => {
    const articleWithFabricIds: ArticleDetail = {
      ...mockArticleDetail,
      fabrics: [
        {
          id: 'fab_1',
          fabricId: 'cotton',
          name: 'Mint Mandarin Shirt - Back',
          material: 'cotton',
          price: 499,
        },
        {
          id: 'fab_2',
          fabricId: 'cotton',
          name: 'Mint Mandarin Shirt - Front',
          material: 'cotton',
          price: 499,
        },
        {
          id: 'fab_3',
          fabricId: 'denim',
          name: 'Royal Blue Fabric',
          material: 'denim',
          price: 499,
        },
      ],
    };
    component.article.set(articleWithFabricIds);
    component.selectedMaterial.set('cotton');

    expect(component.filteredFabrics().length).toBe(2);
    expect(component.filteredFabrics().every((f) => f.fabricId === 'cotton')).toBe(true);

    // Switch to denim
    component.selectedMaterial.set('denim');
    expect(component.filteredFabrics().length).toBe(1);
    expect(component.filteredFabrics()[0].name).toBe('Royal Blue Fabric');
  });

  it('should update route query params when a fabric category is clicked', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const cottonCategory = mockArticleDetail.materials[0];

    component.toggleSelection(cottonCategory);
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { fabric: 'cotton' },
      queryParamsHandling: 'merge',
    });
  });

  it('should handle missing IDs and empty results gracefully', () => {
    component.selectedMaterial.set('non_existent_fabric');
    expect(component.filteredFabrics().length).toBe(0);
  });

  it('should have no fabric selected by default and display unfiltered fabrics on load', () => {
    expect(component.selectedMaterial()).toBeNull();
    expect(component.fabricCategory().every((c) => !c.selected)).toBe(true);
    expect(component.filteredFabrics().length).toBe(3);
  });

  it('should filter categories on Cotton click and restore unfiltered content on deselect', () => {
    const cottonCategory = mockArticleDetail.materials[0];

    // Click Cotton -> selected and filtered
    component.toggleSelection(cottonCategory);
    expect(component.selectedMaterial()).toBe('cotton');
    expect(component.filteredFabrics().length).toBe(2);

    // Deselect Cotton -> selection cleared and unfiltered content restored
    component.toggleSelection(cottonCategory);
    expect(component.selectedMaterial()).toBeNull();
    expect(component.filteredFabrics().length).toBe(3);
  });

  it('should deduplicate fabric thumbnails if duplicates exist in mock data', () => {
    const articleWithDuplicates: ArticleDetail = {
      ...mockArticleDetail,
      materials: [
        { id: 'cotton', name: 'Cotton', isVisible: true },
        { id: 'cotton', name: 'Cotton', isVisible: true },
      ],
    };
    component.articleFabrics.set([]);
    component.article.set(articleWithDuplicates);
    expect(component.fabricCategory().length).toBe(1);
    expect(component.fabricCategory()[0].name).toBe('Cotton');
  });

  it('should call getFabricsByArticleId when loading article and set articleFabrics', () => {
    expect(articleService.getFabricsByArticleId).toHaveBeenCalledWith('art_shirt');
    expect(component.articleFabrics().length).toBe(2);
  });

  it('should scroll materials track right when onScrollMaterialsRight is called', () => {
    const fakeElement = {
      scrollBy: vi.fn(),
    } as unknown as HTMLElement;

    component.onScrollMaterialsRight(fakeElement);
    expect(fakeElement.scrollBy).toHaveBeenCalledWith({ left: 160, behavior: 'smooth' });
  });
});
