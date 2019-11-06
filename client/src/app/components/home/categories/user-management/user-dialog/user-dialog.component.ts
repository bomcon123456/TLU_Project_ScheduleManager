import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserElement } from '../../../interface/dialog-data';
import { DepartmentApiService } from 'src/app/services/department-api.service';


@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})

export class UserDialogComponent implements OnInit {

  private roles = ROLE;

  private departments: any[];
  private action: string;
  private local_data: any;
  public userForm: FormGroup;
  public nameFormControl = new FormControl('', [
    Validators.required,
  ]);
  public usernameFormControl = new FormControl('', [
    Validators.required,
  ]);
  public roleFormControl = new FormControl('', [
    Validators.required,
  ]);
  public departmentFormControl = new FormControl('', [
    // Validators.required,
  ]);


  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private departmentApi: DepartmentApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserElement) {

    this.getDepartmentsData(17, 1);

    this.local_data = {};

    if (data.username) {
      this.local_data = { ...data };
      this.roleFormControl.setValue(this.local_data.role);
      this.departmentFormControl.setValue(this.local_data.department);
    }
    else {
      this.local_data.action = 'add'
    }

    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      // _id: this.idFormControl,
      name: this.nameFormControl,
      username: this.usernameFormControl,
      role: this.roleFormControl,
      department: this.departmentFormControl,
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.userForm.controls[controlName].hasError(errorName);
  }

  doAction() {

    let data = {
      _id: this.local_data._id,
      name: this.local_data.name,
      username: this.local_data.username,
      role: this.local_data.role,
    }

    let newData;

    if ( this.local_data.role == 0 && this.local_data.role == 1 ) {
      newData = { ...data, department: this.local_data.department }
    }
    else {
      newData = data;
    }

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  getDepartmentsData(pageSize: number, pageIndex: number) {
    this.departmentApi.getDepartments(pageSize, pageIndex).subscribe(result => {
      this.departments = result.data;
    }, error => {
      console.log(error);

    })
  }

}



const ROLE = [
  {
    name: 'Admin',
    role: 99
  },
  {
    name: 'Phòng đào tạo',
    role: 2
  },
  {
    name: 'Người phụ trách bộ môn',
    role: 1
  },
  {
    name: 'Giáo viên',
    role: 0
  }
]
