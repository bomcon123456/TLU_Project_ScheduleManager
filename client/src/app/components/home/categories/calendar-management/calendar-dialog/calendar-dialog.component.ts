import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomElement } from '../../../interface/dialog-data';

function roomCapacityValidator(control: FormControl) {
  let capacity = control.value
  if (capacity == -1 || capacity >= 30) {
    return null;
  }
  return {
    capacity: capacity
  }
}

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})

export class CalendarDialogComponent implements OnInit {

  private action: string;
  private local_data: any;
  // public calendarForm: FormGroup;
  // public startFormControl = new FormControl('', [
  //   Validators.required,
  // ]);
  // public endFormControl = new FormControl('', [
  //   Validators.required,
  // ]);
  // public capacityFormControl = new FormControl('', [
  //   Validators.required,
  //   roomCapacityValidator,
  // ]);
  // public buildingFormControl = new FormControl('', [
  //   Validators.required,
  // ]);
  // public floorFormControl = new FormControl('', [
  //   Validators.required,
  // ]);
  // public roomTypeFormControl = new FormControl('', [
  //   Validators.required,
  // ]);


  constructor(
    public dialogRef: MatDialogRef<CalendarDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: RoomElement) {

    this.local_data = {}

      this.local_data = { ...data };
      // this.roomTypeFormControl.setValue(this.local_data.roomType);

    // else {
    //   this.local_data.action = 'add'
    // }

    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    // this.calendarForm = new FormGroup({
    //   // _id: this.idFormControl,
    //   startDate: this.startFormControl,
    // });
  }

  getDatePicker(data, type) {
    if ( type == 'start' ) {
      this.local_data.startDate = data.toISOString();
    }
    else {
      this.local_data.endDate = data.toISOString();
    }
    console.log(data.toISOString());

  }

  doAction() {

    let newData = {
      id: this.local_data._id,
      startDate: this.local_data.startDate,
      endDate: this.local_data.endDate,
    }

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  transformGroup(data) {
    switch (data) {
      case 'Group 1': return 'Nhóm 1';
      case 'Group 2': return 'Nhóm 2';
      case 'Group 3': return 'Nhóm 3';
    }
  }

  transformSemester(data) {
    switch (data) {
      case 'Semester 1': return 'Kỳ 1';
      case 'Semester 2': return 'Kỳ 2';
      case 'Semester 3': return 'Kỳ 3';
    }
  }

}

