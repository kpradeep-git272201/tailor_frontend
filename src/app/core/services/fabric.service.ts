import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { TopRatedFabric } from '../models/home.models';

/**
 * FabricService
 * 
 * Manages the fabric catalog, search, and category filtering.
 * Ready for future Spring Boot integration via REST endpoint e.g. GET /api/v1/fabrics.
 */
@Injectable({
  providedIn: 'root',
})
export class FabricService {
  private readonly http = inject(HttpClient);
  private readonly mockUrl = 'assets/mock-data/fabrics/fabrics.json';

  private fabrics$?: Observable<TopRatedFabric[]>;

  public getFabrics(): Observable<TopRatedFabric[]> {
    if (!this.fabrics$) {
      this.fabrics$ = this.http.get<TopRatedFabric[]>(this.mockUrl).pipe(
        catchError((err) => {
          console.error('Failed to load fabrics from mock JSON:', err);
          return of(this.getFallbackFabrics());
        }),
        shareReplay(1)
      );
    }
    return this.fabrics$;
  }

  public refreshFabrics(): Observable<TopRatedFabric[]> {
    this.fabrics$ = undefined;
    return this.getFabrics();
  }

  private getFallbackFabrics(): TopRatedFabric[] {
    return [
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
  }
}
