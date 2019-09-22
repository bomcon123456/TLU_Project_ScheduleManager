import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeacherElement } from '../../../interface/dialog-data';

@Component({
  selector: 'app-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.scss']
})
export class TeacherDialogComponent {

  action: string;
  local_data: TeacherElement;

  constructor(
    public dialogRef: MatDialogRef<TeacherDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: TeacherElement) {
    // console.log(data);
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
      _id: this.local_data._id,
      name: this.local_data.name,
      department: {
        _id: this.local_data.department._id,
        name: this.local_data.department.name
      },
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


