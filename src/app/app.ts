import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { LoadingComponent } from './shared/loading/loading';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, LoadingComponent, CommonModule],
  templateUrl: './app.html'
})
export class App {
  constructor(public authService: AuthService, public loadingService: LoadingService) {}
}
