import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';
import { ArticleItem } from '../models/home.models';
import { ArticleDetail, ArticleMaterial, FabricCategoryItem } from '../models/article.models';

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
            a.articleId?.toLowerCase() === cleanId ||
            a.category?.toLowerCase() === cleanId ||
            a.name.toLowerCase() === cleanId
        );
        // Fallback to the first article if an unknown ID is provided
        return found || list[0];
      })
    );
  }

  /**
   * Fetches only the associated fabric thumbnails for an article by its ID.
   * Maps articleId -> fabricIds and retrieves master fabric records from fabric.json.
   * Gracefully handles empty or invalid IDs by returning an empty list.
   */
  public getFabricsByArticleId(articleId: string): Observable<FabricCategoryItem[]> {
    if (!articleId || articleId.trim() === '') {
      return of([]);
    }

    const cleanId = articleId.trim().toLowerCase();
    return forkJoin({
      articles: this.getAllArticleDetails(),
      masterFabrics: this.getFabricCategories(),
    }).pipe(
      map(({ articles, masterFabrics }) => {
        const article = articles.find(
          (a) =>
            a.id.toLowerCase() === cleanId ||
            a.articleId?.toLowerCase() === cleanId ||
            a.category?.toLowerCase() === cleanId ||
            a.name.toLowerCase() === cleanId
        );

        if (!article) {
          return [];
        }

        const fabricIds = article.fabricIds;
        if (fabricIds && Array.isArray(fabricIds) && fabricIds.length > 0) {
          const fabricMap = new Map(
            masterFabrics.map((f) => [(f.fabricId || f.id).toLowerCase(), f])
          );
          return fabricIds
            .map((fid) => fabricMap.get(fid.toLowerCase()))
            .filter((f): f is FabricCategoryItem => !!f);
        }

        return article.fabricCategory || article.materials || [];
      }),
      catchError((err) => {
        console.error('Failed to get fabrics for article:', err);
        return of([]);
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
      { id: 'cotton', fabricId: 'cotton', name: 'Cotton', fabricCategoryName: 'Cotton', imagePath: 'assets/images/articles/cotton-fabric.png', imageUrl: 'assets/images/articles/cotton-fabric.png', pricePerMeter: 349, isTrending: true, isDefault: false, isVisible: true },
      { id: 'linen', fabricId: 'linen', name: 'Linen', fabricCategoryName: 'Linen', imagePath: 'assets/images/articles/linen-fabric.png', imageUrl: 'assets/images/articles/linen-fabric.png', pricePerMeter: 499, isFeatured: true, isDefault: false, isVisible: true },
      { id: 'silk', fabricId: 'silk', name: 'Silk', fabricCategoryName: 'Silk', imagePath: 'assets/images/articles/slik-fabric.png', imageUrl: 'assets/images/articles/slik-fabric.png', pricePerMeter: 899, isFeatured: true, isDefault: false, isVisible: true },
      { id: 'wool', fabricId: 'wool', name: 'Wool', fabricCategoryName: 'Wool', imagePath: 'assets/images/articles/wool-fabric.png', imageUrl: 'assets/images/articles/wool-fabric.png', pricePerMeter: 699, isFeatured: true, isDefault: false, isVisible: true },
      { id: 'polyester', fabricId: 'polyester', name: 'Polyester', fabricCategoryName: 'Polyester', imagePath: 'assets/images/articles/polyester-fabric.png', imageUrl: 'assets/images/articles/polyester-fabric.png', pricePerMeter: 299, isTrending: false, isDefault: false, isVisible: true },
      { id: 'denim', fabricId: 'denim', name: 'Denim', fabricCategoryName: 'Denim', imagePath: 'assets/images/articles/material_denim.png', imageUrl: 'assets/images/articles/material_denim.png', pricePerMeter: 449, isTrending: false, isDefault: false, isVisible: true },
    ];
  }

  private getFallbackArticles(): ArticleDetail[] {
    return [
      {
        id: 'art_shirt',
        articleId: 'art_shirt',
        name: 'Shirt',
        imagePath: 'assets/images/articles/shirt.jpg',
        imageUrl: 'assets/images/articles/shirt.jpg',
        category: 'shirts',
        startingPrice: 399,
        fabricIds: ['cotton', 'linen', 'silk', 'wool', 'polyester', 'denim'],
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
            fabricId: 'cotton',
            name: 'Mint Mandarin Shirt',
            material: 'cotton',
            fabricCategory: 'cotton',
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
            fabricId: 'cotton',
            name: 'Mint Mandarin Shirt',
            material: 'cotton',
            fabricCategory: 'cotton',
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
            fabricId: 'denim',
            name: 'Classic Indigo Denim',
            material: 'denim',
            fabricCategory: 'denim',
            imagePath: 'assets/images/articles/fabric_blue_cloth.png',
            imageUrl: 'assets/images/articles/fabric_blue_cloth.png',
            price: 499,
            pricePerMeter: 499,
            rating: 4.8,
            isTrending: false,
            isFeatured: false,
          },
          {
            id: 'fab_shirt_cotton_blue',
            fabricId: 'linen',
            name: 'Oxford Blue Cotton',
            material: 'linen',
            fabricCategory: 'linen',
            imagePath: 'assets/images/home/fabric_cotton_blue.jpg',
            imageUrl: 'assets/images/home/fabric_cotton_blue.jpg',
            price: 549,
            pricePerMeter: 549,
            rating: 4.7,
            isTrending: false,
            isFeatured: false,
          },
          {
            id: 'fab_shirt_silk_ivory',
            fabricId: 'silk',
            name: 'Ivory Silk Shirt',
            material: 'silk',
            fabricCategory: 'silk',
            imagePath: 'assets/images/articles/slik-fabric.png',
            imageUrl: 'assets/images/articles/slik-fabric.png',
            price: 899,
            pricePerMeter: 899,
            rating: 4.9,
            isTrending: true,
            isFeatured: false,
          },
          {
            id: 'fab_shirt_wool_grey',
            fabricId: 'wool',
            name: 'Heather Grey Wool Shirt',
            material: 'wool',
            fabricCategory: 'wool',
            imagePath: 'assets/images/articles/wool-fabric.png',
            imageUrl: 'assets/images/articles/wool-fabric.png',
            price: 799,
            pricePerMeter: 799,
            rating: 4.8,
            isTrending: false,
            isFeatured: true,
          },
          {
            id: 'fab_shirt_polyester_blue',
            fabricId: 'polyester',
            name: 'Navy Performance Poly Shirt',
            material: 'polyester',
            fabricCategory: 'polyester',
            imagePath: 'assets/images/articles/polyester-fabric.png',
            imageUrl: 'assets/images/articles/polyester-fabric.png',
            price: 599,
            pricePerMeter: 599,
            rating: 4.8,
            isTrending: false,
            isFeatured: false,
          },
        ],
      },
      {
        id: 'art_pant',
        articleId: 'art_pant',
        name: 'Pant',
        imagePath: 'assets/images/articles/pant.jpg',
        imageUrl: 'assets/images/articles/pant.jpg',
        category: 'pants',
        startingPrice: 499,
        fabricIds: ['cotton', 'linen', 'wool', 'denim', 'polyester'],
        materials: [
          { id: 'cotton', name: 'Cotton', imagePath: 'assets/images/articles/cotton-fabric.png', imageUrl: 'assets/images/articles/cotton-fabric.png' },
          { id: 'linen', name: 'Linen', imagePath: 'assets/images/articles/linen-fabric.png', imageUrl: 'assets/images/articles/linen-fabric.png' },
          { id: 'wool', name: 'Wool', imagePath: 'assets/images/articles/wool-fabric.png', imageUrl: 'assets/images/articles/wool-fabric.png' },
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
        articleId: 'art_kurta',
        name: 'Kurta',
        imagePath: 'assets/images/articles/kurta.jpg',
        imageUrl: 'assets/images/articles/kurta.jpg',
        category: 'kurta',
        startingPrice: 599,
        fabricIds: ['cotton', 'silk', 'linen'],
        materials: [
          { id: 'cotton', name: 'Cotton', imagePath: 'assets/images/articles/cotton-fabric.png', imageUrl: 'assets/images/articles/cotton-fabric.png' },
          { id: 'silk', name: 'Silk', imagePath: 'assets/images/articles/slik-fabric.png', imageUrl: 'assets/images/articles/slik-fabric.png' },
        ],
        fabrics: [],
      },
      {
        id: 'art_blouse',
        articleId: 'art_blouse',
        name: 'Blouse',
        imagePath: 'assets/images/articles/blouse.jpg',
        imageUrl: 'assets/images/articles/blouse.jpg',
        category: 'blouse',
        startingPrice: 699,
        fabricIds: ['silk', 'cotton', 'polyester'],
        materials: [
          { id: 'silk', name: 'Silk', imagePath: 'assets/images/articles/slik-fabric.png', imageUrl: 'assets/images/articles/slik-fabric.png' },
        ],
        fabrics: [],
      },
      {
        id: 'art_suit',
        articleId: 'art_suit',
        name: 'Suit',
        imagePath: 'assets/images/articles/suit.jpg',
        imageUrl: 'assets/images/articles/suit.jpg',
        category: 'suit',
        startingPrice: 2499,
        fabricIds: ['wool', 'linen', 'silk'],
        materials: [
          { id: 'wool', name: 'Wool', imagePath: 'assets/images/articles/wool-fabric.png', imageUrl: 'assets/images/articles/wool-fabric.png' },
        ],
        fabrics: [],
      },
    ];
  }
}
