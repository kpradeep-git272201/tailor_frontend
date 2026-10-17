import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { FabricListPage } from './fabric-list.page';
import { FabricService } from '../../../../core/services/fabric.service';
import { TopRatedFabric } from '../../../../core/models/home.models';

describe('FabricListPage', () => {
  let component: FabricListPage;
  let fixture: ComponentFixture<FabricListPage>;
  let router: Router;
  let fabricService: FabricService;

  const mockFabrics: TopRatedFabric[] = [
    {
      id: 'fab_cotton',
      name: 'Cotton',
      subtitle: 'Premium Quality',
      material: '100% Pure Organic Cotton',
      rating: 4.9,
      imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
      startingPrice: 499,
    },
    {
      id: 'fab_silk',
      name: 'Silk',
      subtitle: 'Premium Quality',
      material: 'Pure Mulberry Raw Silk',
      rating: 4.8,
      imageUrl: 'assets/images/home/fabric_silk_green.jpg',
      startingPrice: 1299,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabricListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: FabricService,
          useValue: {
            getFabrics: vi.fn().mockReturnValue(of(mockFabrics)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FabricListPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fabricService = TestBed.inject(FabricService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load fabrics on init', () => {
    expect(fabricService.getFabrics).toHaveBeenCalled();
    expect(component.fabrics().length).toBe(2);
    expect(component.filteredFabrics().length).toBe(2);
  });

  it('should filter fabrics by category', () => {
    component.onSelectCategory('silk');
    expect(component.selectedCategory()).toBe('silk');
    expect(component.filteredFabrics().length).toBe(1);
    expect(component.filteredFabrics()[0].name).toBe('Silk');
  });

  it('should filter fabrics by search query', () => {
    const event = { target: { value: 'cotton' } } as unknown as Event;
    component.onSearchInput(event);
    expect(component.filteredFabrics().length).toBe(1);
    expect(component.filteredFabrics()[0].name).toBe('Cotton');
  });

  it('should navigate back to /home on onGoBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onGoBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate on tab selection', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onSelectTab('home');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
