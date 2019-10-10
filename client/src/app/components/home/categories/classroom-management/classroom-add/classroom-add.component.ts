import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { StorageService } from '../storage/storage.service';
import { CourseElement, TeacherElement, RoomElement } from '../../../interface/dialog-data';
import { DAYS, SHIFTS } from '../storage/data-storage';
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
  private shifts = SHIFTS;

  public dataSource = null;
  public parentClass: any[];

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
  private isFisrtTime: boolean;
  private isChildDone: boolean;
  private isCreateClassDone: boolean;
  private isLastClass: boolean;
  // private isTypeInvalid: boolean;

  private index: number;
  private pageSize: number;
  private pageIndex: number;
  private theoryWeek: number;
  private practiceWeek: number;
  private combinedWeek: number;
  private numOfClass: number;
  private countClass: number


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
              private route: Router,
              private departmentApi: DepartmentApiService,
              private teacherApi: TeacherApiService,
              private roomApi: RoomApiService,
              private courseApi: CourseApiService,
              private storageService: StorageService,
              private toastr: ToastrService) {

      let token = JSON.parse(localStorage.getItem('currentUser'));
      this.dataUser = jwt_decode(token.token);

      this.parentClass = [];
      this.unfinished = []
      this.isLastClass = false;

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

    this.isFisrtTime = true;
    this.isLoading = false;
    this.isCreateClassDone = false;
    // this.isTypeInvalid = false;

    this.setToDefault();

    this.pageSize = 5;
    this.pageIndex = 2;


    console.log(this.dataUser);

    if ( this.dataUser.role == 99 ) {

      this.courseApi.getCourses(this.pageSize, this.pageIndex).subscribe( result => {
        this.coursesList = result.data;

      }, error => {
        console.log(error);

      })
      this.teacherApi.getTeachers(this.pageSize, this.pageIndex).subscribe( result => {
        this.teacherList = result.data;

      }, error => {
        console.log(error);

      })
    }
    else {

      let departmentId = {
        department: this.dataUser.department,
      }

      this.getCoursesByDepartmentId(this.dataUser.department, this.pageSize, this.pageIndex);
      this.getTeacherByDepartmentId(this.pageSize, this.pageIndex, departmentId);

    }

    this.getClassroomsData();
    this.getRooms(this.pageSize, this.pageIndex);
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

    // this.isTypeInvalid = true
    this.setToDefault();
    this.isChildDone = true;
    this.courseSelected = data;
    this.getHoursOfWeek(data.length);

    this.ELEMENT_DATA = [];
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

  addChildClass() {

    this.isChildDone = false;
    // this.isTypeInvalid = false;

    let temp = {
      name: genClassroomName(this.courseSelected.name) + `.${this.countClass}`,
      students: null,
      type: null,
      teacher: {
        _id: null,
        name: null,
      },
      date: {
        day: null,
        shift: null
      },
      room: {
        _id: null,
        name: null
      }
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
    this.parentClass.push(this.ELEMENT_DATA);
    console.log(this.parentClass);

    this.route.navigate(['/classroom-management']);

  }

  takeTimeLeft(time, array, type?: string) {

    if ( !type ) {

      for (let i = 0; i < array.length; i++) {
        let shift = array[i].date.shift;
        let indexCut = shift.indexOf('-');

        if (indexCut == -1) {
          time = time;
        }
        else {
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
          let indexCut = shift.indexOf('-');

          if (indexCut == -1) {
            time = time;
          }
          else {
            let startShift = parseInt(shift.substring(0, indexCut));
            let endShift = parseInt(shift.substring(indexCut + 1));
            time = time - (endShift - startShift + 1);
          }
        }

      }
    }

    return time;
  }

  handleWithData(data, index, elm) {

    switch (elm) {
      case 'teacher': {

        this.teacherList.filter( result => {

          if ( data == result._id ) {

            this.ELEMENT_DATA[index].teacher = {
              _id: result._id,
              name: result.name
            }
          }
        })

        return;
      };
      case 'type': {

        let oldType = this.ELEMENT_DATA[index].type;
        this.ELEMENT_DATA[index].type = data;

        let originName = genClassroomName(this.courseSelected.name) + `.${this.countClass}`;
        let numberNewType = 1;
        let numberOldType = 1
        let count = 0;

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
          if ( i != index ) {
            if ( this.ELEMENT_DATA[i].type == oldType ) {
              count++;
            }
          }
        }

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {

          if ( i != index ) {

            if ( this.ELEMENT_DATA[i].type == data ) {
              this.ELEMENT_DATA[i].name = originName + `.${numberNewType}` + `_${data}`;
              numberNewType++;
            }

            if ( this.ELEMENT_DATA[i].type == oldType ) {
              if ( count == 1 ) {
                this.ELEMENT_DATA[i].name = originName + `_${oldType}`;
              }
              else if ( count > 1 ) {
                this.ELEMENT_DATA[i].name = originName + `.${numberOldType}` + `_${oldType}`;
                numberOldType++;
              }
            }
          }
        }

        if ( numberNewType != 1 ) {
          this.ELEMENT_DATA[index].name = originName + `.${numberNewType}` + `_${data}`;
        }
        else {
          this.ELEMENT_DATA[index].name = originName + `_${data}`;
        }

        return;

        // this.isTypeInvalid = true;

        // switch (data) {
          //   case 'LT': {

        //     if ( this.theoryWeek==0 && this.timeTotal.theory==0 ) {

        //       // this.isTypeInvalid = false;
        //     }
        //     return;
        //   };
        //   case 'BT':
        //   case 'TH': {

        //     if ( this.practiceWeek==0 && this.timeTotal.practice==0 ) {

        //       // this.isTypeInvalid = false;
        //     }
        //     return;
        //   };
        //   default: {

        //     // this.isTypeInvalid = false;
        //     return;
        //   }
        // }
      };
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

        return;
      };
      case 'shift': {

        this.ELEMENT_DATA[index].date.shift = data;

        if ( this.timeTotal.combined ) {

          let timeLeft = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);

          if ( timeLeft >= 0 ) {
            this.combinedWeek = timeLeft;

            if ( this.combinedWeek == 0 && this.ELEMENT_DATA[index].room._id ) {
              console.log(123, this.ELEMENT_DATA[index].room._id);

              this.isCreateClassDone = true;
            }
          }
          else {
            this.ELEMENT_DATA[index].date.shift = '';
            this.combinedWeek = this.takeTimeLeft(this.timeTotal.combined, this.ELEMENT_DATA);
          }

          return;
        }
        else {

          switch (this.ELEMENT_DATA[index].type) {
            case 'LT': {

              let timeLeft = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');

              if (timeLeft >= 0) {
                this.theoryWeek = timeLeft;

                if ( this.theoryWeek==0 && this.practiceWeek==0 && this.ELEMENT_DATA[index].room._id ) {
                  this.isCreateClassDone = true;
                }
              }
              else {
                this.ELEMENT_DATA[index].date.shift = '';
                this.theoryWeek = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
              }

              return;
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
                this.ELEMENT_DATA[index].date.shift = '';
                this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'BT');
              }

              return;
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
                this.ELEMENT_DATA[index].date.shift = '';
                this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
              }

              return;
            };
            default: {
              this.ELEMENT_DATA[index].date.shift = '';
            }
          }
        }

        return;
      }
    }
  }

  getClassroomsData() {
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
  }

  /**
   * CRUD
   */

  getCoursesByDepartmentId(id: string, pageSize: number, pageIndex: number) {
    this.departmentApi.getCoursesById(id, pageSize, pageIndex).subscribe(result => {
      this.coursesList = result.data;
    }, error => {
      console.log(error);

    })
  }

  getTeacherByDepartmentId(pageSize: number, pageIndex: number, departmentId: any) {
    this.teacherApi.getTeachers(pageSize, pageIndex, departmentId).subscribe(result => {
      this.teacherList = result.data;
    }, error => {
      console.log(error);

    })
  }

  getRooms(pageSize: number, pageIndex: number) {
    this.roomApi.getRooms(pageSize, pageIndex).subscribe(result => {
      this.roomList = result.data;
    }, error => {
      console.log(error);

    })
  }

  createDepartment(row_obj) {
    // this.courseApi.createDepartment(this.dataTranform(row_obj)).subscribe(result => {

    //   this.ELEMENT_DATA.unshift(row_obj);
    //   this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    //   this.default();
    //   this.toastr.success(result.message)
    // }, error => {
    //   this.toastr.error(error.message)
    // })
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData = {
      schoolId: data.schoolId,
      name: data.name,
    }
    return newData;
  }

  tranformToVn(data) {
    switch (data) {
      case 'monday': return 'Thứ Hai';
      case 'tuesday': return 'Thứ Ba';
      case 'wednesday': return 'Thứ Tư';
      case 'thursday': return 'Thứ Năm';
      case 'friday': return 'Thứ Sáu';
      case 'saturday': return 'Thứ Bảy';
      case 'sunday': return 'Chủ Nhật';
    }
  }

}
