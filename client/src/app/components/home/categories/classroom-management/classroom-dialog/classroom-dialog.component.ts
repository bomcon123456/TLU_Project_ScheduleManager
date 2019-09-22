import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassroomElement } from '../../../interface/dialog-data';

@Component({
  selector: 'app-classroom-dialog',
  templateUrl: './classroom-dialog.component.html',
  styleUrls: ['./classroom-dialog.component.scss']
})
export class ClassroomDialogComponent {

  action: string;
  local_data: ClassroomElement;

  constructor(
    public dialogRef: MatDialogRef<ClassroomDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ClassroomElement) {
      // console.log(data);
      this.local_data = {
        id: '',
        name: '',
        capacity: null,
        location: {
          building: '',
          floor: ''
        },
        roomType: '',
        multi: false,
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
      capacity: this.local_data.capacity,
      location: {
        building: this.local_data.location.building,
        floor: this.local_data.location.floor
      },
      roomType: this.local_data.roomType,
      multi: this.local_data.multi
    }
    console.log(newData);

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  onChange(event) {
  this.local_data.multi = event.checked;
  }

}

