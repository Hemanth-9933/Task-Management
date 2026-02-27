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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  register(form: NgForm) {

    if (form.invalid) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      return;
    }

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
    });

    this.router.navigate(['/login']);
  }

  cancel() {
    this.router.navigate(['/login']);
  }

}