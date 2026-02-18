import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-board',
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit {
  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];
  statuses = ['To Do', 'In Progress', 'Done'];
  filterPriority = '';
  showFilters = false;

  constructor(private taskService: TaskService, private authService: AuthService) {}

  ngOnInit() {
    this.taskService.projects$.subscribe(projects => {
      const allTasks = projects.flatMap(p => p.tasks.map((t: any) => ({ ...t, projectId: p.id, projectTitle: p.title })));
      this.updateTaskArrays(allTasks);
    });
  }

  updateTaskArrays(tasks: any[]) {
    let filteredTasks = tasks;
    if (this.filterPriority) {
      filteredTasks = tasks.filter(t => t.priority === this.filterPriority);
    }
    this.todoTasks = filteredTasks.filter(t => t.status === 'To Do');
    this.inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
    this.doneTasks = filteredTasks.filter(t => t.status === 'Done');
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task = event.container.data[event.currentIndex];
      task.status = this.getStatusFromContainer(event.container.id);
      this.updateTask(task);
    }
  }

  getStatusFromContainer(id: string): string {
    switch (id) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'done': return 'Done';
      default: return 'To Do';
    }
  }

  updateTask(task: any) {
    const user = this.authService.currentUserValue;
    const key = user ? 'projects_' + user.email : 'projects_guest';
    const projects = JSON.parse(localStorage.getItem(key) || '[]');
    const project = projects.find((p: any) => p.id === task.projectId);
    if (project) {
      const tIndex = project.tasks.findIndex((t: any) => t.id === task.id);
      if (tIndex !== -1) {
        project.tasks[tIndex] = task;
        this.taskService.saveProjects(projects);
      }
    }
  }

  setFilter(priority: string) {
    this.filterPriority = priority;
    this.taskService.projects$.subscribe(projects => {
      const allTasks = projects.flatMap(p => p.tasks.map((t: any) => ({ ...t, projectId: p.id, projectTitle: p.title })));
      this.updateTaskArrays(allTasks);
    });
  }

  getCardColor(priority: string): string {
    switch (priority) {
      case 'low': return '#e3f2fd';
      case 'medium': return '#fff3e0';
      case 'high': return '#ffebee';
      case 'urgent': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }
}
