import { Component, AfterViewInit, OnInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  tasks: any[] = [];
  projects: any[] = [];

  totalProjects = 0;
  activeProjects = 0;
  completedProjects = 0;
  completionRate = 0;

  totalTasks = 0;
  completed = 0;
  inProgress = 0;
  overdue = 0;

  private completionChart!: Chart;
  private priorityChart!: Chart;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.authService.currentUserValue) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.taskService.projects$.subscribe(projects => {
        this.projects = projects;
        this.tasks = this.projects.flatMap(p => p.tasks || []);
        this.updateStats();
        this.renderCharts();
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    this.completionChart?.destroy();
    this.priorityChart?.destroy();
  }

  updateStats() {
    this.totalProjects = this.projects.length;
    this.completedProjects = this.projects.filter(p => p.status === 'Completed').length;
    this.activeProjects = this.totalProjects - this.completedProjects;
    this.completionRate = this.totalProjects
      ? Math.round((this.completedProjects / this.totalProjects) * 100)
      : 0;

    this.totalTasks = this.tasks.length;
    this.completed = this.tasks.filter(t => t.status === 'Done').length;
    this.inProgress = this.tasks.filter(t => t.status === 'In Progress').length;
    this.overdue = this.tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
    ).length;
  }

  renderCharts() {
    this.completionChart?.destroy();
    this.priorityChart?.destroy();

    const completionCanvas = document.getElementById('completionChart') as HTMLCanvasElement;
    const priorityCanvas = document.getElementById('priorityChart') as HTMLCanvasElement;

    if (completionCanvas) {
      this.completionChart = new Chart(completionCanvas, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress', 'To Do'],
          datasets: [{
            data: [
              this.completed,
              this.inProgress,
              this.totalTasks - this.completed - this.inProgress
            ],
            backgroundColor: ['	#50C878', '#3B82F6', '#9ca3af']
          }]
        }
      });
    }

if (priorityCanvas) {
 
  const low = this.tasks.filter(t => t.priority === 'low').length;
  const medium = this.tasks.filter(t => t.priority === 'medium').length;
  const high = this.tasks.filter(t => t.priority === 'high').length;
  const urgent = this.tasks.filter(t => t.priority === 'urgent').length;
 
  this.priorityChart = new Chart(priorityCanvas, {
    type: 'bar',
    data: {
      labels: ['Low', 'Medium', 'High', 'Urgent'],
      datasets: [{
        label: 'Tasks',
        data: [low, medium, high, urgent],
        backgroundColor: [
          '#4CAF50',
          '#FFC107',
          '#FF7043',
          '#F44336'
        ],
        borderRadius: 8,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 14,
              // weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#eee'
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
}
}
