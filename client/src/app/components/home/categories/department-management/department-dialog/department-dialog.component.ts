import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentElement } from '../../../interface/dialog-data';


@Component({
  selector: 'app-department-dialog',
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.scss']
})
export class DepartmentDialogComponent {

  private action: string;
  private local_data: DepartmentElement;

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

