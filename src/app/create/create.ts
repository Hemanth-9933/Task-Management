import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create.html',
  styleUrls: ['./create.scss']
})
export class CreateComponent {

  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Planning', Validators.required],  // default fixed
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formValue = this.projectForm.value;

    const newProject = {
      id: Date.now(),
      title: formValue.name,
      status: formValue.status,
      start: formValue.startDate,
      end: formValue.endDate,
      desc: formValue.description,
      tasks: [],
      statusClass: formValue.status
        .toLowerCase()
        .replace(/\s+/g, '-')  
    };

    const projects = this.taskService.getProjects();
    projects.push(newProject);
    this.taskService.saveProjects(projects);

    this.notificationService.addNotification('Project created successfully');
    this.router.navigate(['/projects']);
  }

  resetForm() {
    this.projectForm.reset({
      status: 'Planning'
    });
  }
}