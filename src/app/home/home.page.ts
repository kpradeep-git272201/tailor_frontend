import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { HomeService } from '../core/services/home.service';
import { ArticleService } from '../core/services/article.service';
import {
  ArticleItem,
  HomeBanner,
  HomeData,
  HomeServiceCard,
  TopRatedFabric,
  TopRatedTailor,
} from '../core/models/home.models';

export interface NavTabItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
})
export class HomePage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeService);
  private readonly articleService = inject(ArticleService);

  public readonly currentUser = this.authService.currentUser;

  public readonly homeData = signal<HomeData | null>(null);
  public readonly articles = signal<ArticleItem[]>([]);
  public readonly selectedArticle = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(true);
  public readonly activeBannerIndex = signal<number>(0);
  public readonly activeTab = signal<string>('home');
  public readonly searchQuery = signal<string>('');
  public readonly isProfileMenuOpen = signal<boolean>(false);

  // Swipe & Autoplay state
  private touchStartX = 0;
  private touchDeltaX = 0;
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_INTERVAL_MS = 4500;

  public readonly tabs: NavTabItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'tailors', label: 'Tailors', icon: 'scissors' },
    { id: 'fabric', label: 'Fabric', icon: 'shirt' },
    { id: 'order', label: 'Order', icon: 'book' },
    { id: 'cart', label: 'Cart', icon: 'cart' },
    { id: 'menu', label: 'Menu', icon: 'menu' },
  ];

  public ngOnInit(): void {
    this.loadHomeData();
  }

  public ngOnDestroy(): void {
    this.stopAutoplay();
  }

  public loadHomeData(): void {
    this.isLoading.set(true);
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData.set(data);
        if (data.articles && data.articles.length > 0) {
          this.articles.set(data.articles);
        }
        this.isLoading.set(false);
        this.startAutoplay();
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    this.articleService.getArticles().subscribe({
      next: (art) => {
        if (art && art.length > 0) {
          this.articles.set(art);
        }
      },
    });
  }

  public onSelectArticle(article: ArticleItem): void {
    this.selectedArticle.set(article.id);
    this.router.navigate(['/articles', article.id]);
  }

  // Banner slider & swipe handlers
  public startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.nextBanner();
    }, this.AUTOPLAY_INTERVAL_MS);
  }

  public stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  public nextBanner(): void {
    const banners = this.homeData()?.banners;
    if (!banners || banners.length <= 1) return;
    const nextIdx = (this.activeBannerIndex() + 1) % banners.length;
    this.activeBannerIndex.set(nextIdx);
  }

  public prevBanner(): void {
    const banners = this.homeData()?.banners;
    if (!banners || banners.length <= 1) return;
    const prevIdx =
      (this.activeBannerIndex() - 1 + banners.length) % banners.length;
    this.activeBannerIndex.set(prevIdx);
  }

  public setActiveBanner(index: number): void {
    this.activeBannerIndex.set(index);
    this.startAutoplay(); // Reset autoplay timer on manual dot click
  }

  public onTouchStart(event: TouchEvent): void {
    this.stopAutoplay();
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  }

  public onTouchMove(event: TouchEvent): void {
    const currentX = event.touches[0].clientX;
    this.touchDeltaX = currentX - this.touchStartX;
  }

  public onTouchEnd(): void {
    const threshold = 40; // min swipe distance in px
    if (this.touchDeltaX < -threshold) {
      this.nextBanner();
    } else if (this.touchDeltaX > threshold) {
      this.prevBanner();
    }
    this.startAutoplay();
  }

  public onBannerMouseEnter(): void {
    this.stopAutoplay();
  }

  public onBannerMouseLeave(): void {
    this.startAutoplay();
  }

  // Navigation handlers
  public onViewMoreFabrics(): void {
    this.router.navigate(['/fabrics']);
  }

  public onViewMoreTailors(): void {
    this.router.navigate(['/tailors']);
  }

  public onSelectTab(tabId: string): void {
    this.activeTab.set(tabId);
    if (tabId === 'tailors') {
      this.router.navigate(['/tailors']);
    } else if (tabId === 'fabric') {
      this.router.navigate(['/fabrics']);
    } else if (tabId === 'menu') {
      this.toggleProfileMenu();
    }
  }

  public onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  public onClearSearch(): void {
    this.searchQuery.set('');
  }

  public onSelectBanner(banner: HomeBanner): void {
    if (banner.actionRoute) {
      this.router.navigate([banner.actionRoute]).catch(() => {
        // Fallback for mock routes
      });
    }
  }

  public onSelectService(service: HomeServiceCard): void {
    if (service.route) {
      this.router.navigate([service.route]).catch(() => {
        // Fallback for mock routes
      });
    }
  }

  public onSelectFabric(fabric: TopRatedFabric): void {
    this.router.navigate(['/fabrics']);
  }

  public onSelectTailor(tailor: TopRatedTailor): void {
    this.router.navigate(['/tailors']);
  }

  public toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((v) => !v);
  }

  public closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  public onSignOut(): void {
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public onGoToLogin(): void {
    this.closeProfileMenu();
    this.router.navigate(['/login']);
  }
}
