import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { debounceTime, delay, tap, filter, switchMap } from 'rxjs/operators'
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as jwt_decode from 'jwt-decode';

import { DepartmentApiService } from './../../../../../services/department-api.service';
import { TeacherApiService } from './../../../../../services/teacher-api.service';
import { RoomApiService } from './../../../../../services/room-api.service';
import { CourseApiService } from './../../../../../services/course-api.service';
import { GetFreeApiService } from './../../../../../services/get-free-api.service';
import { ClassroomApiService } from './../../../../../services/classroom-api.service';
import { StorageService } from '../../../storage/storage.service';
import { CourseElement, TeacherElement, RoomElement } from '../../../interface/dialog-data';
import { DAYS, SHIFTS } from '../../../storage/data-storage';
import { genClassroomName } from './helpers/gen-classroom-name';




/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-classroom-add',
  templateUrl: './classroom-add.component.html',
  styleUrls: ['./classroom-add.component.scss']
})
export class ClassroomAddComponent implements OnInit {

  public displayedColumns: string[] = ['position','name', 'students', 'type', 'teacher', 'day', 'shift', 'room'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  private days = DAYS;
  private shifts: any;
  // private shifts = SHIFTS;

  public dataSource = null;
  public parentClass: any[];
  private courseSelectedList: any[];

  private coursesList: CourseElement[];
  private teacherList: TeacherElement[];
  private roomList: RoomElement[];

  private ELEMENT_DATA: any;
  private courseSelected: any;
  private timeTotal: any;
  private semesterSelected: any;
  private unfinished: any[];
  private dataUser: any;

  private yearSelected: string;

  private isLoading: boolean;
  private isCourseFisrtTime: boolean;
  private isTeacherFisrtTime: boolean;
  private isChildDone: boolean;
  private isCreateClassDone: boolean;
  private isLastClass: boolean;
  private courseSearching: boolean;
  private teacherSearching: boolean;
  private isLoadingShift: boolean;
  private isLoadingRoom: boolean;

  private index: number;
  private pageSize: number;
  private pageIndex: number;
  private theoryWeek: number;
  private practiceWeek: number;
  private combinedWeek: number;
  private numOfClass: number;
  private countClass: number

  public CourseCtrl: FormControl = new FormControl();
  public CourseFilteringCtrl: FormControl = new FormControl();
  public filteredCourses: ReplaySubject<any> = new ReplaySubject<any>(1);

  public TeacherFilteringCtrl: FormControl = new FormControl();
  // public filteredTeachers: ReplaySubject<any> = new ReplaySubject<any>(2);


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
              private route: Router,
              private departmentApi: DepartmentApiService,
              private teacherApi: TeacherApiService,
              private roomApi: RoomApiService,
              private courseApi: CourseApiService,
              private getFreeApi: GetFreeApiService,
              private classroomApi: ClassroomApiService,
              private storageService: StorageService,
              private toastr: ToastrService) {

      let token = JSON.parse(localStorage.getItem('currentUser'));
      this.dataUser = jwt_decode(token.token);

      this.yearSelected = '2019-2020';
      this.semesterSelected = {
        key: {
          semester: "Semester 1",
          group: "Group 1"
        },
        value: "Học kì I Nhóm 1"
      }
      this.courseSelectedList = [];

      if ( this.storageService.yearSelected ) {

        this.getYearSelected();
        this.getSemesterSelected();
      }

  }

  ngOnInit() {

    this.isCreateClassDone = false;
    this.isTeacherFisrtTime = true;
    this.isCourseFisrtTime = true;
    this.isLoading = false;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.setToDefault();
    // this.isTypeInvalid = false;

    /**
     * SEARCH COURSE
     */
    this.CourseFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.courseSearching = true),
        debounceTime(1000),
        switchMap(async search => {
          let filter;
          if ( this.dataUser.role == 99 ) {
            filter = {
              name: search
            }
          }
          else {
            filter = {
              department: this.dataUser.department,
              name: search
            }
          }
          let res = await this.getCoursesByDepartmentId(this.pageSize, this.pageIndex, filter);
          return res;
        }),
        // delay(500)
      )
      .subscribe(filtered => {
        this.courseSearching = false;
        this.filteredCourses.next(filtered);
      }, error => {
          this.courseSearching = false;
        console.log(error);
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
          let filter;
          if (this.dataUser.role == 99) {
            filter = {
              name: search
            }
          }
          else {
            filter = {
              department: this.dataUser.department,
              name: search
            }
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


    console.log(this.dataUser);

    if ( this.dataUser.role == 99 ) {
      this.getCoursesByDepartmentId(this.pageSize, this.pageIndex);
      this.getTeacherByDepartmentId(this.pageSize, this.pageIndex);
    }
    else {
      let filter = {
        department: this.dataUser.department,
      }
      this.getCoursesByDepartmentId(this.pageSize, this.pageIndex, filter);
      this.getTeacherByDepartmentId(this.pageSize, this.pageIndex, filter);

    }

    this.getClassroomsData();
    // this.getRooms(this.pageSize, this.pageIndex);
  }

  /**
   * SET
   */

  setToDefault() {

    this.theoryWeek = null;
    this.practiceWeek = null;
    this.combinedWeek = null;
    this.numOfClass = null;
    this.countClass = null;
    this.timeTotal = {};
    this.parentClass = [];
    this.unfinished = [];
    this.isLastClass = false;
    this.isLoadingShift = false;
    this.isLoadingRoom = false;
  }

  setNumOfClass(value) {

    if ( value ) {

      this.countClass = 1;
      this.numOfClass = value;
      this.isLastClass = false;

      if ( this.countClass == this.numOfClass ) {
        this.isLastClass = true;
      }
    }
    else {
      this.numOfClass = null;

    }
  }

  setNextClass() {


    if ( !this.parentClass[this.countClass - 1] ) {

      this.parentClass.push(this.ELEMENT_DATA);
      this.ELEMENT_DATA = [];
      this.isCreateClassDone = false;

      if ( this.timeTotal.combined ) {
        this.combinedWeek = this.timeTotal.combined;
      }
      else {

        this.theoryWeek = this.timeTotal.theory;
        this.practiceWeek = this.timeTotal.practice;
      }
    }
    else {
      this.parentClass[this.countClass - 1] = this.ELEMENT_DATA;
      this.ELEMENT_DATA = this.parentClass[this.countClass];

      let array = this.unfinished.filter( data => {

        if ( (this.countClass + 1) == data.indexClass ) {

          this.isCreateClassDone = false;

          if ( data.combinedLeft ) {
            this.combinedWeek = data.combinedLeft;
          }
          else {

            this.theoryWeek = data.theoryLeft;
            this.practiceWeek = data.practiceLeft;
          }
        }
        else {
          return data;
        }
      })

      this.unfinished = array;
    }

    console.log(this.parentClass);


    this.countClass += 1;

    if ( this.countClass == this.numOfClass ) {
      this.isLastClass = true;
    }

    this.getClassroomsData();
  }

  setPreClass() {

    this.countClass -= 1;
    this.isCreateClassDone = true
    // this.isTypeInvalid = true;

    if ( this.isLastClass ) {
      this.isLastClass = false;
    }

    if ( !this.parentClass[this.countClass] ) {

      this.parentClass.push(this.ELEMENT_DATA);
    }
    else {

      this.parentClass[this.countClass] = this.ELEMENT_DATA;
    }

    this.ELEMENT_DATA = this.parentClass[this.countClass-1];

    if ( this.combinedWeek > 0 ) {

      let obj = {
        indexClass: this.countClass + 1,
        combinedLeft: this.combinedWeek
      }

      this.unfinished.push(obj);
      this.combinedWeek = 0;
    }
    else if (this.theoryWeek > 0 || this.practiceWeek > 0) {

      let obj = {
        indexClass: this.countClass + 1,
        theoryLeft: this.theoryWeek,
        practiceLeft: this.practiceWeek
      }

      this.unfinished.push(obj);
      this.theoryWeek = 0;
      this.practiceWeek = 0;
    }

    this.getClassroomsData();
  }

  setCourseSelected(data) {

    this.setToDefault();
    this.isChildDone = true;

    this.ELEMENT_DATA = [];
    this.getClassroomsData();

    // this.isTypeInvalid = true
    this.courseSelected = data;
    this.courseSelectedList.push(data);
    this.getHoursOfWeek(data.length);
  }

  /**
   * GET, ACTION
   */

  getYearSelected() {
    this.yearSelected = this.storageService.yearSelected;
  }

  getSemesterSelected() {
    this.semesterSelected = this.storageService.semesterSelected;
  }

  getHoursOfWeek(length: any) {

    if ( length.combined != 0 ) {

      this.getCombinedHours(length.combined);
    }
    else {

      this.getTheoryHours(length.theory);
      this.getPracticeHours(length.practice);
    }
  }

  getTheoryHours(theory) {
    if (theory == 0) {
      this.timeTotal.theory = this.theoryWeek = 0;
      return;
    }
    else {
      if (theory % 10 == 0) {
        this.timeTotal.theory = this.theoryWeek = theory / 10;
        return;
      }
      else {
        this.timeTotal.theory = this.theoryWeek = theory / 9;
        return;
      }
    }
  }

  getPracticeHours(practice) {
    if (practice == 0) {
      this.timeTotal.practice = this.practiceWeek = 0;
      return;
    }
    else {
      if (practice % 10 == 0) {
        this.timeTotal.practice = this.practiceWeek = practice / 10;
        return;
      }
      else {
        this.timeTotal.practice = this.practiceWeek = practice / 9;
        return;
      }
    }
  }

  getCombinedHours(combined) {
    if (combined % 9 == 0) {

      this.timeTotal.combined = this.combinedWeek = combined / 9;
      return;
    }
    else {

      this.timeTotal.combined = this.combinedWeek = combined / 10;
      return;
    }
  }

  // checkShiftCanChoose(shift) {
  //   let indexCut = shift.indexOf('-');
  //   let startShift = parseInt(shift.substring(0, indexCut));
  //   let endShift = parseInt(shift.substring(indexCut + 1));
  //   let time = endShift - startShift + 1;

  //   if ( this.theoryWeek >= time || this.practiceWeek >= time || this.combinedWeek >= time ) {
  //     return false;
  //   }
  //   return true;
  // }

  checkShiftValid(index, shift) {

    let shiftObj = this.shiftTranform(shift);
    if ( this.parentClass.length > 0 ) {
      for (let i = 0; i < this.parentClass.length; i++) {
        let classData = this.parentClass[i];
        for (let x = 0; x < classData.length; x++) {
          if (this.ELEMENT_DATA[index].teacher._id == classData[x].teacher._id) {
            if (this.ELEMENT_DATA[index].date.day == classData[x].date.day) {
              if ( classData[x].date.shift ) {
                let shiftClassObj = this.shiftTranform(classData[x].date.shift)

                if ((shiftObj.startShift >= shiftClassObj.startShift &&
                  shiftObj.startShift <= shiftClassObj.endShift) ||
                    (shiftObj.endShift >= shiftClassObj.startShift &&
                    shiftObj.endShift <= shiftClassObj.endShift)) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    for ( let i = 0; i < this.ELEMENT_DATA.length; i++) {

      if ( index != i ) {
        if ( this.ELEMENT_DATA[index].teacher._id == this.ELEMENT_DATA[i].teacher._id ) {
          if ( this.ELEMENT_DATA[index].date.day == this.ELEMENT_DATA[i].date.day ) {
            if (this.ELEMENT_DATA[i].date.shift) {
              let shiftClassObj = this.shiftTranform(this.ELEMENT_DATA[i].date.shift)

              if ((shiftObj.startShift >= shiftClassObj.startShift &&
                  shiftObj.startShift <= shiftClassObj.endShift) ||
                  (shiftObj.endShift >= shiftClassObj.startShift &&
                  shiftObj.endShift <= shiftClassObj.endShift)) {
                    return true;
                  }
              // if ( !this.ELEMENT_DATA[index].date.shift ) {
              //   if ( shiftObj.startShift <= shiftClassObj.endShift ) {
              //     return true;
              //   }
              // }
              // else {
              //   if (( shiftObj.startShift < shiftClassObj.startShift &&
              //         shiftObj.endShift >= shiftClassObj.startShift ) ||
              //       ( shiftObj.startShift >= shiftClassObj.startShift &&
              //         shiftObj.startShift <= shiftClassObj.endShift)) {
              //     return true;
              //   }
              // }
            }
          }
        }
      }
    }

    if (!this.ELEMENT_DATA[index].date.shift) {

      if (this.theoryWeek >= shiftObj.time ||
          this.practiceWeek >= shiftObj.time ||
          this.combinedWeek >= shiftObj.time) {
        return false;
      }
    }
    else {

      let timeClass = this.shiftTranform(this.ELEMENT_DATA[index].date.shift);
      if (this.theoryWeek + timeClass.time >= shiftObj.time ||
        this.practiceWeek + timeClass.time >= shiftObj.time ||
        this.combinedWeek + timeClass.time >= shiftObj.time) {
        return false;
      }
    }

    return true;
  }

  checkRoomValid(index, roomId) {
    if ( !this.ELEMENT_DATA[index].date.shift ) {
      return;
    }
    let shiftClassObj = this.shiftTranform(this.ELEMENT_DATA[index].date.shift);
    if (this.parentClass.length > 0) {
      for (let x = 0; x < this.parentClass.length; x++) {
        let classData = this.parentClass[x];
        for (let y = 0; y < classData.length; y++) {
          if (this.ELEMENT_DATA[index].date.day == classData[y].date.day) {
            if (classData[y].date.shift) {
              let shiftObj = this.shiftTranform(classData[y].date.shift)

              if ((shiftClassObj.startShift >= shiftObj.startShift &&
                  shiftClassObj.startShift <= shiftObj.endShift) ||
                  (shiftClassObj.endShift >= shiftObj.startShift &&
                  shiftClassObj.endShift <= shiftObj.endShift)) {

                if ( roomId == classData[y].room._id ) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    for ( let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if ( i != index ) {

        if (this.ELEMENT_DATA[i].date.day == this.ELEMENT_DATA[index].date.day ) {
          if ( !this.ELEMENT_DATA[i].date.shift ) {
            return;
          }
          let shiftObj = this.shiftTranform(this.ELEMENT_DATA[i].date.shift);
          if ((shiftClassObj.startShift >= shiftObj.startShift &&
              shiftClassObj.startShift <= shiftObj.endShift) ||
              (shiftClassObj.endShift >= shiftObj.startShift &&
              shiftClassObj.endShift <= shiftObj.endShift)) {
            if ( roomId == this.ELEMENT_DATA[i].room._id ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  checkAllValid() {
    for ( let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if ( !this.ELEMENT_DATA[i].room._id ) {
        return false;
      }
    }
    return true;
  }

  addChildClass() {

    this.isChildDone = false;
    this.isCreateClassDone = false;
    // this.isTypeInvalid = false;

    let temp = {
      name: genClassroomName(this.courseSelected.name) + `.${this.countClass}`,
      students: null,
      course: {
        _id: this.courseSelected._id,
        name: this.courseSelected.name
      },
      room: {
        _id: null,
        name: null
      },
      teacher: {
        _id: null,
        name: null,
      },
      date: {
        shift: null,
        day: '',
      },
      type: null
    };

    this.ELEMENT_DATA.push(temp);
    this.getClassroomsData();

  }

  deleteChildClass(index: number) {

    let typeDelete = this.ELEMENT_DATA[index].type;
    this.ELEMENT_DATA.splice(index, 1);

    let originName = genClassroomName(this.courseSelected.name) + `.${this.countClass}`;
    let count = 0;
    let number = 1;

    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {

      if (this.ELEMENT_DATA[i].type == typeDelete) {
        count++;
      }
    }

    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {

      if (this.ELEMENT_DATA[i].type == typeDelete) {
        if (count == 1) {
          this.ELEMENT_DATA[i].name = originName + `_${typeDelete}`;
        }
        else if (count > 1) {
          this.ELEMENT_DATA[i].name = originName + `.${number}` + `_${typeDelete}`;
          number++;
        }
      }
    }


    if ( this.timeTotal.combined ) {
      this.combinedWeek = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
    }
    else {

      this.theoryWeek = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
      this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
    }

    if ( (this.ELEMENT_DATA.length == 0) || (index == this.ELEMENT_DATA.length) ) {

      this.isChildDone = true;
      // this.isTypeInvalid = true;
    }
    this.getClassroomsData();
  }

  addClass() {
    if ( this.parentClass[this.countClass-1] ) {
      this.parentClass[this.countClass-1] = this.ELEMENT_DATA;
    }
    else {
      this.parentClass.push(this.ELEMENT_DATA);
    }

    let allClass = [];
    for ( let x = 0; x < this.parentClass.length; x++) {
      let classData = this.parentClass[x];
      for ( let y = 0; y < classData.length; y++) {
        allClass.push(this.dataTranform(classData[y]));
      }
    }
    console.log(allClass);
    this.createClassroom(allClass);

    this.route.navigate(['/classroom-management']);

  }

  takeTimeLeft(time, array, type?: string) {

    if ( !type ) {

      for (let i = 0; i < array.length; i++) {
        let shift = array[i].date.shift;
        console.log(shift);

        if ( !shift ) {
          time = time;
        }
        else {
          let indexCut = shift.indexOf('-');
          let startShift = parseInt(shift.substring(0, indexCut));
          let endShift = parseInt(shift.substring(indexCut + 1));
          time = time - (endShift - startShift + 1);
        }
      }

    }
    else {

      for (let i = 0; i < array.length; i++) {
        if (array[i].type == type) {
          let shift = array[i].date.shift;
          console.log(shift);

          if ( !shift) {
            time = time;
          }
          else {
            let indexCut = shift.indexOf('-');
            let startShift = parseInt(shift.substring(0, indexCut));
            let endShift = parseInt(shift.substring(indexCut + 1));
            time = time - (endShift - startShift + 1);
          }
        }

      }
    }

    return time;
  }

  takeTimeLeftWhenReselect(index) {

    if (this.timeTotal.combined) {

      let timeLeft = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
      this.combinedWeek = timeLeft;
    }
    else {
      if (this.ELEMENT_DATA[index].type == 'LT') {
        let timeLeft = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
        this.theoryWeek = timeLeft;
      }
      else {
        let timeLeft;
        if (this.ELEMENT_DATA[index].type == 'TH') {
          timeLeft = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
        }
        else {
          timeLeft = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'BT');
        }
        this.practiceWeek = timeLeft;
      }
    }
  }

  handleWithData(data, index, elm) {

    switch (elm) {
      case 'type': {

        let oldType = this.ELEMENT_DATA[index].type;
        this.ELEMENT_DATA[index].type = data;

        let originName = genClassroomName(this.courseSelected.name) + `.${this.countClass}`;
        let numberNewType = 1;
        let numberOldType = 1
        let count = 0;

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
          if (i != index) {
            if (this.ELEMENT_DATA[i].type == oldType) {
              count++;
            }
          }
        }

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {

          if (i != index) {

            if (this.ELEMENT_DATA[i].type == data) {
              this.ELEMENT_DATA[i].name = originName + `.${numberNewType}` + `_${data}`;
              numberNewType++;
            }

            if (this.ELEMENT_DATA[i].type == oldType) {
              if (count == 1) {
                this.ELEMENT_DATA[i].name = originName + `_${oldType}`;
              }
              else if (count > 1) {
                this.ELEMENT_DATA[i].name = originName + `.${numberOldType}` + `_${oldType}`;
                numberOldType++;
              }
            }
          }
        }

        if (numberNewType != 1) {
          this.ELEMENT_DATA[index].name = originName + `.${numberNewType}` + `_${data}`;
        }
        else {
          this.ELEMENT_DATA[index].name = originName + `_${data}`;
        }

        break;
      };
      case 'teacher': {

        this.ELEMENT_DATA[index].date = {};
        this.ELEMENT_DATA[index].room = {};

        this.takeTimeLeftWhenReselect(index);

        this.teacherList.filter( result => {

          if ( data == result._id ) {

            this.ELEMENT_DATA[index].teacher = {
              _id: result._id,
              name: result.name
            }
          }
        })

        break;
      };
      case 'day': {

        this.ELEMENT_DATA[index].date = {};
        this.ELEMENT_DATA[index].room = {};

        this.takeTimeLeftWhenReselect(index);

        this.ELEMENT_DATA[index].date.day = data;

        this.isLoadingShift = true;
        this.shifts = null;

        this.getTeacherFreeShifts( this.yearSelected,
                                  this.semesterSelected.key.group,
                                  this.semesterSelected.key.semester,
                                  this.ELEMENT_DATA[index].date.day,
                                  this.ELEMENT_DATA[index].teacher._id);

        break;
      };
      case 'shift': {

        console.log(this.ELEMENT_DATA);


        this.ELEMENT_DATA[index].room = {};

        this.ELEMENT_DATA[index].date.shift = data;

        if (this.timeTotal.combined) {

          let timeLeft = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);

          if (timeLeft >= 0) {
            this.combinedWeek = timeLeft;

            if (this.combinedWeek == 0 && this.ELEMENT_DATA[index].room._id) {
              console.log(123, this.ELEMENT_DATA[index].room._id);

              this.isCreateClassDone = true;
            }

            // this.isLoadingRoom = true;
            // this.roomList = null;

            // this.getFreeRooms( this.yearSelected,
            //                   this.semesterSelected.key.group,
            //                   this.semesterSelected.key.semester,
            //                   this.ELEMENT_DATA[index].date.day,
            //                   this.ELEMENT_DATA[index].date.shift );

          }
          else {
            this.ELEMENT_DATA[index].date.shift = null;
            this.combinedWeek = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
          }

        }
        else {

          switch (this.ELEMENT_DATA[index].type) {
            case 'LT': {

              let timeLeft = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');

              if (timeLeft >= 0) {
                this.theoryWeek = timeLeft;

                if (this.theoryWeek == 0 && this.practiceWeek == 0 && this.ELEMENT_DATA[index].room._id) {
                  this.isCreateClassDone = true;
                }
              }
              else {
                this.ELEMENT_DATA[index].date.shift = null;
                this.theoryWeek = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
              }

              break;
            };
            case 'BT': {

              let timeLeft = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'BT');

              if (timeLeft >= 0) {
                this.practiceWeek = timeLeft;

                if (this.theoryWeek == 0 && this.practiceWeek == 0 && this.ELEMENT_DATA[index].room._id) {
                  this.isCreateClassDone = true;
                }
              }
              else {
                this.ELEMENT_DATA[index].date.shift = null;
                this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'BT');
              }

              break;
            };
            case 'TH': {

              let timeLeft = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');

              if (timeLeft >= 0) {
                this.practiceWeek = timeLeft;

                if (this.theoryWeek == 0 && this.practiceWeek == 0 && this.ELEMENT_DATA[index].room._id) {
                  this.isCreateClassDone = true;
                }
              }
              else {
                this.ELEMENT_DATA[index].date.shift = null;
                this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
              }

              break;
            };
            default: {
              this.ELEMENT_DATA[index].date.shift = null;
              break;
            }
          }
        }


        if ( this.ELEMENT_DATA[index].date.shift ) {

          this.isLoadingRoom = true;
          this.roomList = null;
          this.getFreeRooms(this.yearSelected,
            this.semesterSelected.key.group,
            this.semesterSelected.key.semester,
            this.ELEMENT_DATA[index].date.day,
            this.ELEMENT_DATA[index].date.shift);
        }
        console.log(this.ELEMENT_DATA);


        break;
      }
      case 'room': {

        this.isChildDone = true;

        this.roomList.filter( result => {

          if ( data == result._id ) {

            this.ELEMENT_DATA[index].room = {
              _id: result._id,
              name: result.name
            };
          }
        })

        if ( (this.theoryWeek == 0 && this.practiceWeek == 0) || this.combinedWeek == 0 ) {

          this.isCreateClassDone = true;
        }
        console.log(this.ELEMENT_DATA);

        break;
      };
    }
  }

  getClassroomsData() {
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
  }

  /**
   * CRUD
   */

  getCoursesByDepartmentId(pageSize: number, pageIndex: number, filter?: any) {

    return new Promise((resolve, reject) => {
      this.courseApi.getCourses(pageSize, pageIndex, filter).subscribe( result => {

        if ( this.isCourseFisrtTime ) {
          this.isCourseFisrtTime = false;
          this.filteredCourses.next(result.data);
        }
        resolve(result.data);
      }, error => {
        reject(error);
      })
    });

    // this.departmentApi.getCoursesById(id, pageSize, pageIndex).subscribe(result => {
    //   this.coursesList = result.data;
    // }, error => {
    //   console.log(error);

    // })
  }

  getTeacherByDepartmentId(pageSize: number, pageIndex: number, filter?: any) {

    return new Promise((resolve, reject) => {
      this.teacherApi.getTeachers(pageSize, pageIndex, filter).subscribe( result => {

        if ( this.isTeacherFisrtTime ) {
          this.isTeacherFisrtTime = false;
          // this.filteredTeachers.next(result.data);
          this.teacherList = result.data;
        }
        this.teacherList = result.data;
        resolve(result.data);
      }, error => {
        reject(error);
      })
    })

    // this.teacherApi.getTeachers(pageSize, pageIndex, filter).subscribe(result => {
    //   this.teacherList = result.data;
    // }, error => {
    //   console.log(error);

    // })
  }

  getTeacherFreeShifts(year, group, semester, day, teacherId) {
    this.getFreeApi.getTeacherFreeShifts(year, group, semester, day, teacherId).pipe(debounceTime(5000)).subscribe( result => {
      this.shifts = result.data;
      this.isLoadingShift = false;
    }, error => {
      console.log(error);

    })
  }

  getFreeRooms(year, group, semester, day, shift) {
    this.getFreeApi.getFreeRoom(year, group, semester, day, shift).pipe(debounceTime(5000)).subscribe( result => {
      this.roomList = result.data;
      console.log(2);

      this.isLoadingRoom = false;
    }, error => {
      console.log(error);

    })
  }

  createClassroom(data) {
    this.classroomApi.createClassroom(data).subscribe(result => {

      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData = {
      name: data.name,
      students: data.students,
      courseId: data.course._id,
      roomId: data.room._id,
      teacherId: data.teacher._id,
      date: {
        shift: data.date.shift,
        day: data.date.day,
        group: this.semesterSelected.key.group,
        semesters: this.semesterSelected.key.semester,
        year: this.yearSelected
      }
    }
    return newData;
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

  shiftTranform(shift) {

    let indexCut = shift.indexOf('-');
    let startShift = parseInt(shift.substring(0, indexCut));
    let endShift = parseInt(shift.substring(indexCut + 1));
    let obj = {
      startShift: startShift,
      endShift: endShift,
      time: endShift - startShift + 1
    }
    return obj;
  }

}
