import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNotifications();
    }
  }

  addNotification(message: string) {
    const notification: Notification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false
    };
    this.notifications.unshift(notification); 
    this.saveNotifications();
    this.notificationsSubject.next(this.notifications);
  }

  markAsRead(id: number) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
      this.notificationsSubject.next(this.notifications);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notificationsSubject.next(this.notifications);
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notificationsSubject.next(this.notifications);
  }

  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
      this.notificationsSubject.next(this.notifications);
    }
  }

  private saveNotifications() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
  }
}