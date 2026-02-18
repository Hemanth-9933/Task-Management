import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'On Hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned?: string;
  dueDate?: string;
}

export interface Notification {
  id: number;
  message: string;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private projectsSubject = new BehaviorSubject<any[]>([]);

  projects$ = this.projectsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService) {
    this.loadProjects();
  }

  loadProjects() {
    const user = this.authService.currentUserValue;
    let key = 'projects_guest';
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        key = 'projects_' + user.email;
        let projects = JSON.parse(localStorage.getItem(key) || '[]');
        if (projects.length === 0) {

          projects = JSON.parse(localStorage.getItem('projects') || '[]');
          if (projects.length > 0) {
            localStorage.setItem(key, JSON.stringify(projects));
            localStorage.removeItem('projects');
          }
        }
        this.projectsSubject.next(projects);
      } else {
        const projects = JSON.parse(localStorage.getItem(key) || '[]');
        this.projectsSubject.next(projects);
      }
    }
  }

  saveProjects(projects: any[]) {
    const user = this.authService.currentUserValue;
    const key = user ? 'projects_' + user.email : 'projects_guest';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(projects));
    }
    this.projectsSubject.next(projects);
  }

  updateProject(updatedProject: any) {
    const projects = this.projectsSubject.value;
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      this.saveProjects(projects);
    }
  }

  deleteProject(projectId: number) {
    const projects = this.projectsSubject.value.filter(p => p.id !== projectId);
    this.saveProjects(projects);
  }

  getTasks() {
    return this.projectsSubject.value.flatMap((p: any) => p.tasks || []);
  }

  getProjects() {
    return this.projectsSubject.value;
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  addNotification(message: string, time: Date) {
    const notification: Notification = {
      id: Date.now(),
      message,
      time
    };
    this.notifications.unshift(notification);
    if (this.notifications.length > 10) {
      this.notifications.pop();
    }
    this.notificationsSubject.next([...this.notifications]);
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }
}
