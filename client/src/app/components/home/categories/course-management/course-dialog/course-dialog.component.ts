import { Component, OnInit, Inject, Optional, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  private isTheoryRequired: boolean;
  private isPracticeRequired: boolean;


  public courseForm: FormGroup;
  public _idFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]);
  public nameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(100),
  ]);
  public creditsFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);
  public departmentFormControl = new FormControl('', [
    Validators.required,
  ]);
  public theoryFormControl = new FormControl('', [
    Validators.required,
  ]);
  public practiceFormControl = new FormControl('', [
    Validators.required,
  ]);
  public creditsPrereqFormControl = new FormControl('', []);


  @ViewChild('courseInput', { static: false }) courseInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    public dialogRef: MatDialogRef<CourseDialogComponent>,
    private departmentApi: DepartmentApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CourseElement) {

    this.getDepartmentsData(17, 1);

    this.isPracticeRequired = true;
    this.isTheoryRequired = true;
    this.local_data = {
      _id: '',
      name: '',
      credits: null,
      department: {
        _id: '',
        name: ''
      },
      length: {
        theory: 0,
        practice: 0,
        combined: 0
      },
      coursePrerequisites: [],
      creditPrerequisites: 0,
    }


    if (data._id) {
      this.local_data = { ...data };

      this.getCoursesByDepartmentID(this.local_data.department._id, 20, 1);

      this.departmentFormControl.setValue(this.local_data.department._id);

      this.coursesSelected = this.local_data.coursePrerequisites;

      if ( this.local_data.length.combined == 0 ) {

        this.isCombined = false;

        this.setRequiredLength();
      }
      else {
        this.local_data.length.practice = 0;
        this.isCombined = true;
        this.setRequiredLength();
      }
    }
    else {
      this.local_data.action = 'add'
      this.coursesSelected = [];
      this.isCombined = false;
    }

    this.action = this.local_data.action;

  }

  ngOnInit() {

    this.courseForm = new FormGroup({
      _id: this._idFormControl,
      name: this.nameFormControl,
      credits: this.creditsFormControl,
      department: this.departmentFormControl,
      theory: this.theoryFormControl,
      practice: this.practiceFormControl,
      coursesPrereq: this.courseCtrl,
      creditsPrereq: this.creditsPrereqFormControl
    });


  }

  public hasError = (controlName: string, errorName: string) => {
    return this.courseForm.controls[controlName].hasError(errorName);
  }

  setRequiredLength() {

    let theory = this.local_data.length.theory;
    let practice = this.local_data.length.practice;

    if ( theory>0 && practice>0 ) {

      this.isTheoryRequired = true;
      this.isPracticeRequired = false;
    }
    else if ( theory > 0 && (practice == 0 || !practice) ) {

      this.local_data.length.practice = 0;
      this.isTheoryRequired = true;
      this.isPracticeRequired = false;
    }
    else if ( (theory==0 || !theory) && practice>0 ) {

      this.local_data.length.theory = 0;
      this.isTheoryRequired = false;
      this.isPracticeRequired = true;
    }
    else {

      this.isTheoryRequired = true;
      this.isPracticeRequired = true;
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
    console.log(event);

    // if ( !event ) {
    //   this.coursesList = [];
    //   this.getFilterCourses();
    //   return;
    // }
    if ( event.name === this.local_data.department.name) {
      return;
    }
    this.local_data.department._id = event;

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

    if ( this.isCombined )  {
      this.local_data.length.combined = this.local_data.length.theory;
    }

    let newData = {
      id: this.local_data._id,
      name: this.local_data.name,
      credits: this.local_data.credits,
      department: this.local_data.department._id,
      length: {
        theory: this.local_data.length.theory,
        practice: this.local_data.length.practice,
        combined: this.local_data.length.combined
      },
      coursePrerequisites: this.local_data.coursePrerequisites,
      creditPrerequisites: this.local_data.creditPrerequisites
    }

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    if ( this.local_data.length.combined != 0) {
      this.local_data.length.practice = this.local_data.length.combined;
    }

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
      this.isTheoryRequired = true
      this.isPracticeRequired = false;
      let total = this.local_data.length.theory + this.local_data.length.practice;
      this.local_data.length = {
        theory: total,
        practice: 0,
        combined: total,
      }
    }
    else {
      console.log(123);

      this.isCombined = false;
      // this.isTheoryRequired = true;
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

