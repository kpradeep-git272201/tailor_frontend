import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TailorListPage } from './tailor-list.page';
import { TailorService } from '../../../../core/services/tailor.service';
import { TopRatedTailor } from '../../../../core/models/home.models';

describe('TailorListPage', () => {
  let component: TailorListPage;
  let fixture: ComponentFixture<TailorListPage>;
  let router: Router;
  let tailorService: TailorService;

  const mockTailors: TopRatedTailor[] = [
    {
      id: 'tailor_rajesh',
      name: 'Master Rajesh',
      specialty: 'Suits, Shirts & Kurtas',
      experience: '18+ yrs exp',
      rating: 4.9,
      distance: '1.2 km away',
      imageUrl: 'assets/images/home/tailor_expert_1.jpg',
      availability: 'Available Today',
    },
    {
      id: 'tailor_ananya',
      name: 'Ananya Boutique',
      specialty: "Women's Ethnic & Blouses",
      experience: '12+ yrs exp',
      rating: 4.8,
      distance: '2.4 km away',
      imageUrl: 'assets/images/home/service_without_fabric.jpg',
      availability: 'Next Slot: Tomorrow',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailorListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: TailorService,
          useValue: {
            getTailors: vi.fn().mockReturnValue(of(mockTailors)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TailorListPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    tailorService = TestBed.inject(TailorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tailors on init', () => {
    expect(tailorService.getTailors).toHaveBeenCalled();
    expect(component.tailors().length).toBe(2);
    expect(component.filteredTailors().length).toBe(2);
  });

  it('should filter tailors by specialty', () => {
    component.onSelectFilter('suits');
    expect(component.selectedFilter()).toBe('suits');
    expect(component.filteredTailors().length).toBe(1);
    expect(component.filteredTailors()[0].name).toBe('Master Rajesh');
  });

  it('should filter tailors by search query', () => {
    const event = { target: { value: 'ananya' } } as unknown as Event;
    component.onSearchInput(event);
    expect(component.filteredTailors().length).toBe(1);
    expect(component.filteredTailors()[0].name).toBe('Ananya Boutique');
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
