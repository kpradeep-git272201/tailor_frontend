import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FabricService } from '../../../../core/services/fabric.service';
import { TopRatedFabric } from '../../../../core/models/home.models';

@Component({
  selector: 'app-fabric-list',
  templateUrl: './fabric-list.page.html',
  styleUrls: ['./fabric-list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
})
export class FabricListPage implements OnInit {
  private readonly router = inject(Router);
  private readonly fabricService = inject(FabricService);

  public readonly fabrics = signal<TopRatedFabric[]>([]);
  public readonly filteredFabrics = signal<TopRatedFabric[]>([]);
  public readonly selectedCategory = signal<string>('all');
  public readonly searchQuery = signal<string>('');
  public readonly isLoading = signal<boolean>(true);

  public readonly categories = [
    { id: 'all', label: 'All Fabrics' },
    { id: 'cotton', label: 'Cotton' },
    { id: 'silk', label: 'Silk' },
    { id: 'linen', label: 'Linen' },
  ];

  public ngOnInit(): void {
    this.loadFabrics();
  }

  public loadFabrics(): void {
    this.isLoading.set(true);
    this.fabricService.getFabrics().subscribe({
      next: (data) => {
        this.fabrics.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.applyFilter();
  }

  public onSelectCategory(catId: string): void {
    this.selectedCategory.set(catId);
    this.applyFilter();
  }

  public applyFilter(): void {
    let result = this.fabrics();
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    if (cat !== 'all') {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(cat) ||
          f.subtitle.toLowerCase().includes(cat) ||
          (f.material && f.material.toLowerCase().includes(cat))
      );
    }

    if (query) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.subtitle.toLowerCase().includes(query) ||
          (f.material && f.material.toLowerCase().includes(query))
      );
    }

    this.filteredFabrics.set(result);
  }

  public onGoBack(): void {
    this.router.navigate(['/home']);
  }

  public onSelectTab(tabId: string): void {
    if (tabId === 'home') {
      this.router.navigate(['/home']);
    } else if (tabId === 'tailors') {
      this.router.navigate(['/tailors']);
    }
  }
}
