import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class ProjectsComponent implements OnInit {

  showFilters = false;

  projects: any[] = [];
  filteredProjects: any[] = [];

  searchTerm = '';
  sortOption = 'Name A–Z';
  selectedStatuses: string[] = [];

  statuses = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Overdue'];

  statusClassMap: any = {
    'Planning': 'planning',
    'In Progress': 'in-progress',
    'Completed': 'completed',
    'On Hold': 'on-hold',
    'Overdue': 'overdue'
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.taskService.projects$.subscribe(projects => {
        this.projects = projects;
        this.updateProjectStatuses();
        this.applyFilters();
      });
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onStatusChange(event: any) {
    const value = event.target.value;

    if (event.target.checked) {
      if (!this.selectedStatuses.includes(value)) {
        this.selectedStatuses.push(value);
      }
    } else {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== value);
    }

    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.projects.filter(p =>
      p.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.selectedStatuses.length) {
      filtered = filtered.filter(p => this.selectedStatuses.includes(p.status));
    }

    if (this.sortOption === 'Name A–Z') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    this.filteredProjects = filtered;
  }

  goToCreateProject() {
    this.router.navigate(['/projects/create']);
  }

  updateProjectStatuses() {
    this.projects.forEach(project => {
      const tasks = project.tasks || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.status === 'Done').length;
      const overdueTasks = tasks.filter((t: any) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
      ).length;

      if (totalTasks === 0) {
        project.status = 'Planning';
        project.statusClass = 'planning';
      } else if (completedTasks === totalTasks) {
        project.status = 'Completed';
        project.statusClass = 'completed';
      } else if (overdueTasks > 0) {
        project.status = 'Overdue';
        project.statusClass = 'overdue';
      } else {
        project.status = 'In Progress';
        project.statusClass = 'in-progress';
      }

      project.taskCount = totalTasks;
    });
  }

  openProject(id: number) {
    this.router.navigate(['/projects', id]);
  }
}
