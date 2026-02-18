import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class LoadingComponent {}


  




