import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemesterDialogComponent } from './semester-dialog.component';

describe('SemesterDialogComponent', () => {
  let component: SemesterDialogComponent;
  let fixture: ComponentFixture<SemesterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemesterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemesterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
