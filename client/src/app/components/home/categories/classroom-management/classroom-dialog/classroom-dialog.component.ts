import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';

import { CourseApiService } from '../../../../../services/course-api.service';
import { TeacherApiService } from '../../../../../services/teacher-api.service';
import { GetFreeApiService } from '../../../../../services/get-free-api.service';

import { ClassroomElement } from '../../../interface/dialog-data';
import { YEARS, DAYS } from '../../../storage/data-storage'

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
  selector: 'app-classroom-dialog',
  templateUrl: './classroom-dialog.component.html',
  styleUrls: ['./classroom-dialog.component.scss']
})

export class ClassroomDialogComponent implements OnInit {

  private yearList = YEARS;
  private dayList = DAYS;

  private action: string;
  private departmentId: string;
  private shiftSelected: string;

  private teacherSearching: boolean;
  private isLoadingShift: boolean;
  private isLoadingRoom: boolean;

  private roomSelected: any;
  private teacherSelected: any;
  private teacherList: any;
  private shiftList: any;
  private roomList: any;

  private pageSize: number;
  private pageIndex: number;

  private local_data: ClassroomElement;
  public classroomForm: FormGroup;

  public nameFormControl = new FormControl('', []);
  public courseFormControl = new FormControl('', []);
  public studentsFormControl = new FormControl('', [
    Validators.required,
    Validators.min(30),
  ]);
  public teacherFormControl = new FormControl('', [
    Validators.required,
  ]);
  public yearFormControl = new FormControl('', [
    Validators.required,
  ]);
  public groupFormControl = new FormControl('', [
    Validators.required,
  ]);
  public semesterFormControl = new FormControl('', [
    Validators.required,
  ]);
  public dayFormControl = new FormControl('', [
    Validators.required,
  ]);
  public shiftFormControl = new FormControl('', [
    Validators.required,
  ]);
  public roomFormControl = new FormControl('', [
    Validators.required,
  ]);

  public TeacherFilteringCtrl: FormControl = new FormControl();

  constructor(private courseApi: CourseApiService,
              private teacherApi: TeacherApiService,
              private getFreeApi: GetFreeApiService,
              public dialogRef: MatDialogRef<ClassroomDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: ClassroomElement) {

    this.local_data = { ...data };
    this.roomSelected = this.local_data.roomId;
    this.teacherSelected = this.local_data.teacherId;
    this.shiftSelected = this.local_data.date.shift;

    this.teacherFormControl.setValue(this.local_data.teacherId._id);
    this.yearFormControl.setValue(this.local_data.date.year);
    this.groupFormControl.setValue(this.local_data.date.group);
    this.semesterFormControl.setValue(this.local_data.date.semesters);
    this.dayFormControl.setValue(this.local_data.date.day);
    this.shiftFormControl.setValue(this.local_data.date.shift);
    this.roomFormControl.setValue(this.local_data.roomId._id);

    this.getCourseDataById(this.local_data.courseId._id);

    this.action = this.local_data.action;
  }

  ngOnInit(): void {

    this.pageSize = 8;
    this.pageIndex = 1;

    this.classroomForm = new FormGroup({
      name: this.nameFormControl,
      course: this.courseFormControl,
      students: this.studentsFormControl,
      teacher: this.teacherFormControl,
      year: this.yearFormControl,
      group: this.groupFormControl,
      semester: this.semesterFormControl,
      day: this.dayFormControl,
      shift: this.shiftFormControl,
      room: this.roomFormControl,
    });

    /**
     * SEARCH TEACHER
     */
    this.TeacherFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.teacherSearching = true),
        debounceTime(1000),
        switchMap(async search => {
          let filter = {
            department: this.departmentId,
            name: search
          }
          let res = await this.getTeacherByDepartmentId(this.pageSize, this.pageIndex, filter);
          return res;
        }),
        // delay(500)
      )
      .subscribe(filtered => {
        this.teacherSearching = false;
        // this.filteredTeachers.next(filtered);
      }, error => {
        this.teacherSearching = false;
        console.log(error);
      });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.classroomForm.controls[controlName].hasError(errorName);
  }

  getShiftFree() {
    this.isLoadingShift = true;
    this.getTeacherFreeShifts(this.local_data.date.year,
                              this.local_data.date.group,
                              this.local_data.date.semesters,
                              this.local_data.date.day,
                              this.local_data.teacherId._id);
  }

  getRoomFree() {
    this.isLoadingRoom = true;
    this.getFreeRooms(this.local_data.date.year,
                      this.local_data.date.group,
                      this.local_data.date.semesters,
                      this.local_data.date.day,
                      this.local_data.date.shift,
                      this.local_data.students);
  }

  doAction() {

    // let newData = {
    //   id: this.local_data._id,
    //   name: this.local_data.name,
    //   capacity: this.local_data.capacity,
    //   location: {
    //     building: this.local_data.location.building,
    //     floor: this.local_data.location.floor
    //   },
    //   roomType: this.local_data.roomType,
    // }

    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'cancel' });
  }

  getCourseDataById(id) {
    this.courseApi.getCourse(id).subscribe( result => {
      this.departmentId = result.data.department._id;
      let filter = {
        department: this.departmentId
      };

      this.getTeacherByDepartmentId(this.pageSize, this.pageIndex, filter);
    }, error => {
      console.log(error);

    })
  }

  getTeacherByDepartmentId(pageSize: number, pageIndex: number, filter?: any) {

    return new Promise((resolve, reject) => {
      this.teacherApi.getTeachers(pageSize, pageIndex, filter).subscribe(result => {

        this.teacherList = result.data;
        resolve(result.data);
      }, error => {
        reject(error);
      })
    })
  }

  getTeacherFreeShifts(year, group, semester, day, teacherId) {
    this.getFreeApi.getTeacherFreeShifts(year, group, semester, day, teacherId).pipe(debounceTime(5000)).subscribe(result => {
      this.shiftList = result.data;
      this.isLoadingShift = false;
    }, error => {
      console.log(error);

    })
  }

  getFreeRooms(year, group, semester, day, shift, students) {
    this.getFreeApi.getFreeRoom(year, group, semester, day, shift, students).pipe(debounceTime(5000)).subscribe(result => {
      this.roomList = result.data;
      this.isLoadingRoom = false;
    }, error => {
      console.log(error);

    })
  }

  tranformToVn(data) {
    switch (data) {
      case 'Monday': return 'Thứ Hai';
      case 'Tuesday': return 'Thứ Ba';
      case 'Wednesday': return 'Thứ Tư';
      case 'Thursday': return 'Thứ Năm';
      case 'Friday': return 'Thứ Sáu';
      case 'Saturday': return 'Thứ Bảy';
      case 'Sunday': return 'Chủ Nhật';
    }
  }

}

