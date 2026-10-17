import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { TailorService } from '../../../../core/services/tailor.service';
import { TopRatedTailor } from '../../../../core/models/home.models';

@Component({
  selector: 'app-tailor-list',
  templateUrl: './tailor-list.page.html',
  styleUrls: ['./tailor-list.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
})
export class TailorListPage implements OnInit {
  private readonly router = inject(Router);
  private readonly tailorService = inject(TailorService);

  public readonly tailors = signal<TopRatedTailor[]>([]);
  public readonly filteredTailors = signal<TopRatedTailor[]>([]);
  public readonly selectedFilter = signal<string>('all');
  public readonly searchQuery = signal<string>('');
  public readonly isLoading = signal<boolean>(true);

  public readonly filters = [
    { id: 'all', label: 'All Tailors' },
    { id: 'suits', label: 'Suits & Formal' },
    { id: 'ethnic', label: "Ethnic & Women's" },
    { id: 'express', label: 'Express Available' },
  ];

  public ngOnInit(): void {
    this.loadTailors();
  }

  public loadTailors(): void {
    this.isLoading.set(true);
    this.tailorService.getTailors().subscribe({
      next: (data) => {
        this.tailors.set(data);
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

  public onSelectFilter(filterId: string): void {
    this.selectedFilter.set(filterId);
    this.applyFilter();
  }

  public applyFilter(): void {
    let result = this.tailors();
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.selectedFilter();

    if (filter === 'suits') {
      result = result.filter(
        (t) =>
          t.specialty.toLowerCase().includes('suit') ||
          t.specialty.toLowerCase().includes('tuxedo') ||
          t.specialty.toLowerCase().includes('shirt')
      );
    } else if (filter === 'ethnic') {
      result = result.filter(
        (t) =>
          t.specialty.toLowerCase().includes('ethnic') ||
          t.specialty.toLowerCase().includes('blouse') ||
          t.specialty.toLowerCase().includes('kurta')
      );
    } else if (filter === 'express') {
      result = result.filter((t) =>
        t.availability?.toLowerCase().includes('today')
      );
    }

    if (query) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query) ||
          (t.location && t.location.toLowerCase().includes(query))
      );
    }

    this.filteredTailors.set(result);
  }

  public onGoBack(): void {
    this.router.navigate(['/home']);
  }

  public onSelectTab(tabId: string): void {
    if (tabId === 'home') {
      this.router.navigate(['/home']);
    } else if (tabId === 'fabric') {
      this.router.navigate(['/fabrics']);
    }
  }
}
