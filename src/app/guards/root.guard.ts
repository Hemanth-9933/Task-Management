import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RootGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}