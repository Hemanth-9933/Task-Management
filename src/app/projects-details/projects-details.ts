import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-projects-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-details.html',
  styleUrl: './projects-details.scss'
})
export class ProjectsDetailsComponent implements OnInit {
  project: any;
  isCreateTaskMode = false; 
  progressPercentage = 0;

  newTask: any = {
    title: '', status: 'To Do', priority: 'Medium', description: '', assignee: '', dueDate: ''
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
        if (!this.project.tasks) this.project.tasks = [];
        this.calculateProgress();
      }
    });
  }

  openCreateTask() {
    this.resetForm();
    this.isCreateTaskMode = true; 
  }

  saveCreatedTask() {
    if (!this.newTask.title || !this.newTask.assignee) {
      alert('Please fill in required fields');
      return;
    }

    const task = { 
      ...this.newTask, 
      id: Date.now() 
    };

    this.project.tasks.push(task);
    
    this.taskService.updateProject(this.project);
    
    this.isCreateTaskMode = false; 
    this.calculateProgress();
  }

  resetForm() {
    this.newTask = { title: '', status: 'To Do', priority: 'Medium', description: '', assignee: '', dueDate: '' };
  }

  calculateProgress() {
    if (!this.project?.tasks?.length) { this.progressPercentage = 0; return; }
    const done = this.project.tasks.filter((t: any) => t.status === 'Completed').length;
    this.progressPercentage = (done / this.project.tasks.length) * 100;
  }

  get toDo() { return this.project?.tasks?.filter((t: any) => t.status === 'To Do').length || 0; }
  get inProgress() { return this.project?.tasks?.filter((t: any) => t.status === 'In Progress').length || 0; }
  get completed() { return this.project?.tasks?.filter((t: any) => t.status === 'Completed').length || 0; }
  get overdue() {
    return this.project?.tasks?.filter((t: any) => 
      t.status !== 'Completed' && new Date(t.dueDate) < new Date()
    ).length || 0;
  }

  get totalDaysOfProject() {
    const start = new Date(this.project.start);
    const end = new Date(this.project.end);
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 0;
  }

  get currentDayOfProject() {
    const start = new Date(this.project.start);
    const day = Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(day, this.totalDaysOfProject));
  }

  deleteProject() {
    if (confirm('Delete project?')) {
      this.taskService.deleteProject(this.project.id);
      this.router.navigate(['/projects']);
    }
  }

  editProject() { 

    
   }
}