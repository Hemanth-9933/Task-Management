import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsDetailsComponent } from './projects-details';

describe('ProjectsDetailsComponent', () => {
  let component: ProjectsDetailsComponent;
  let fixture: ComponentFixture<ProjectsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
