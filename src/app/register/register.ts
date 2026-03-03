import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent implements OnInit {

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  strengthText = '';
strengthClass = '';
strengthWidth = 0;

hasMinLength = false;
hasUpperCase = false;
hasNumber = false;
hasSpecialChar = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  checkPasswordStrength() {

  const value = this.password || '';

  this.hasMinLength = value.length >= 8;
  this.hasUpperCase = /[A-Z]/.test(value);
  this.hasNumber = /[0-9]/.test(value);
  this.hasSpecialChar = /[^A-Za-z0-9]/.test(value);

  let score = 0;

  if (this.hasMinLength) score++;
  if (this.hasUpperCase) score++;
  if (this.hasNumber) score++;
  if (this.hasSpecialChar) score++;

  if (score <= 2) {
    this.strengthText = 'Weak';
    this.strengthClass = 'weak';
    this.strengthWidth = 33;
  }
  else if (score === 3) {
    this.strengthText = 'Strong';
    this.strengthClass = 'strong';
    this.strengthWidth = 66;
  }
  else {
    this.strengthText = 'Super Strong';
    this.strengthClass = 'super-strong';
    this.strengthWidth = 100;
  }
}

 register(form: NgForm) {

  if (form.invalid) return;

  if (!this.hasMinLength || !this.hasUpperCase ||
      !this.hasNumber || !this.hasSpecialChar) {
    this.error = 'Password does not meet required conditions.';
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.error = 'Passwords do not match.';
    return;
  }

  const user = {
    username: this.username,
    email: this.email,
    password: this.password
  };

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));

  this.router.navigate(['/login']);
}

  cancel() {
    this.router.navigate(['/login']);
  }

}