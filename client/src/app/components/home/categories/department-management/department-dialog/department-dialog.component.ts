import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentElement } from '../../../interface/dialog-data';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-department-dialog',
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.scss']
})
export class DepartmentDialogComponent implements OnInit {

  private action: string;
  private local_data: DepartmentElement;
  public departmentForm: FormGroup;
  public schoolIdFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);
  public nameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(50),
  ]);

  constructor(
    public dialogRef: MatDialogRef<DepartmentDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DepartmentElement) {
    // console.log(data);
    this.local_data = {
      schoolId: '',
      name: '',
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

  ngOnInit(): void {
    this.departmentForm = new FormGroup({
      schoolId: this.schoolIdFormControl,
      name: this.nameFormControl,
    });

  }

  public hasError = (controlName: string, errorName: string) => {
    return this.departmentForm.controls[controlName].hasError(errorName);
  }

  doAction() {
    console.log(this.local_data);

    let newData = {
      schoolId: this.local_data.schoolId,
      name: this.local_data.name,
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

