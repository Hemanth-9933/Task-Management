import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class TasksComponent implements OnInit {

  tasks: any[] = [];
  filteredTasks: any[] = [];

  statusFilter = '';
  priorityFilter = '';
  assignedFilter = '';
  dueDateFrom = '';
  dueDateTo = '';
  showFilters = false;
  showCreateTaskForm = false;

  newTask = { 
    title: '', description: '', status: 'To Do',
    assigned: '', dueDate: '', priority: 'low',
    projectId: null as number | null
  };

  editingTask: any = null;
  editTaskForm: any = {};
  selectedTask: any = null;
  projects: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }

    this.taskService.projects$.subscribe(projects => {
      this.projects = projects;
      this.tasks = [];
      projects.forEach((p: any) => {
        p.tasks.forEach((t: any) => {
          this.tasks.push({ ...t, projectId: p.id, projectTitle: p.title });
        });
      });
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    this.filteredTasks = this.tasks.filter(t => {
      return (!this.statusFilter || t.status === this.statusFilter) &&
             (!this.priorityFilter || t.priority === this.priorityFilter) &&
             (!this.assignedFilter || t.assigned?.toLowerCase().includes(this.assignedFilter.toLowerCase()));
    });
  }

  viewTask(task: any) {
    console.log('Clicked Task:', task);
    this.selectedTask = task;
  }

  closeTaskDetails() {
    this.selectedTask = null;
  }

  toggleCreateTaskForm() {
    this.showCreateTaskForm = !this.showCreateTaskForm;
    this.editingTask = null; 
  }

  createTask() {
    if (!this.newTask.title.trim()) {
      alert('Title is required');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const project = this.projects.find((p: any) => p.id == this.newTask.projectId);
      if (project) {
        const task = {
          id: Date.now(),
          title: this.newTask.title,
          description: this.newTask.description,
          status: this.newTask.status,
          assigned: this.newTask.assigned,
          dueDate: this.newTask.dueDate,
          priority: this.newTask.priority
        };
        project.tasks.push(task);
        this.taskService.saveProjects(this.projects);
        this.newTask = { title: '', description: '', status: 'To Do', assigned: '', dueDate: '', priority: 'low', projectId: null };
        this.showCreateTaskForm = false;
        this.notificationService.addNotification('Task "' + task.title + '" created successfully');
      } else {
        alert('Project not found');
      }
    }
  }

  updateTask(task: any) {
    this.editingTask = task;
    this.editTaskForm = { ...task };
    this.showCreateTaskForm = false;
  }

  saveEditedTask() {
    if (!this.editTaskForm.title.trim()) {
      alert('Title is required');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const project = this.projects.find((p: any) => p.id === this.editingTask.projectId);
      if (project) {
        const tIndex = project.tasks.findIndex((t: any) => t.id === this.editingTask.id);
        if (tIndex !== -1) {
          project.tasks[tIndex] = { ...this.editTaskForm };
          this.taskService.saveProjects(this.projects);
          this.notificationService.addNotification('Task "' + this.editTaskForm.title + '" updated successfully');
          this.cancelEdit();
        }
      }
    }
  }


  cancelEdit() {
    this.editingTask = null;
    this.editTaskForm = {};
  }

  deleteTask(task: any) {
    if (confirm('Delete task?')) {
      const project = this.projects.find(p => p.id === task.projectId);
      if (project) {
        project.tasks = project.tasks.filter((t: any) => t.id !== task.id);
        this.taskService.saveProjects(this.projects);
        this.notificationService.addNotification(`Task "${task.title}" deleted`);
      }
    }
  }
}
