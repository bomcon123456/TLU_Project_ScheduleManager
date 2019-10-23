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



@Component({
  selector: 'app-classroom-add',
  templateUrl: './classroom-add.component.html',
  styleUrls: ['./classroom-add.component.scss'],
})
export class ClassroomAddComponent implements OnInit {

  public displayedColumns: string[] = ['position','name', 'students', 'type', 'teacher', 'day', 'shift', 'room'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  private days = DAYS;
  // private shifts = SHIFTS;

  private coursesList: CourseElement[];
  private teacherList: TeacherElement[];

  public parentClass: any[];
  private unfinished: any[];
  private ELEMENT_DATA: any[];
  private roomChildClass: any[];
  private roomStorage: any[];
  private shiftChildClass: any[];
  private shiftStorage: any[];
  private timeTotal: any;
  public dataSource: any;
  private courseSelected: any;
  private dataUser: any;
  private semesterSelected: any;

  private yearSelected: string;
  private shiftEqualClass: string;

  private isCourseFisrtTime: boolean;
  private isTeacherFisrtTime: boolean;
  private isChildDone: boolean;
  private isCreateClassDone: boolean;
  private isLastClass: boolean;
  private courseSearching: boolean;
  private teacherSearching: boolean;
  private isCheckedCombine: boolean;
  private isNeedEqual: boolean;

  private pageSize: number;
  private pageIndex: number;
  private theoryWeek: number;
  private practiceWeek: number;
  private combinedWeek: number;
  private numOfClass: number;
  private countClass: number;
  private maxStudents: number;

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

      if ( this.storageService.yearSelected ) {

        this.getYearSelected();
        this.getSemesterSelected();
      }

  }

  ngOnInit() {

    this.setToDefaultFirstTime();
    this.setToDefault();
    this.setToDefaultNewClass();
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


    /**
     * CHECK ROLE
     */
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

    /**
     * GET DATA
     */
    this.getClassroomsData();

  }

  /**
   * SET
   */
  setToDefaultFirstTime() {
    this.isCheckedCombine = false;
    this.isTeacherFisrtTime = true;
    this.isCourseFisrtTime = true;
    this.pageIndex = 1;
    this.pageSize = 10;
  }

  setToDefault() {
    this.parentClass = [];
    this.unfinished = [];
    this.ELEMENT_DATA = [];
    this.roomStorage = [];
    this.roomChildClass = [];
    this.shiftStorage = [];
    this.shiftChildClass = [];
    this.timeTotal = {};
    this.isLastClass = false;
  }

  setToDefaultNewClass() {
    this.shiftEqualClass = null;
    this.isChildDone = true;
    this.isCreateClassDone = false;
    this.isNeedEqual = false;
    this.theoryWeek = null;
    this.practiceWeek = null;
    this.combinedWeek = null;
    this.maxStudents = null;
  }

  setCourseSelected(data) {

    /**
     * SET DEFAULT ELEMEMT
     */
    this.setToDefault();
    this.setToDefaultNewClass();
    this.numOfClass = null;
    this.countClass = null;
    this.isCheckedCombine = false;
    this.courseSelected = data;

    this.checkedCombineClass(this.isCheckedCombine);
    this.getClassroomsData();
  }

  setNumOfClass(value) {

    this.setToDefault();
    this.setToDefaultNewClass();
    this.getHoursOfWeek(this.courseSelected.length);
    if ( value ) {
      this.countClass = 1;
      this.numOfClass = value;
      if ( this.countClass == this.numOfClass ) {
        this.isLastClass = true;
      }
    }
    else {
      this.numOfClass = null;
    }
    this.getClassroomsData();

  }

  checkedCombineClass(checked) {

    this.setToDefault();
    this.setToDefaultNewClass();
    this.isCheckedCombine = checked;
    if ( checked == true ) {
      let length = {
        theory: 0,
        practice: 0,
        combined: this.courseSelected.length.theory
                  + this.courseSelected.length.practice
                  + this.courseSelected.length.combined
      }
      this.getHoursOfWeek(length);
    }
    else {
      this.getHoursOfWeek(this.courseSelected.length);
    }
    this.getClassroomsData();
  }

  isDisabledCheckedCombineClass() {
    if ( this.courseSelected ) {
      if ((this.courseSelected.length.combined == 0 &&
          (this.courseSelected.length.theory == 0 ||
          this.courseSelected.length.practice == 0)) ||
          this.courseSelected.length.combined > 0 ) {
            return true;
      }
      if ( this.countClass != 1 ) {
        return true;
      }
    }
    else {
      return true;
    }
    return false;
  }

  createNewClass() {
    this.ELEMENT_DATA = [];
    this.roomChildClass = [];
    this.shiftChildClass = [];
    this.setToDefaultNewClass();

    if (this.timeTotal.combined) {
      this.combinedWeek = this.timeTotal.combined;
    }
    else {

      this.theoryWeek = this.timeTotal.theory;
      this.practiceWeek = this.timeTotal.practice;
    }
  }

  setNextClass() {
    if ( !this.parentClass[this.countClass - 1] ) {

      this.parentClass.push(this.ELEMENT_DATA);
      this.roomStorage.push(this.roomChildClass);
      this.shiftStorage.push(this.shiftChildClass);
      this.createNewClass();
    }
    else {

      this.parentClass[this.countClass - 1] = this.ELEMENT_DATA;
      this.roomStorage[this.countClass - 1] = this.roomChildClass;
      this.shiftStorage[this.countClass - 1] = this.shiftChildClass;

      if ( !this.parentClass[this.countClass] ) {
        this.createNewClass();
      }
      else {
        this.ELEMENT_DATA = this.parentClass[this.countClass];
        this.roomChildClass = this.roomStorage[this.countClass];
        this.shiftChildClass = this.shiftStorage[this.countClass];
        this.setToDefaultNewClass();
        this.isCreateClassDone = true;
        if ( this.combinedWeek ) {
          this.combinedWeek = 0;
        }
        else {
          this.theoryWeek = 0;
          this.practiceWeek = 0;
        }

        let array = this.unfinished.filter( data => {
          if ( (this.countClass + 1) == data.indexClass ) {
            this.isCreateClassDone = false;
            if ( data.combinedLeft ) {
              this.combinedWeek = data.combinedLeft;
            }
            else if ( data.theoryLeft || data.practiceLeft ) {
              this.theoryWeek = data.theoryLeft;
              this.practiceWeek = data.practiceLeft;
            }

            if ( data.maxStudents ) {
              this.maxStudents = data.maxStudents;
              this.shiftEqualClass = data.shiftEqualClass;
              this.isNeedEqual = true;
            }
          }
          else {
            return data;
          }
        })
        this.unfinished = array;
      }
    }

    this.countClass += 1;
    if ( this.countClass == this.numOfClass ) {
      this.isLastClass = true;
    }

    this.getClassroomsData();
  }

  checkUnfinishedClass() {
    let isUnfinished = false;
    if (this.combinedWeek > 0) {
      isUnfinished = true;
      let obj = {
        indexClass: this.countClass + 1,
        combinedLeft: this.combinedWeek
      }

      this.unfinished.push(obj);
      this.combinedWeek = 0;
    }
    else if (this.theoryWeek > 0 || this.practiceWeek > 0) {
      isUnfinished = true;
      let obj = {
        indexClass: this.countClass + 1,
        theoryLeft: this.theoryWeek,
        practiceLeft: this.practiceWeek
      }

      this.unfinished.push(obj);
      this.theoryWeek = 0;
      this.practiceWeek = 0;
    }

    if ( this.maxStudents && this.shiftEqualClass ) {
      if ( isUnfinished ) {
        let index = this.unfinished.length-1;
        this.unfinished[index].maxStudents = this.maxStudents;
        this.unfinished[index].shiftEqualClass = this.shiftEqualClass;
      }
      else {
        let obj = {
          indexClass: this.countClass + 1,
          maxStudents: this.maxStudents,
          shiftEqualClass: this.shiftEqualClass
        }
      }
    }
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
      this.roomStorage.push(this.roomChildClass);
      this.shiftStorage.push(this.shiftChildClass);
    }
    else {
      this.parentClass[this.countClass] = this.ELEMENT_DATA;
      this.roomStorage[this.countClass] = this.roomChildClass;
      this.shiftStorage[this.countClass] = this.shiftChildClass;
    }

    this.ELEMENT_DATA = this.parentClass[this.countClass-1];
    this.roomChildClass = this.roomStorage[this.countClass - 1];
    this.shiftChildClass = this.shiftStorage[this.countClass - 1];
    this.checkUnfinishedClass();

    // if ( this.combinedWeek > 0 ) {
    //   let obj = {
    //     indexClass: this.countClass + 1,
    //     combinedLeft: this.combinedWeek
    //   }

    //   this.unfinished.push(obj);
    //   this.combinedWeek = 0;
    // }
    // else if (this.theoryWeek > 0 || this.practiceWeek > 0) {
    //   let obj = {
    //     indexClass: this.countClass + 1,
    //     theoryLeft: this.theoryWeek,
    //     practiceLeft: this.practiceWeek
    //   }

    //   this.unfinished.push(obj);
    //   this.theoryWeek = 0;
    //   this.practiceWeek = 0;
    // }
    this.getClassroomsData();
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

  checkShiftValid(index, shift) {
    let shiftObj = this.shiftTranform(shift);

    // Check Shift In Parent Class
    if ( this.parentClass.length > 0 ) {

      for (let i = 0; i < this.parentClass.length; i++) {
        if ( this.countClass-1 != i ) {

          let classData = this.parentClass[i];
          for (let x = 0; x < classData.length; x++) {
            if (this.ELEMENT_DATA[index].teacher._id == classData[x].teacher._id) {

              if (this.ELEMENT_DATA[index].date.day == classData[x].date.day) {

                if ( classData[x].date.shift ) {

                  let shiftClassObj = this.shiftTranform(classData[x].date.shift)
                  if (( shiftObj.startShift >= shiftClassObj.startShift &&
                        shiftObj.startShift <= shiftClassObj.endShift ) ||
                      ( shiftObj.endShift >= shiftClassObj.startShift &&
                        shiftObj.endShift <= shiftClassObj.endShift ) ||
                      ( shiftObj.startShift <= shiftClassObj.startShift &&
                        shiftObj.endShift >= shiftClassObj.endShift )) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Check Shift In Current Class
    for ( let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if ( index != i ) {

        if ( this.ELEMENT_DATA[index].date.day == this.ELEMENT_DATA[i].date.day ) {

          if (this.ELEMENT_DATA[i].date.shift) {

            let shiftClassObj = this.shiftTranform(this.ELEMENT_DATA[i].date.shift)
            if (( shiftObj.startShift >= shiftClassObj.startShift &&
                  shiftObj.startShift <= shiftClassObj.endShift ) ||
                ( shiftObj.endShift >= shiftClassObj.startShift &&
                  shiftObj.endShift <= shiftClassObj.endShift ) ||
                ( shiftObj.startShift <= shiftClassObj.startShift &&
                  shiftObj.endShift >= shiftClassObj.endShift )) {

                  return true;
            }
          }
        }
      }
    }

    // Check Shift Of Equal Students
    if ( this.maxStudents && this.shiftEqualClass && this.ELEMENT_DATA[index].students != this.maxStudents ) {
      if ( this.shiftTranform(this.shiftEqualClass).time != shiftObj.time ) {

        return true;
      }
      return false;
    }

    // Check Current Shift
    if (!this.ELEMENT_DATA[index].date.shift) {
      if ( this.combinedWeek >= shiftObj.time ) {
        return false;
      }

      if ( this.ELEMENT_DATA[index].type == 'LT' ) {
        if ( this.theoryWeek >= shiftObj.time ) {
          return false;
        }
      }
      else {
        if ( this.practiceWeek >= shiftObj.time ) {
          return false
        }
      }
    }
    else {
      let timeClass = this.shiftTranform(this.ELEMENT_DATA[index].date.shift);
      if (this.combinedWeek + timeClass.time >= shiftObj.time) {
        return false;
      }

      if (this.ELEMENT_DATA[index].type == 'LT') {
        if (this.theoryWeek + timeClass.time >= shiftObj.time) {
          return false;
        }
      }
      else {
        if (this.practiceWeek + timeClass.time >= shiftObj.time) {
          return false
        }
      }
    }

    return true;
  }

  checkRoomValid(index, roomId) {
    if ( !this.ELEMENT_DATA[index].date.shift ) {
      return;
    }
    let shiftClassObj = this.shiftTranform(this.ELEMENT_DATA[index].date.shift);

    // Check Room In Parent Class
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

    // Check Room In Current Class
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
    // console.log(this.ELEMENT_DATA);
    for ( let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if ( !this.ELEMENT_DATA[i].room._id || !this.ELEMENT_DATA[i].students ) {
        return false;
      }
    }
    return true;
  }

  addChildClass() {

    this.isChildDone = false;
    this.isCreateClassDone = false;
    let nameClass = genClassroomName(this.courseSelected.name)
                    + `.${this.countClass}`;

    // Gen Class Name If Checked Combine
    if ( this.isCheckedCombine ) {
      if ( this.ELEMENT_DATA.length != 0 ) {
        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
          let name = nameClass + `.${i+1}`;
          this.ELEMENT_DATA[i].name = name;
        }
        nameClass = nameClass + `.${this.ELEMENT_DATA.length+1}`;
      }
    }

    // Declare New Child Class
    let temp = {
      name: nameClass,
      course: {
        _id: this.courseSelected._id,
        name: this.courseSelected.name
      },
      room: {},
      teacher: {},
      date: {},
    };

    let roomTemp = {
      isLoadingRoom: false,
      roomList: []
    }

    let shiftTemp = {
      isLoadingShift: false,
      shiftList: []
    }

    this.ELEMENT_DATA.push(temp);
    this.roomChildClass.push(roomTemp);
    this.shiftChildClass.push(shiftTemp);

    /**
     * CHANGE DATA IF STUDENTS NOT EQUAL
     */
    if (!this.checkStudentsEqual().isEqual && this.isNeedEqual) {
      let index = this.ELEMENT_DATA.length-1;
      if (this.checkStudentsEqual().studentsLT < this.checkStudentsEqual().studentsTH) {
        this.ELEMENT_DATA[index].type = 'LT';
        this.ELEMENT_DATA.filter( result => {
          if ( result.type == 'LT' ) {
            this.ELEMENT_DATA[index].name = result.name;
          }
        })
      }
      else {
        this.ELEMENT_DATA.filter( result => {
          if ( result.type == 'TH' ) {
            this.ELEMENT_DATA[index].type = 'TH';
            this.ELEMENT_DATA[index].name = result.name;
          }
          else if ( result.type == 'BT' ) {
            this.ELEMENT_DATA[index].type = 'BT';
            this.ELEMENT_DATA[index].name = result.name;
          }
        })
      }
    }
    this.getClassroomsData();

  }

  deleteChildClass(index: number) {

    let typeDelete = this.ELEMENT_DATA[index].type;
    this.ELEMENT_DATA.splice(index, 1);
    this.roomChildClass.splice(index, 1);
    this.shiftChildClass.splice(index, 1);
    let originName = genClassroomName(this.courseSelected.name) + `.${this.countClass}`;

    // Recalculate Time Left Of Week
    if (this.timeTotal.combined) {
      this.combinedWeek = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
    }
    else {
      let theory = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
      let practice = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
      this.theoryWeek = theory;
      this.practiceWeek = practice;
      if (theory < 0) {
        this.theoryWeek = 0;
      }
      if (practice < 0) {
        this.practiceWeek = 0;
      }

      if ( this.theoryWeek > 0 || this.practiceWeek > 0 ) {
        this.maxStudents = null;
        this.isNeedEqual = false;
        let newArr = this.ELEMENT_DATA.filter((elm, index) => {
          return index === this.ELEMENT_DATA.findIndex( result => {
            return result.name === elm.name;
          })
        });
        this.ELEMENT_DATA = newArr;
      }
    }

    // Regen Class Name
    if ( !this.maxStudents ) {
      if ( this.isCheckedCombine ) {
        if ( this.ELEMENT_DATA.length > 1 ) {
          for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
            let name = originName + `.${i + 1}`;
            this.ELEMENT_DATA[i].name = name;
          }
        }
        else if ( this.ELEMENT_DATA.length == 1 ) {
          this.ELEMENT_DATA[0].name = originName;
        }
      }
      else {
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
      }
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
      this.roomStorage[this.countClass-1] = this.roomChildClass;
      this.shiftStorage[this.countClass-1] = this.shiftChildClass;
    }
    else {
      this.parentClass.push(this.ELEMENT_DATA);
      this.roomStorage.push(this.roomChildClass);
      this.shiftStorage.push(this.shiftChildClass);
    }

    // Transform Data
    let allClass = {
      data: []
    };
    for ( let x = 0; x < this.parentClass.length; x++) {
      let classData = this.parentClass[x];
      for ( let y = 0; y < classData.length; y++) {
        allClass.data.push({...this.dataTranform(classData[y]), department: this.dataUser.department});
      }
    }
    console.log(allClass);
    this.createClassroom(allClass);

    this.route.navigate(['/classroom-management']);

  }

  takeTimeLeft(time, array, type?: string) {

    // Combined Time
    if ( !type ) {
      for (let i = 0; i < array.length; i++) {
        let shift = array[i].date.shift;
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

    // Another Time
    else {
      for (let i = 0; i < array.length; i++) {
        if (array[i].type == type) {
          let shift = array[i].date.shift;
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
    if ( !this.ELEMENT_DATA[index].type ) {
      return;
    }

    // Take Time Left
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

    // Remove Duplicate Element
    if (this.theoryWeek > 0 || this.practiceWeek > 0) {
      this.maxStudents = null;
      this.isNeedEqual = false;
      let newArr = this.ELEMENT_DATA.filter((elm, index) => {
        return index === this.ELEMENT_DATA.findIndex(result => {
          return result.name === elm.name;
        })
      });
      this.ELEMENT_DATA = newArr;
      this.getClassroomsData();
    }
  }

  haveTypeClass(index: number) {
    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if ( this.ELEMENT_DATA[i].type == 'TH' ) {
        return 'TH';
      }
      else if ( this.ELEMENT_DATA[i].type == 'BT' ) {
        return 'BT';
      }
    }
    return null;
  }

  getFilteredTeacherSelected() {
    let teacherSelectedList = this.ELEMENT_DATA.filter((element, index) => {
      return index == this.ELEMENT_DATA.findIndex( obj => {
        return JSON.stringify(obj.teacher) == JSON.stringify(element.teacher);
      })
    })

    return teacherSelectedList;
  }

  checkStudentsEqual() {
    if ( this.theoryWeek > 0 || this.practiceWeek > 0 || this.combinedWeek > 0 ) {
      this.isNeedEqual = false;
      return { isEqual: false };
    }
    else {

      let time = this.courseSelected.length;
      if ( (time.combined == 0 && ( time.theory == 0 || time.practice == 0)) || time.combined != 0 ) {
        this.isNeedEqual = false;
        return { isEqual: true };
      }
      else {
        if ( this.isCheckedCombine ) {
          this.isNeedEqual = false;
          return { isEqual: true };
        }
        else {
          let studentsLT = 0;
          let studentsTH = 0; // OR studentsBT
          this.ELEMENT_DATA.filter( result => {
            if ( result.students ) {
              if ( result.type == 'LT' ) {
                studentsLT += result.students;
              }
              else {
                studentsTH += result.students;
              }
            }
          });

          if ( studentsLT == studentsTH ) {
            this.isNeedEqual = false;
            return { isEqual: true };
          }
          else {
            this.isNeedEqual = true;
            if ( !this.maxStudents ) {
              if ( studentsLT > studentsTH ) {
                this.maxStudents = studentsLT;
              }
              else {
                this.maxStudents = studentsTH;
              }
            }
          }

          return {
            isEqual: studentsTH == studentsLT,
            studentsLT: studentsLT,
            studentsTH: studentsTH
          };
        }
      }
    }
  }

  handleWithData(data, index, elm) {

    switch (elm) {

      // ******************************************************************************************
      // ******************************************STUDENTS****************************************
      // ******************************************************************************************
      case 'students': {

        let temp = false;
        this.ELEMENT_DATA.filter((elm, index) => {
          this.ELEMENT_DATA.findIndex( (result, indexT) => {
            if ( indexT != index ) {
              if ( result.name === elm.name ) {
                temp = true;
              }
            }
          })
        })
        if ( this.maxStudents && temp ) {
          let total = this.maxStudents;
          this.ELEMENT_DATA.filter( result => {
            if ( this.ELEMENT_DATA[index].type == result.type ) {
              total -= result.students;
            }
          })
          if ( total < 0 ) {
            this.ELEMENT_DATA[index].students = data + total;
          }
          else {
            this.ELEMENT_DATA[index].students = data;
          }
        }
        else {
          this.ELEMENT_DATA[index].students = data;
        }

        this.ELEMENT_DATA[index].room = {};
        this.roomChildClass[index].roomList = null;

        if ( data ) {
          if ( this.ELEMENT_DATA[index].date.shift ) {
            this.roomChildClass[index].isLoadingRoom = true;
            this.getFreeRooms(index,
                              this.yearSelected,
                              this.semesterSelected.key.group,
                              this.semesterSelected.key.semester,
                              this.ELEMENT_DATA[index].date.day,
                              this.ELEMENT_DATA[index].date.shift,
                              this.ELEMENT_DATA[index].students);
          }
        }
        break;
      }

      // ******************************************************************************************
      // ******************************************TYPE********************************************
      // ******************************************************************************************
      case 'type': {

        this.ELEMENT_DATA[index].date.shift = null;
        this.ELEMENT_DATA[index].room = {};
        this.takeTimeLeftWhenReselect(index);

        // GET Shift Data
        if ( this.ELEMENT_DATA[index].date.day ) {
          this.shiftChildClass[index].isLoadingShift = true;
          this.shiftChildClass[index].shiftList = null;

          this.getTeacherFreeShifts(index,
                                    this.yearSelected,
                                    this.semesterSelected.key.group,
                                    this.semesterSelected.key.semester,
                                    this.ELEMENT_DATA[index].date.day,
                                    this.ELEMENT_DATA[index].teacher._id);
        }

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

      // *********************************************************************************************
      // ******************************************TEACHER********************************************
      // *********************************************************************************************
      case 'teacher': {
        this.ELEMENT_DATA[index].date = {};
        this.ELEMENT_DATA[index].room = {};

        if ( this.ELEMENT_DATA[index].teacher._id ) {
          this.takeTimeLeftWhenReselect(index);
        }

        this.teacherList.filter( result => {

          if ( data == result._id ) {

            this.ELEMENT_DATA[index].teacher = {
              _id: result._id,
              name: result.name
            }
          }
        })
        if ( this.ELEMENT_DATA.length > 1 ) {
          this.ELEMENT_DATA.filter( result => {
            if ( result.teacher._id ) {
              if (data == result.teacher._id) {
                this.ELEMENT_DATA[index].teacher = {
                  _id: result.teacher._id,
                  name: result.teacher.name
                }
              }
            }
          })
        }
        break;
      };

      // *****************************************************************************************
      // ******************************************DAY********************************************
      // *****************************************************************************************
      case 'day': {

        this.ELEMENT_DATA[index].date = {};
        this.ELEMENT_DATA[index].room = {};

        if ( this.ELEMENT_DATA[index].date.day ) {
          this.takeTimeLeftWhenReselect(index);
        }

        this.ELEMENT_DATA[index].date.day = data;

        // GET Shift Data
        this.shiftChildClass[index].isLoadingShift = true;
        this.shiftChildClass[index].shiftList = null;

        this.getTeacherFreeShifts( index,
                                  this.yearSelected,
                                  this.semesterSelected.key.group,
                                  this.semesterSelected.key.semester,
                                  this.ELEMENT_DATA[index].date.day,
                                  this.ELEMENT_DATA[index].teacher._id);

        // (!this.checkStudentsEqual().isEqual || this.checkStudentsEqual().isEqual) &&
        if ( this.isNeedEqual && !this.shiftEqualClass ) {

          this.ELEMENT_DATA.filter( (result, i) => {
            if ( index != i ) {
              if ( this.ELEMENT_DATA[index].name == result.name ) {
                this.shiftEqualClass = result.date.shift;
              }
            }
          });
        }

        break;
      };

      // *******************************************************************************************
      // ******************************************SHIFT********************************************
      // *******************************************************************************************
      case 'shift': {

        this.ELEMENT_DATA[index].room = {};
        this.ELEMENT_DATA[index].date.shift = data;

        // (!this.checkStudentsEqual().isEqual || this.checkStudentsEqual().isEqual) &&
        if (this.isNeedEqual) {
          this.roomChildClass[index].isLoadingRoom = true;
          this.roomChildClass[index].roomList = null;
          if (!this.ELEMENT_DATA[index].students) {
            this.roomChildClass[index].isLoadingRoom = false;
            this.toastr.error('Số lượng sinh viên không được để trống');
          }
          else {
            this.getFreeRooms(index,
              this.yearSelected,
              this.semesterSelected.key.group,
              this.semesterSelected.key.semester,
              this.ELEMENT_DATA[index].date.day,
              this.ELEMENT_DATA[index].date.shift,
              this.ELEMENT_DATA[index].students);
          }
          return;
        }

        // Combined Time
        if (this.timeTotal.combined) {

          let timeLeft = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
          if (timeLeft >= 0) {

            this.combinedWeek = timeLeft;
            if (this.combinedWeek == 0 && this.ELEMENT_DATA[index].room._id) {
              this.isCreateClassDone = true;
            }
          }
          else {
            this.ELEMENT_DATA[index].date.shift = null;
            this.combinedWeek = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
          }
        }

        // Another Time
        else {
          switch (this.ELEMENT_DATA[index].type) {

            // *******************************************************************************
            // ********************************Lý thuyết**************************************
            // *******************************************************************************
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

            // *****************************************************************************
            // ********************************Bài tập**************************************
            // *****************************************************************************
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

            // *******************************************************************************
            // ********************************Thực hành**************************************
            // *******************************************************************************
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

        // GET Room Data
        if (this.ELEMENT_DATA[index].date.shift) {
          this.roomChildClass[index].isLoadingRoom = true;
          this.roomChildClass[index].roomList = null;
          if (!this.ELEMENT_DATA[index].students) {
            this.roomChildClass[index].isLoadingRoom = false;
            this.toastr.error('Số lượng sinh viên không được để trống');
          }
          else {
            this.getFreeRooms(index,
                              this.yearSelected,
                              this.semesterSelected.key.group,
                              this.semesterSelected.key.semester,
                              this.ELEMENT_DATA[index].date.day,
                              this.ELEMENT_DATA[index].date.shift,
                              this.ELEMENT_DATA[index].students);
          }
        };

        break;
      };

      // *******************************************************************************************
      // ******************************************ROOM*********************************************
      // *******************************************************************************************
      case 'room': {

        this.isChildDone = true;
        this.roomChildClass[index].roomList.filter( result => {
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

        break;
      };
    }
  }

  getClassroomsData() {
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
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
  }

  getTeacherFreeShifts(index, year, group, semester, day, teacherId) {
    this.getFreeApi.getTeacherFreeShifts(year, group, semester, day, teacherId).pipe(debounceTime(5000)).subscribe( result => {
      this.shiftChildClass[index] = {
        isLoadingShift: false,
        shiftList: result.data
      }
      console.log(result.data);

    }, error => {
      console.log(error);

    })
  }

  getFreeRooms(index, year, group, semester, day, shift, students) {

    this.getFreeApi.getFreeRoom(year, group, semester, day, shift, students).pipe(debounceTime(5000)).subscribe( result => {

      this.roomChildClass[index] = {
        isLoadingRoom: false,
        roomList: result.data
      }
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
