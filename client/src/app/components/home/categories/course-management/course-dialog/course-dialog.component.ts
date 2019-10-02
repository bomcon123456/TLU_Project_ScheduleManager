import { Component, OnInit, Inject, Optional, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CourseElement, DepartmentElement } from '../../../interface/dialog-data';
import { DepartmentApiService } from './../../../../../services/department-api.service';


@Component({
  selector: 'app-course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.scss']
})
export class CourseDialogComponent implements OnInit {

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public courseCtrl = new FormControl();
  private filteredCourses: Observable<any>;
  private coursesSelected: string[];
  private coursesList: CourseElement[];
  private action: string;
  private local_data: CourseElement;
  private departments: DepartmentElement[];

  private isCombined: boolean;

  @ViewChild('courseInput', { static: false }) courseInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    public dialogRef: MatDialogRef<CourseDialogComponent>,
    private departmentApi: DepartmentApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CourseElement) {
    // console.log(data);
    this.local_data = {
      _id: '',
      name: '',
      credits: null,
      department: {
        _id: '',
        name: ''
      },
      length: {
        theory: null,
        practice: null,
        combined: null
      },
      coursePrerequisites: [],
      creditPrerequisites: null,
    }

    if (data._id) {
      this.local_data = { ...data };
      this.coursesSelected = this.local_data.coursePrerequisites;
      if ( this.local_data.length.combined == 0 ) {
        this.isCombined = false;
      }
      else {
        this.local_data.length.practice = null;
        this.isCombined = true;
      }
    }
    else {
      this.local_data.action = 'add'
      this.coursesSelected = [];
      this.isCombined = false;
    }

    this.action = this.local_data.action;

  }

  async ngOnInit() {

    this.getDepartmentsData(17, 1);
    if ( this.local_data.department._id ) {
      await this.getCoursesByDepartmentID(this.local_data.department._id, 20, 1);
    }
  }

  getDepartmentsData(pageSize: number, pageIndex: number) {
    this.departmentApi.getDepartments(pageSize, pageIndex).subscribe(result => {
      this.departments = result.data;
    }, error => {
      console.log(error);

    })
  }

  getCoursesByDepartmentID(id:string, pageSize: number, pageIndex: number) {
    this.departmentApi.getCoursesById(id, pageSize, pageIndex).subscribe( result => {
      this.coursesList = result.data;
      this.getFilterCourses();
    }, error => {
      console.log(error);

    })
  }

  departmentSelected(event) {
    console.log(event.value);

    if ( !event.value ) {
      this.coursesList = [];
      this.getFilterCourses();
      return;
    }
    if ( event.value === this.local_data.department.name) {
      return;
    }
    this.departments.filter( department => {
      if (department.name === event.value ) {
        return this.local_data.department._id = department._id;
      }
    })
    this.coursesSelected = [];
    this.getCoursesByDepartmentID(this.local_data.department._id, 20, 1);

  }

  getFilterCourses() {
    console.log(this.coursesList )
    this.filteredCourses = this.courseCtrl.valueChanges.pipe(
      startWith(null),
      map((course: string | null) => course ? this._filter(course) : this.coursesList.slice())
    );
  }

  doAction() {
    console.log(this.local_data);

    let newData = {
      _id: this.local_data._id,
      name: this.local_data.name,
      capacity: this.local_data.credits,
      department: {
        _id: this.local_data.department._id,
        name: this.local_data.department.name
      },
      length: {
        theory: this.local_data.length.theory,
        practice: this.local_data.length.practice,
        combined: this.local_data.length.combined
      },
      coursePrerequisites: this.local_data.coursePrerequisites,
      creditPrerequisites: this.local_data.creditPrerequisites
    }
    console.log(newData);

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  remove(course: string): void {
    const index = this.coursesSelected.indexOf(course);

    if (index >= 0) {
      this.coursesSelected.splice(index, 1);
      this.local_data.coursePrerequisites = this.coursesSelected;
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.coursesSelected.indexOf(event.option.value) === -1) {
      this.coursesSelected.push(event.option.value);
      this.local_data.coursePrerequisites = this.coursesSelected;
    }
    this.courseInput.nativeElement.value = '';
    this.courseCtrl.setValue(null);
    console.log(event);

  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    return this.coursesList.filter(course => {
      if (course.name.toLowerCase().indexOf(filterValue) !== -1)
        return course;
    });
  }

  onChange(event) {
    if (event.checked == 1) {
      this.isCombined = true;
      let total = this.local_data.length.theory + this.local_data.length.practice;
      this.local_data.length = {
        theory: total,
        practice: null,
        combined: total,
      }
    }
    else {
      this.isCombined = false;
      this.local_data.length= {
        theory: this.local_data.length.theory,
        practice: 0,
        combined: 0
      }
    }
  }

  // onChange(event) {
  //   this.local_data.multi = event.checked;
  // }

}

