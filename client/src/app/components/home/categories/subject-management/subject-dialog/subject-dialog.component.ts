import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseElement } from '../../../interface/dialog-data';

@Component({
  selector: 'app-subject-dialog',
  templateUrl: './subject-dialog.component.html',
  styleUrls: ['./subject-dialog.component.scss']
})
export class SubjectDialogComponent {

  action: string;
  local_data: CourseElement;

  constructor(
    public dialogRef: MatDialogRef<SubjectDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CourseElement) {
    // console.log(data);
    this.local_data = {
      id: '',
      name: '',
      credits: null,
      department: '',
      length: {
        theory: null,
        practice: null
      },
      coursePrerequisites: [],
      creditPrerequisites: null,
    }

    if (data.id) {
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
      id: this.local_data.id,
      name: this.local_data.name,
      capacity: this.local_data.credits,
      department: this.local_data.department,
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

