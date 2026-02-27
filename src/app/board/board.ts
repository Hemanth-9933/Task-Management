import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit {

  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];
  allTasks: any[] = [];

  selectedTask: any = null;
  editableTask: any = null;

  showTaskDetails = false;
  showEditPage = false;
  showFilters = false;

  priorities = ['Low', 'Medium', 'High', 'Urgent'];
  assignees = ['Hemanth', 'Vinoth', 'Dinesh', 'Shivam'];

  selectedPriorities: string[] = [];
  selectedStatuses: string[] = [];
  selectedAssignees: string[] = [];

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.taskService.projects$.subscribe(projects => {
      this.allTasks = projects.flatMap(p =>
        p.tasks.map((t: any) => ({
          ...t,
          projectId: p.id,
          projectTitle: p.title,
          history: t.history || []
        }))
      );
      this.applyFilters();
    });
  }


  openTask(task: any) {
    this.selectedTask = task;
    this.showTaskDetails = true;
  }

  closeTask() {
    this.showTaskDetails = false;
    this.selectedTask = null;
  }

  openEdit() {
    this.editableTask = { ...this.selectedTask };
    this.showTaskDetails = false;
    this.showEditPage = true;
  }

  cancelEdit() {
    this.showEditPage = false;
    this.showTaskDetails = true;
  }

  saveEdit() {
    Object.assign(this.selectedTask, this.editableTask);
    this.updateTask(this.selectedTask);
    this.applyFilters();
    this.showEditPage = false;
    this.showTaskDetails = true;
  }

  deleteTask(task: any) {
    const user = this.authService.currentUserValue;
    const key = user ? 'projects_' + user.email : 'projects_guest';
    const projects = JSON.parse(localStorage.getItem(key) || '[]');

    const project = projects.find((p: any) => p.id === task.projectId);
    if (project) {
      project.tasks = project.tasks.filter((t: any) => t.id !== task.id);
      this.taskService.saveProjects(projects);
    }

    this.showEditPage = false;
    this.closeTask();
  }


  changeStatus(task: any, newStatus: string) {
    if (task.status !== newStatus) {
      task.status = newStatus;

      task.history = task.history || [];
      task.history.unshift({
        status: newStatus,
        date: new Date().toISOString()
      });

      this.updateTask(task);
      this.applyFilters();
    }
  }


  togglePriority(priority: string) {
    this.toggleValue(this.selectedPriorities, priority);
    this.applyFilters();
  }

  toggleStatus(status: string) {
    this.toggleValue(this.selectedStatuses, status);
    this.applyFilters();
  }

  toggleAssignee(assignee: string) {
    this.toggleValue(this.selectedAssignees, assignee);
    this.applyFilters();
  }

  toggleValue(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index > -1) array.splice(index, 1);
    else array.push(value);
  }

  clearFilters() {
    this.selectedPriorities = [];
    this.selectedStatuses = [];
    this.selectedAssignees = [];
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allTasks];

    if (this.selectedPriorities.length) {
      filtered = filtered.filter(t =>
        this.selectedPriorities.includes(t.priority)
      );
    }

    if (this.selectedStatuses.length) {
      filtered = filtered.filter(t =>
        this.selectedStatuses.includes(t.status)
      );
    }

    if (this.selectedAssignees.length) {
      filtered = filtered.filter(t =>
        this.selectedAssignees.includes(t.assignee)
      );
    }

    this.todoTasks = filtered.filter(t => t.status === 'To Do');
    this.inProgressTasks = filtered.filter(t => t.status === 'In Progress');
    this.doneTasks = filtered.filter(t => t.status === 'Done');
  }


  onDrop(event: CdkDragDrop<any[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainer(event.container.id);

      task.status = newStatus;

      task.history = task.history || [];
      task.history.unshift({
        status: newStatus,
        date: new Date().toISOString()
      });

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

}