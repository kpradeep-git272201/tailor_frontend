import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonThumbnail,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';
import { ArticleService } from '../../../../core/services/article.service';
import {
  ArticleDetail,
  ArticleFabricItem,
  FabricCategoryItem,
} from '../../../../core/models/article.models';

export interface NavTabItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.page.html',
  styleUrls: ['./articles.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonThumbnail,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
  ],
})
export class ArticlesPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  public readonly article = signal<ArticleDetail | null>(null);
  public readonly articleFabrics = signal<FabricCategoryItem[]>([]);
  public readonly selectedMaterial = signal<string | null>(null);
  public readonly searchQuery = signal<string>('');
  public readonly isLoading = signal<boolean>(true);
  public readonly activeTab = signal<string>('home');

  public readonly tabs: NavTabItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'tailors', label: 'Tailors', icon: 'scissors' },
    { id: 'fabric', label: 'Fabric', icon: 'shirt' },
    { id: 'order', label: 'Order', icon: 'book' },
    { id: 'cart', label: 'Cart', icon: 'cart' },
    { id: 'menu', label: 'Menu', icon: 'menu' },
  ];

  constructor() {
    addIcons({ checkmarkCircle, 'checkmark-circle': checkmarkCircle });
  }

  // Fabric categories list conforming to the user's reference code
  // Dynamically loaded from mock JSON with isVisible configuration
  public readonly fabricCategory = computed<FabricCategoryItem[]>(() => {
    const art = this.article();
    const serviceFabrics = this.articleFabrics();
    const list =
      (art?.fabricCategory && art.fabricCategory.length > 0)
        ? art.fabricCategory
        : (art?.materials && art.materials.length > 0)
        ? art.materials
        : serviceFabrics;
    if (!art && serviceFabrics.length === 0) return [];
    const activeId = this.selectedMaterial();

    // Check if mock data defines visibility flags
    const hasVisibilityConfig = list.some((item) => item.isVisible !== undefined);

    let displayList: FabricCategoryItem[];
    if (hasVisibilityConfig) {
      // Filter out non-visible fabrics loaded from mock JSON
      displayList = list.filter((item) => item.isVisible === true);
    } else {
      displayList = list.filter((item) => item.isVisible !== false);
    }

    // Prevent duplicate rendering: deduplicate by fabricId / id / name
    const seen = new Set<string>();
    const uniqueList = displayList.filter((item) => {
      const key = (item.fabricId || item.id || item.name).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueList.map((item) => {
      const itemId = (item.fabricId || item.id).toLowerCase();
      // No default selection on load: only selected if actively clicked/chosen
      const isSelected = activeId ? itemId === activeId.toLowerCase() : false;
      return {
        ...item,
        fabricCategoryName: item.fabricCategoryName || item.name,
        fabricCategoryImagePath:
          item.fabricCategoryImagePath || item.imagePath || item.imageUrl || '',
        selected: isSelected,
      };
    });
  });

  // Filtered fabrics list based on search and fabricId / fabricCategory relationship
  public readonly filteredFabrics = computed<ArticleFabricItem[]>(() => {
    const art = this.article();
    if (!art || !art.fabrics) return [];

    let list = art.fabrics;
    const materialId = this.selectedMaterial();

    // Apply fabric filter ONLY when a fabric thumbnail is actively selected
    if (materialId) {
      const cleanMaterial = materialId.trim().toLowerCase();
      // Filter categories using relationship: fabricId, fabricCategory, or material
      list = list.filter((f) => {
        const itemFabricId = (f.fabricId || f.fabricCategory || f.material || '').toLowerCase();
        return itemFabricId === cleanMaterial;
      });
    }

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.fabricName?.toLowerCase().includes(query) ||
          f.material?.toLowerCase().includes(query) ||
          f.fabricId?.toLowerCase().includes(query) ||
          f.tag?.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Alias for articlesCategories matching reference code
  public get articlesCategories(): ArticleFabricItem[] {
    return this.filteredFabrics();
  }

  public ngOnInit(): void {
    // Listen for article ID parameter
    if (this.route?.paramMap) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id') || 'art_shirt';
        this.loadArticle(id);
      });
    } else {
      this.loadArticle('art_shirt');
    }

    // Listen for route query parameter to sync fabric selection if explicitly passed in URL
    if (this.route?.queryParamMap) {
      this.route.queryParamMap.subscribe((queryParams) => {
        const fabricParam = queryParams.get('fabric');
        if (fabricParam && fabricParam.trim() !== '') {
          this.selectedMaterial.set(fabricParam.trim().toLowerCase());
        }
      });
    }
  }

  public loadArticle(id: string): void {
    this.isLoading.set(true);
    this.articleService.getArticleById(id).subscribe({
      next: (data) => {
        if (data) {
          this.article.set(data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    if (this.articleService && typeof this.articleService.getFabricsByArticleId === 'function') {
      this.articleService.getFabricsByArticleId(id).subscribe({
        next: (fabrics) => {
          this.articleFabrics.set(fabrics || []);
        },
        error: () => {
          this.articleFabrics.set([]);
        },
      });
    }
  }

  public onGoBack(): void {
    this.router.navigate(['/home']);
  }

  public toggleSelection(fabCat: FabricCategoryItem): void {
    const targetId = (fabCat.fabricId || fabCat.id).toLowerCase();
    const current = this.selectedMaterial();

    // Toggle: clicking Cotton selects it; clicking again deselects it and restores unfiltered content
    const newSelection = current && current.toLowerCase() === targetId ? null : targetId;
    this.selectedMaterial.set(newSelection);

    // Pass selected fabric ID via route query parameter
    if (this.router && this.route) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: newSelection ? { fabric: newSelection } : { fabric: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  public onSelectMaterial(material: FabricCategoryItem): void {
    this.toggleSelection(material);
  }

  public onScrollMaterialsRight(trackEl: HTMLElement): void {
    if (trackEl && typeof trackEl.scrollBy === 'function') {
      trackEl.scrollBy({ left: 160, behavior: 'smooth' });
    }
  }

  public selectedFabric(fabric: ArticleFabricItem): void {
    this.router.navigate(['/fabrics']);
  }

  public onSelectFabric(fabric: ArticleFabricItem): void {
    this.selectedFabric(fabric);
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  public onClearSearch(): void {
    this.searchQuery.set('');
  }

  public onImageError(event: Event, fallbackPath: string): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes(fallbackPath)) {
      img.src = fallbackPath;
    }
  }

  public onSelectTab(tabId: string): void {
    this.activeTab.set(tabId);
    if (tabId === 'home') {
      this.router.navigate(['/home']);
    } else if (tabId === 'tailors') {
      this.router.navigate(['/tailors']);
    } else if (tabId === 'fabric') {
      this.router.navigate(['/fabrics']);
    }
  }
}
