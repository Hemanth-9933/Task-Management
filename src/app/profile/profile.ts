import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {

  user: any;
  isEditing = false;
  editedUser = { username: '', email: '' };
  selectedFile: File | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.editedUser = { username: this.user.username, email: this.user.email };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert('File size must be less than 2MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, GIF allowed');
        return;
      }
      this.selectedFile = file;
    }
  }

  saveChanges() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.user.profilePhoto = reader.result as string;
        this.updateUser();
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.updateUser();
    }
  }

  updateUser() {
    this.user.username = this.editedUser.username;
    this.user.email = this.editedUser.email;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === this.user.email);
    if (index !== -1) {
      users[index] = this.user;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      this.authService.updateCurrentUser(this.user);
    }
    this.isEditing = false;
    this.selectedFile = null;
  }
}
