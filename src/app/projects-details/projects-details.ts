import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-projects-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './projects-details.html',
  styleUrls: ['./projects-details.scss']
})
export class ProjectsDetailsComponent implements OnInit {

  project: any;
  progressPercentage = 0;

  viewMode: 'list' | 'board' = 'list';
  

  currentPage:
    | 'main'
    | 'list'
    | 'board'
    | 'createTask'
    | 'editTask'
    | 'editProject'
    = 'main';

  selectedTask: any = null;

  newTask: any = {
    title: '',
    status: 'To Do',
    priority: 'Medium',
    assignee: '',
    dueDate: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.taskService.projects$.subscribe(projects => {
      this.project = projects.find((p: any) => p.id === id);

      if (this.project) {
        if (!this.project.tasks) {
          this.project.tasks = [];
        }
        this.calculateProgress();
      }
    });
  }


  setView(mode: 'list' | 'board') {
    this.viewMode = mode;
  }


  drop(event: CdkDragDrop<any>, newStatus: string) {
    const task = event.item.data;
    task.status = newStatus;

    this.taskService.updateProject(this.project);
    this.calculateProgress();
  }


  showMain() {
    this.currentPage = 'main';
  }

  openCreateTask() {
    this.resetTaskForm();
    this.currentPage = 'createTask';
  }

  openEditProject() {
    this.currentPage = 'editProject';
  }

  saveTask() {
    if (!this.project.tasks) {
      this.project.tasks = [];
    }

    const taskToAdd = {
      ...this.newTask,
      id: Date.now()
    };

    this.project.tasks.push(taskToAdd);

    this.taskService.updateProject(this.project);
    this.calculateProgress();
    this.showMain();
  }

  resetTaskForm() {
    this.newTask = {
      title: '',
      status: 'To Do',
      priority: 'Medium',
      assignee: '',
      dueDate: '',
      description: ''
    };
  }

  saveProject() {
    this.taskService.updateProject(this.project);
        this.showMain();
  }

  calculateProgress() {
    if (!this.project?.tasks?.length) {
      this.progressPercentage = 0;
      return;
    }
  

    const done = this.project.tasks.filter(
      (t: any) => t.status === 'Completed'
    ).length;

    this.progressPercentage =
      (done / this.project.tasks.length) * 100;
  }

  get completedTasks() {
    return this.project?.tasks?.filter((t: any) => t.status === 'Completed') || [];
  }

  get todoTasks() {
    return this.project?.tasks?.filter((t: any) => t.status === 'To Do') || [];
  }

  get inProgressTasks() {
    return this.project?.tasks?.filter((t: any) => t.status === 'In Progress') || [];
  }

  get overdueTasks() {
    return this.project?.tasks?.filter((t: any) => t.status === 'Overdue') || [];
  }

  deleteProject() {
    if (confirm('Delete project?')) {
      this.taskService.deleteProject(this.project.id);
      this.router.navigate(['/projects']);
    }
  }
}