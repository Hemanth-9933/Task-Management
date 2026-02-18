import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./root-redirect.component').then(m => m.RootRedirectComponent),
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
  },

  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.RegisterComponent),
  },

  {
    path: 'forgetpassword',
    loadComponent: () => import('./forgetpassword/forgetpassword').then(m => m.Forgetpassword),
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'projects',
    loadComponent: () => import('./projects/projects').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard]
  },

  // ✅ Create Project Page
  {
  path: 'projects/create',
  loadComponent: () => import('./create/create').then(m => m.CreateComponent),
  canActivate: [AuthGuard]
},


  {
    path: 'projects/:id',
    loadComponent: () => import('./projects-details/projects-details').then(m => m.ProjectsDetailsComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks').then(m => m.TasksComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'board',
    loadComponent: () => import('./board/board').then(m => m.BoardComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  }
];
