import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // On server, allow to render, client will handle redirect
      return true;
    }
  }
}