import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PeriodicElement } from '../../interface/dialog-data';

@Component({
  selector: 'app-classroom-dialog',
  templateUrl: './classroom-dialog.component.html',
  styleUrls: ['./classroom-dialog.component.scss']
})
export class ClassroomDialogComponent {

  action: string;
  local_data: PeriodicElement;

  constructor(
    public dialogRef: MatDialogRef<ClassroomDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: PeriodicElement) {
      console.log(data);
      this.local_data = { ...data };
      this.action = this.local_data.action;
     }

  doAction() {
    console.log(this.local_data);

    let newData = {
      id: this.local_data.id,
      name: this.local_data.name,
      chairs: this.local_data.chairs,
      address: this.local_data.address,
      type: this.local_data.type,
      multi: this.local_data.multi
    }
    console.log(newData);

    this.dialogRef.close({ event: this.action, data: newData });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  onChange(event) {
  this.local_data.multi = event.checked;
  }

}

