import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
  ],
})
export class HomePage {
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  public readonly currentUser = this.authService.currentUser;

  public onSignOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public onGoToLogin(): void {
    this.router.navigate(['/login']);
  }
}
