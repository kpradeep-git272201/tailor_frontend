import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { TopRatedTailor } from '../models/home.models';

/**
 * TailorService
 * 
 * Manages the tailor directory, ratings, specialties, and geo-distance.
 * Ready for future Spring Boot integration via REST endpoint e.g. GET /api/v1/tailors.
 */
@Injectable({
  providedIn: 'root',
})
export class TailorService {
  private readonly http = inject(HttpClient);
  private readonly mockUrl = 'assets/mock-data/tailors/tailors.json';

  private tailors$?: Observable<TopRatedTailor[]>;

  public getTailors(): Observable<TopRatedTailor[]> {
    if (!this.tailors$) {
      this.tailors$ = this.http.get<TopRatedTailor[]>(this.mockUrl).pipe(
        catchError((err) => {
          console.error('Failed to load tailors from mock JSON:', err);
          return of(this.getFallbackTailors());
        }),
        shareReplay(1)
      );
    }
    return this.tailors$;
  }

  public refreshTailors(): Observable<TopRatedTailor[]> {
    this.tailors$ = undefined;
    return this.getTailors();
  }

  private getFallbackTailors(): TopRatedTailor[] {
    return [
      {
        id: 'tailor_rajesh',
        name: 'Master Rajesh',
        specialty: 'Suits, Shirts & Kurtas',
        experience: '18+ yrs exp',
        rating: 4.9,
        distance: '1.2 km away',
        location: 'Tajganj, Agra',
        imageUrl: 'assets/images/home/tailor_expert_1.jpg',
        availability: 'Available Today',
        badge: 'Top Rated',
      },
      {
        id: 'tailor_ananya',
        name: 'Ananya Boutique',
        specialty: "Women's Ethnic & Blouses",
        experience: '12+ yrs exp',
        rating: 4.8,
        distance: '2.4 km away',
        location: 'Sanjay Place, Agra',
        imageUrl: 'assets/images/home/service_without_fabric.jpg',
        availability: 'Next Slot: Tomorrow',
        badge: 'Designer Studio',
      },
    ];
  }
}
