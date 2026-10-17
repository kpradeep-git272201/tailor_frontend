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
  ArticleMaterial,
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

  // Filtered fabrics list based on search and material selection
  public readonly filteredFabrics = computed(() => {
    const art = this.article();
    if (!art || !art.fabrics) return [];

    let list = art.fabrics;
    const materialId = this.selectedMaterial();
    if (materialId) {
      const match = list.filter(
        (f) => f.material?.toLowerCase() === materialId.toLowerCase()
      );
      if (match.length > 0) {
        list = match;
      }
    }

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.material?.toLowerCase().includes(query) ||
          f.tag?.toLowerCase().includes(query)
      );
    }

    return list;
  });

  public ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') || 'art_shirt';
      this.loadArticle(id);
    });
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
  }

  public onGoBack(): void {
    this.router.navigate(['/home']);
  }

  public onSelectMaterial(material: ArticleMaterial): void {
    if (this.selectedMaterial() === material.id) {
      this.selectedMaterial.set(null);
    } else {
      this.selectedMaterial.set(material.id);
    }
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  public onClearSearch(): void {
    this.searchQuery.set('');
  }

  public onSelectFabric(fabric: ArticleFabricItem): void {
    this.router.navigate(['/fabrics']);
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
