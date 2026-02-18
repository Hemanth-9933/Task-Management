import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  loggedInUser: any = null;
  notifications: Notification[] = [];
  showNotifications = false;
  unreadCount = 0;
  showLogoutConfirm = false;

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
    });
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    });
  }

  logout() {
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutConfirm = false;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAll() {
    this.notificationService.clearAll();
  }
}
