import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Email and password are required';
      return;
    }
    if (this.authService.login(this.email, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid email or password';
    }
    
  }
}
