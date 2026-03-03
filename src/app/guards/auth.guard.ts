import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

canActivate(): boolean {
  if (isPlatformBrowser(this.platformId)) {
    const user = localStorage.getItem('currentUser');
 
    if (user) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
 
  return true;
}
  }
