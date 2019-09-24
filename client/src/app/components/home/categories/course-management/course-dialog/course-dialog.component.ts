import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseElement, DepartmentElement } from '../../../interface/dialog-data';
import { DepartmentApiService } from './../../../../../services/department-api.service';


@Component({
  selector: 'app-course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.scss']
})
export class CourseDialogComponent implements OnInit {

  private action: string;
  private local_data: CourseElement;
  private departments: DepartmentElement[];

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
        practice: null
      },
      coursePrerequisites: [],
      creditPrerequisites: null,
    }

    if (data._id) {
      this.local_data = { ...data };
    }
    else {
      this.local_data.action = 'add'
    }

    this.action = this.local_data.action;
    console.log(this.local_data);

  }

  ngOnInit() {

    this.getDepartmentsData(17, 1);
  }

  getDepartmentsData(pageSize: number, pageIndex: number) {
    this.departmentApi.getDepartments(pageSize, pageIndex).subscribe(result => {
      this.departments = result.data;
    }, error => {
      console.log(error);

    })
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
        practice: this.local_data.length.practice
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

  // onChange(event) {
  //   this.local_data.multi = event.checked;
  // }

}

