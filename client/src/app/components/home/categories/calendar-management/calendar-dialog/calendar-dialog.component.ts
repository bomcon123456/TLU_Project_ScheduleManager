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
  private local_data: RoomElement;
  public roomForm: FormGroup;
  // public nameFormControl = new FormControl('', [
  //   Validators.required,
  //   Validators.minLength(4),
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

    // if (data._id) {
    //   this.local_data = { ...data };
    //   this.roomTypeFormControl.setValue(this.local_data.roomType);
    // }
    // else {
    //   this.local_data.action = 'add'
    // }

    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    // this.roomForm = new FormGroup({
    //   // _id: this.idFormControl,
    //   name: this.nameFormControl,
    //   capacity: this.capacityFormControl,
    //   building: this.buildingFormControl,
    //   floor: this.floorFormControl,
    //   roomType: this.roomTypeFormControl
    // });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.roomForm.controls[controlName].hasError(errorName);
  }

  getDatePicker(data) {
    console.log(data);

  }

  doAction() {

    let newData = {
      // id: this.local_data._id,
      // name: this.local_data.name,
      // capacity: this.local_data.capacity,
      // location: {
      //   building: this.local_data.location.building,
      //   floor: this.local_data.location.floor
      // },
      // roomType: this.local_data.roomType,
    }

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

