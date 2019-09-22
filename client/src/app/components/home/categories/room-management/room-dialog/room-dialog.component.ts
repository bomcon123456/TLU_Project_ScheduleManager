import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RoomElement } from '../../../interface/dialog-data';

@Component({
  selector: 'app-room-dialog',
  templateUrl: './room-dialog.component.html',
  styleUrls: ['./room-dialog.component.scss']
})
export class RoomDialogComponent {

  action: string;
  local_data: RoomElement;

  constructor(
    public dialogRef: MatDialogRef<RoomDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: RoomElement) {
      console.log(data);
      this.local_data = {
        _id: '',
        name: '',
        capacity: null,
        location: {
          building: '',
          floor: null
        },
        roomType: '',
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
      capacity: this.local_data.capacity,
      location: {
        building: this.local_data.location.building,
        floor: this.local_data.location.floor
      },
      roomType: this.local_data.roomType,
    }
    console.log(newData);

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  onChange(event) {
    if (event.checked == 1) {
      this.local_data.capacity = -1;
    }
    else {
      this.local_data.capacity = 0;
    }
  }

}

