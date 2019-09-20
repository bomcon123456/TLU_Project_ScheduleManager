import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterManagementComponent } from './semester-management.component';

describe('SemesterManagementComponent', () => {
  let component: SemesterManagementComponent;
  let fixture: ComponentFixture<SemesterManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemesterManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemesterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
