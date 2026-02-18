import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root-redirect',
  template: '',
  standalone: true
})
export class RootRedirectComponent {
  constructor(private router: Router) {
    this.router.navigate(['/login']);
  }
}