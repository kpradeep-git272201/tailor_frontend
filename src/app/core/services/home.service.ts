import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { HomeData } from '../models/home.models';

/**
 * HomeService
 * 
 * Fetches homepage catalog data, promotions, banners, service cards,
 * top-rated fabrics, and top-rated tailors.
 * 
 * ==============================================================================
 * FUTURE SPRING BOOT BACKEND INTEGRATION:
 * ==============================================================================
 * 1. Update `baseUrl` to point to Spring Boot backend (e.g. `/api/v1/home`).
 * 2. In production, replace `this.http.get<HomeData>(this.mockDataUrl)` with:
 *      return this.http.get<HomeData>(`${this.apiUrl}/home/feed`);
 * 3. The data contracts (`HomeData`, `HomeBanner`, etc.) map 1:1 with Spring Boot
 *    DTOs (`HomeFeedResponseDto`), ensuring ZERO UI refactoring.
 * ==============================================================================
 */
@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly mockDataUrl = 'assets/mock-data/home/home-data.json';

  private homeData$?: Observable<HomeData>;

  /**
   * Loads homepage aggregated feed data with in-memory caching.
   */
  public getHomeData(): Observable<HomeData> {
    if (!this.homeData$) {
      this.homeData$ = this.http.get<HomeData>(this.mockDataUrl).pipe(
        catchError((err) => {
          console.error('Failed to load homepage data from mock JSON:', err);
          return of(this.getFallbackHomeData());
        }),
        shareReplay(1)
      );
    }
    return this.homeData$;
  }

  /**
   * Resets cache for pull-to-refresh or location change.
   */
  public refreshHomeData(): Observable<HomeData> {
    this.homeData$ = undefined;
    return this.getHomeData();
  }

  private getFallbackHomeData(): HomeData {
    return {
      location: { city: 'Agra', country: 'India' },
      searchPlaceholder: 'Search for Shirts, Kurta, etc.',
      articles: [
        { id: 'art_shirt', name: 'Shirt', imageUrl: 'assets/images/articles/shirt.jpg', category: 'shirts' },
        { id: 'art_pant', name: 'Pant', imageUrl: 'assets/images/articles/pant.jpg', category: 'pants' },
        { id: 'art_kurta', name: 'Kurta', imageUrl: 'assets/images/articles/kurta.jpg', category: 'kurta' },
        { id: 'art_blouse', name: 'Blouse', imageUrl: 'assets/images/articles/blouse.jpg', category: 'blouse' },
        { id: 'art_suit', name: 'Suit', imageUrl: 'assets/images/articles/suit.jpg', category: 'suit' },
        { id: 'art_sherwani', name: 'Sherwani', imageUrl: 'assets/images/articles/sherwani.jpg', category: 'sherwani' },
      ],
      banners: [
        {
          id: 'b1',
          title: 'Linen Lux - Up to 50% OFF!',
          subtext: 'Festival Special',
          imageUrl: 'assets/images/home/hero_banner_linen.jpg',
          actionRoute: '/fabrics',
          accentColor: '#c59a3f',
        },
      ],
      services: [
        {
          id: 's1',
          badge: 'We provide fabric',
          actionLabel: 'Book now',
          imageUrl: 'assets/images/home/service_with_fabric.jpg',
          theme: 'teal',
          route: '/book-tailor',
        },
        {
          id: 's2',
          badge: 'Bring your own fabric',
          actionLabel: 'Without Fabric',
          imageUrl: 'assets/images/home/service_without_fabric.jpg',
          theme: 'navy',
          route: '/custom-stitching',
        },
      ],
      topRatedFabrics: [
        {
          id: 'f1',
          name: 'Cotton',
          subtitle: 'Premium Quality',
          rating: 4.9,
          imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
        },
        {
          id: 'f2',
          name: 'Silk',
          subtitle: 'Premium Quality',
          rating: 4.8,
          imageUrl: 'assets/images/home/fabric_silk_green.jpg',
        },
      ],
      topRatedTailors: [
        {
          id: 't1',
          name: 'Master Rajesh',
          specialty: 'Suits, Shirts & Kurtas',
          experience: '18+ yrs exp',
          rating: 4.9,
          distance: '1.2 km away',
          imageUrl: 'assets/images/home/tailor_expert_1.jpg',
        },
      ],
    };
  }
}
