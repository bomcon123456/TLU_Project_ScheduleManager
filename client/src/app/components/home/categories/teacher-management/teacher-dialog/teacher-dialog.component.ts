import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TeacherElement, DepartmentElement } from '../../../interface/dialog-data';
import { DepartmentApiService } from './../../../../../services/department-api.service';

@Component({
  selector: 'app-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.scss']
})
export class TeacherDialogComponent implements OnInit{

  private action: string;
  private local_data: TeacherElement;
  private departments: DepartmentElement[];
  public teacherForm: FormGroup;
  public idFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]);
  public nameFormControl = new FormControl('', [
    Validators.required,
  ]);
  public departmentFormControl = new FormControl('', [
    Validators.required,
  ]);


  constructor(
    public dialogRef: MatDialogRef<TeacherDialogComponent>,
    private departmentApi: DepartmentApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: TeacherElement) {

    this.local_data = {
      _id: '',
      name: '',
      department: {
        _id: '',
        name: ''
      },
    }

    if (data._id) {
      this.local_data = { ...data };

      this.departmentFormControl.setValue(this.local_data.department._id);
    }
    else {
      this.local_data.action = 'add'
    }

    this.action = this.local_data.action;

  }

  ngOnInit() {
    this.teacherForm = new FormGroup({
      name: this.nameFormControl,
      department: this.departmentFormControl
    });

    this.getDepartmentsData(17, 1);
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.teacherForm.controls[controlName].hasError(errorName);
  }

  getDepartmentsData(pageSize: number, pageIndex: number) {
    this.departmentApi.getDepartments(pageSize, pageIndex).subscribe(result => {
      this.departments = result.data;
    }, error => {
      console.log(error);

    })
  }

  setDepartmentId(data) {
    return this.local_data.department._id = data._id;
  }

  doAction() {

    let newData = {
      id: this.local_data._id,
      name: this.local_data.name,
      department: {
        id: this.local_data.department._id,
        name: this.local_data.department.name
      },
    }

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  // onChange(event) {
  //   this.local_data.multi = event.checked;
  // }

}


