import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgetpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgetpassword.html',
  styleUrl: './forgetpassword.scss'
})
export class Forgetpassword implements OnInit {
  email = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';

  constructor(@Inject(Router) private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === this.email);

    if (userIndex === -1) {
      this.error = 'User not found';
      return;
    }

    users[userIndex].password = this.newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    this.success = 'Password updated successfully';
    this.error = '';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
