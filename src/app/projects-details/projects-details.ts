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
currentPage: 'main' | 'list' | 'board' | 'createTask' | 'editProject' = 'main';  project: any;
  progressPercentage = 0;

viewMode: 'list' | 'board' = 'list';

   selectedTask: any = null;

  assignees: any[] = [];
today: string = '';
 
newTask: any = {
  title: '',
  status: 'To Do',
  priority: 'medium',   
  assigneeId: '',
  dueDate: '',
  description: ''
};
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router
  ) {}
ngOnInit() {

  this.currentPage = 'main';

  this.route.paramMap.subscribe(params => {

    const id = Number(params.get('id'));

    const projects = this.taskService.getProjects(); // 👈 create this method if not present

    const foundProject = projects.find((p: any) => p.id === id);

    if (foundProject) {

      this.project = JSON.parse(JSON.stringify(foundProject));

      this.project.startDate = this.formatDateForInput(this.project.startDate);
      this.project.endDate = this.formatDateForInput(this.project.endDate);

      if (!this.project.tasks) {
        this.project.tasks = [];
      }

      this.calculateProgress();
      this.updateProjectStatusAutomatically();
    }

  });

}
formatDateForInput(date: string): string {

  if (!date) return '';

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
 

  setView(mode: 'list' | 'board') {
    this.viewMode = mode;
  }


  drop(event: CdkDragDrop<any>, newStatus: string) {
    const task = event.item.data;
    task.status = newStatus;
    this.updateProjectStatusAutomatically();

    this.taskService.updateProject(this.project);
    this.calculateProgress();
  }


  showMain() {
    this.currentPage = 'main';
  }

openCreateTask() {
  this.resetTaskForm();
  this.newTask.dueDate = this.project.startDate; 
  this.currentPage = 'createTask';
}

  openEditProject() {
    this.currentPage = 'editProject';
  }
  goToList() {
  this.currentPage = 'list';
}

goToBoard() {
  this.currentPage = 'board';
}



  saveTask() {
  if (!this.project.tasks) {
    this.project.tasks = [];
    this.updateProjectStatusAutomatically();
  }

  const taskToAdd = {
    id: Date.now(),
    title: this.newTask.title,
    description: this.newTask.description,
    status: this.newTask.status,
    assignee: this.newTask.assigneeId, 
    dueDate: this.newTask.dueDate,
    priority: this.newTask.priority.toLowerCase() 
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
      assigneeId: '',
      dueDate: '',
      description: ''
    };
  }

saveProject() {
 
  this.project.startDate = this.convertToISO(this.project.startDate);
  this.project.endDate = this.convertToISO(this.project.endDate);
 
  this.taskService.updateProject(this.project);
  this.showMain();
}
convertToISO(date: string): string {

  if (!date) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  if (date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return date;
}

  calculateProgress() {
    if (!this.project?.tasks?.length) {
      this.progressPercentage = 0;
      this.updateProjectStatusAutomatically();

      return;
    }



 

   const completed = this.project.tasks.filter(
  (t: any) => t.status === 'Completed' || t.status === 'Completed'
).length;

    this.progressPercentage =
      (completed / this.project.tasks.length) * 100;
  }

get completedTasks() {
  return this.project?.tasks?.filter(
    (t: any) => t.status === 'Completed' || t.status === 'Completed'
  ) || [];
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
  getCompletedCount() {
  return this.project.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
}

getStatusCount(status: string) {
  return this.project.tasks?.filter((t:any) => t.status === status).length || 0;
}
getProgressPercentage() {

  const tasks = this.project.tasks || [];

  if (!tasks.length) return 0;
 
  let score = 0;
 
  tasks.forEach((task: any) => {

    if (task.status === 'Completed') {

      score += 1;

    } else if (task.status === 'In Progress') {

      score += 0.5;

    }

  });
 
  return (score / tasks.length) * 100;

}
 

  deleteProject() {
    if (confirm('Delete project?')) {
      this.taskService.deleteProject(this.project.id);
      this.router.navigate(['/projects']);
    }
  }
   updateProjectStatusAutomatically() {

    if (!this.project?.tasks?.length) {
      this.project.status = 'Planning';
      return;
    }

    const total = this.project.tasks.length;

    const completed = this.project.tasks.filter(
      (t: any) => t.status === 'Completed'
    ).length;

    if (completed === total) {
      this.project.status = 'Completed';
    } else if (completed > 0) {
      this.project.status = 'In Progress';
    } else {
      this.project.status = 'Planning';
    }

    this.taskService.updateProject(this.project);
  }

} 
