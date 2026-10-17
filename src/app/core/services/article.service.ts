import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { ArticleItem } from '../models/home.models';

/**
 * ArticleService
 * 
 * Fetches garment article categories (Shirt, Pant, Kurta, Blouse, Suit, Sherwani).
 * Ready for future Spring Boot REST API integration (e.g. GET /api/v1/articles).
 */
@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly mockUrl = 'assets/mock-data/articles/articles.json';

  private articles$?: Observable<ArticleItem[]>;

  public getArticles(): Observable<ArticleItem[]> {
    if (!this.articles$) {
      this.articles$ = this.http.get<ArticleItem[]>(this.mockUrl).pipe(
        catchError((err) => {
          console.error('Failed to load articles from mock JSON:', err);
          return of(this.getFallbackArticles());
        }),
        shareReplay(1)
      );
    }
    return this.articles$;
  }

  public refreshArticles(): Observable<ArticleItem[]> {
    this.articles$ = undefined;
    return this.getArticles();
  }

  private getFallbackArticles(): ArticleItem[] {
    return [
      { id: 'art_shirt', name: 'Shirt', imageUrl: 'assets/images/articles/shirt.jpg', category: 'shirts' },
      { id: 'art_pant', name: 'Pant', imageUrl: 'assets/images/articles/pant.jpg', category: 'pants' },
      { id: 'art_kurta', name: 'Kurta', imageUrl: 'assets/images/articles/kurta.jpg', category: 'kurta' },
      { id: 'art_blouse', name: 'Blouse', imageUrl: 'assets/images/articles/blouse.jpg', category: 'blouse' },
      { id: 'art_suit', name: 'Suit', imageUrl: 'assets/images/articles/suit.jpg', category: 'suit' },
    ];
  }
}
