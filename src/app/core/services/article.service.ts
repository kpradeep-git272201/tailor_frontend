import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { ArticleItem } from '../models/home.models';
import { ArticleDetail, ArticleMaterial } from '../models/article.models';

/**
 * ArticleService
 * 
 * Fetches garment article categories, material libraries, and detailed catalog data.
 * Ready for future Spring Boot REST API integration (e.g. GET /api/v1/articles/:id).
 */
@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly mockUrl = 'assets/mock-data/articles/articles.json';
  private readonly fabricMockUrl = 'assets/mock-data/fabric/fabric.json';

  private articles$?: Observable<ArticleDetail[]>;
  private materials$?: Observable<ArticleMaterial[]>;

  public getArticles(): Observable<ArticleItem[]> {
    return this.getAllArticleDetails().pipe(
      map((details) =>
        details.map((d) => ({
          id: d.id,
          name: d.name,
          imageUrl: d.imagePath || d.imageUrl || '',
          category: d.category,
          startingPrice: d.startingPrice,
        }))
      )
    );
  }

  public getArticleById(id: string): Observable<ArticleDetail | undefined> {
    if (!id || id.trim() === '') {
      return this.getAllArticleDetails().pipe(map((list) => list[0]));
    }

    const cleanId = id.trim().toLowerCase();
    return this.getAllArticleDetails().pipe(
      map((list) => {
        const found = list.find(
          (a) =>
            a.id.toLowerCase() === cleanId ||
            a.category?.toLowerCase() === cleanId ||
            a.name.toLowerCase() === cleanId
        );
        // Fallback to the first article if an unknown ID is provided
        return found || list[0];
      })
    );
  }

  public getAllArticleDetails(): Observable<ArticleDetail[]> {
    if (!this.articles$) {
      this.articles$ = this.http.get<ArticleDetail[]>(this.mockUrl).pipe(
        catchError((err) => {
          console.error('Failed to load articles from mock JSON:', err);
          return of(this.getFallbackArticles());
        }),
        shareReplay(1)
      );
    }
    return this.articles$;
  }

  public getFabricCategories(): Observable<ArticleMaterial[]> {
    if (!this.materials$) {
      this.materials$ = this.http.get<ArticleMaterial[]>(this.fabricMockUrl).pipe(
        catchError((err) => {
          console.error('Failed to load fabrics from mock JSON:', err);
          return of(this.getFallbackMaterials());
        }),
        shareReplay(1)
      );
    }
    return this.materials$;
  }

  public getMaterials(): Observable<ArticleMaterial[]> {
    return this.getFabricCategories();
  }

  public refreshArticles(): Observable<ArticleItem[]> {
    this.articles$ = undefined;
    this.materials$ = undefined;
    return this.getArticles();
  }

  private getFallbackMaterials(): ArticleMaterial[] {
    return [
      { id: 'cotton', name: 'Cotton', imagePath: 'assets/images/articles/material_cotton.png', imageUrl: 'assets/images/articles/material_cotton.png', pricePerMeter: 349, isTrending: true },
      { id: 'linen', name: 'Linen', imagePath: 'assets/images/articles/material_linen.png', imageUrl: 'assets/images/articles/material_linen.png', pricePerMeter: 499, isFeatured: true },
      { id: 'silk', name: 'Silk', imagePath: 'assets/images/articles/material_silk.png', imageUrl: 'assets/images/articles/material_silk.png', pricePerMeter: 899, isFeatured: true },
      { id: 'denim', name: 'Denim', imagePath: 'assets/images/articles/material_denim.png', imageUrl: 'assets/images/articles/material_denim.png', pricePerMeter: 449, isTrending: false },
      { id: 'polycotton', name: 'Poly Cotton', imagePath: 'assets/images/articles/material_polycotton.png', imageUrl: 'assets/images/articles/material_polycotton.png', pricePerMeter: 299, isTrending: false },
    ];
  }

  private getFallbackArticles(): ArticleDetail[] {
    return [
      {
        id: 'art_shirt',
        name: 'Shirt',
        imagePath: 'assets/images/articles/shirt.jpg',
        imageUrl: 'assets/images/articles/shirt.jpg',
        category: 'shirts',
        startingPrice: 399,
        materials: this.getFallbackMaterials(),
        banner: {
          id: 'promo_shirt_summer_winter',
          title: 'Summer vs Winter on Tailoring Services',
          subtext: 'Tailored perfection in 48 hours',
          imagePath: 'assets/images/articles/summer_winter_banner_ref.png',
          imageUrl: 'assets/images/articles/summer_winter_banner_ref.png',
        },
        fabrics: [
          {
            id: 'fab_shirt_mint_back',
            name: 'Mint Mandarin Shirt',
            material: 'cotton',
            imagePath: 'assets/images/articles/shirt_back.png',
            imageUrl: 'assets/images/articles/shirt_back.png',
            price: 499,
            pricePerMeter: 499,
            rating: 4.9,
            isTrending: true,
            isFeatured: false,
          },
          {
            id: 'fab_shirt_mint_front',
            name: 'Mint Mandarin Shirt',
            material: 'cotton',
            imagePath: 'assets/images/articles/shirt_front.png',
            imageUrl: 'assets/images/articles/shirt_front.png',
            price: 499,
            pricePerMeter: 499,
            rating: 4.8,
            isTrending: false,
            isFeatured: true,
            tag: 'Popular',
          },
          {
            id: 'fab_shirt_blue_cloth',
            name: 'Classic Indigo Cotton',
            material: 'cotton',
            imagePath: 'assets/images/articles/fabric_blue_cloth.png',
            imageUrl: 'assets/images/articles/fabric_blue_cloth.png',
            price: 499,
            pricePerMeter: 499,
            rating: 4.8,
            isTrending: false,
            isFeatured: false,
          },
        ],
      },
      {
        id: 'art_pant',
        name: 'Pant',
        imagePath: 'assets/images/articles/pant.jpg',
        imageUrl: 'assets/images/articles/pant.jpg',
        category: 'pants',
        startingPrice: 499,
        materials: [
          { id: 'cotton', name: 'Cotton', imagePath: 'assets/images/articles/material_cotton.png', imageUrl: 'assets/images/articles/material_cotton.png' },
          { id: 'linen', name: 'Linen', imagePath: 'assets/images/articles/material_linen.png', imageUrl: 'assets/images/articles/material_linen.png' },
        ],
        fabrics: [
          {
            id: 'fab_pant_1',
            name: 'Custom Tailored Slim Chino',
            material: 'cotton',
            imagePath: 'assets/images/articles/pant.jpg',
            imageUrl: 'assets/images/articles/pant.jpg',
            price: 599,
            pricePerMeter: 599,
            rating: 4.9,
          },
        ],
      },
      {
        id: 'art_kurta',
        name: 'Kurta',
        imagePath: 'assets/images/articles/kurta.jpg',
        imageUrl: 'assets/images/articles/kurta.jpg',
        category: 'kurta',
        startingPrice: 599,
        materials: [
          { id: 'cotton', name: 'Cotton', imagePath: 'assets/images/articles/material_cotton.png', imageUrl: 'assets/images/articles/material_cotton.png' },
          { id: 'silk', name: 'Silk', imagePath: 'assets/images/articles/material_silk.png', imageUrl: 'assets/images/articles/material_silk.png' },
        ],
        fabrics: [],
      },
      {
        id: 'art_blouse',
        name: 'Blouse',
        imagePath: 'assets/images/articles/blouse.jpg',
        imageUrl: 'assets/images/articles/blouse.jpg',
        category: 'blouse',
        startingPrice: 699,
        materials: [
          { id: 'silk', name: 'Silk', imagePath: 'assets/images/articles/material_silk.png', imageUrl: 'assets/images/articles/material_silk.png' },
        ],
        fabrics: [],
      },
      {
        id: 'art_suit',
        name: 'Suit',
        imagePath: 'assets/images/articles/suit.jpg',
        imageUrl: 'assets/images/articles/suit.jpg',
        category: 'suit',
        startingPrice: 2499,
        materials: [
          { id: 'linen', name: 'Linen', imagePath: 'assets/images/articles/material_linen.png', imageUrl: 'assets/images/articles/material_linen.png' },
        ],
        fabrics: [],
      },
    ];
  }
}
