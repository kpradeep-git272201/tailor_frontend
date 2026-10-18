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
  // Dynamically loaded from mock JSON with isVisible / isDefault configuration
  public readonly fabricCategory = computed<FabricCategoryItem[]>(() => {
    const art = this.article();
    if (!art) return [];
    const list = art.fabricCategory || art.materials || [];
    const activeId = this.selectedMaterial();

    // Check if mock data defines visibility flags
    const hasVisibilityConfig = list.some((item) => item.isVisible !== undefined);

    let displayList: FabricCategoryItem[];
    if (hasVisibilityConfig) {
      // Filter out non-visible fabrics (Linen, Silk, Denim, Poly-Cotton) loaded from mock JSON
      displayList = list.filter(
        (item) => item.isVisible === true || (item.isVisible === undefined && item.isDefault === true)
      );
    } else {
      displayList = list.filter((item) => item.isVisible !== false);
    }

    return displayList.map((item) => {
      const itemId = (item.fabricId || item.id).toLowerCase();
      const isSelected = activeId
        ? itemId === activeId.toLowerCase()
        : !!item.isDefault;
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

    // Listen for route query parameter to sync fabric selection
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
          // If no fabric queryParam was set, default to the default/visible fabric from mock JSON
          if (!this.selectedMaterial()) {
            const list = data.fabricCategory || data.materials || [];
            const defaultFab = list.find((m) => m.isDefault);
            if (defaultFab) {
              this.selectedMaterial.set((defaultFab.fabricId || defaultFab.id).toLowerCase());
            }
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public onGoBack(): void {
    this.router.navigate(['/home']);
  }

  public toggleSelection(fabCat: FabricCategoryItem): void {
    const targetId = (fabCat.fabricId || fabCat.id).toLowerCase();
    const current = this.selectedMaterial();
    const newSelection = current && current.toLowerCase() === targetId ? null : targetId;
    this.selectedMaterial.set(newSelection);

    // Pass selected fabric ID via route query parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newSelection ? { fabric: newSelection } : { fabric: null },
      queryParamsHandling: 'merge',
    });
  }

  public onSelectMaterial(material: FabricCategoryItem): void {
    this.toggleSelection(material);
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
