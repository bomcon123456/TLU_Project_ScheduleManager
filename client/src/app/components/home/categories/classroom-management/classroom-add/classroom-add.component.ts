import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DepartmentApiService } from './../../../../../services/department-api.service';
import { TeacherApiService } from './../../../../../services/teacher-api.service';
import { RoomApiService } from './../../../../../services/room-api.service';
import { StorageService } from '../storage/storage.service'
import { CourseElement, TeacherElement, RoomElement } from '../../../interface/dialog-data';
import { DAYS, SHIFTS } from '../storage/data-storage'




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

  private yearSelected: string;

  private isLoading: boolean;
  private isFisrtTime: boolean;
  private isChildDone: boolean;
  private isCreateClassDone: boolean;
  private isLastClass: boolean;
  private isTypeInvalid: boolean;

  private index: number;
  private pageSize: number;
  private pageIndex: number;
  private theoryWeek: number;
  private practiceWeek: number;
  private numOfClass: number;
  private countClass: number

  undefined = "1-1";

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
              private route: Router,
              private departmentApi: DepartmentApiService,
              private teacherApi: TeacherApiService,
              private roomApi: RoomApiService,
              private storageService: StorageService,
              private toastr: ToastrService) {

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
    this.isTypeInvalid = false;

    this.theoryWeek = null;
    this.practiceWeek = null;
    this.numOfClass = null;
    this.countClass = null;

    this.timeTotal = {
      theory: null,
      practice: null
    }

    const id = '5d833af963c4343292d1733a';

    this.getClassroomsData();
    this.getCoursesByDepartmentId(id, this.pageSize, this.pageIndex);
    this.getTeacherByDepartmentId(this.pageSize, this.pageIndex);
    this.getRooms(this.pageSize, this.pageIndex);
  }

  /**
   * SET
   */

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
      this.theoryWeek = this.timeTotal.theory;
      this.practiceWeek = this.timeTotal.practice;
      console.log(this.parentClass);

    }
    else {
      this.parentClass[this.countClass - 1] = this.ELEMENT_DATA;
      this.ELEMENT_DATA = this.parentClass[this.countClass];

      let array = this.unfinished.filter( data => {

        if ( (this.countClass + 1) == data.indexClass ) {
          this.theoryWeek = data.theoryLeft;
          this.practiceWeek = data.practiceLeft;
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
    this.isTypeInvalid = true;

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


    if (this.theoryWeek != 0 || this.practiceWeek != 0) {

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

  setCourseSelected(event) {
    this.isChildDone = true;
    this.isTypeInvalid = true
    this.numOfClass = null;
    this.countClass = null;
    this.courseSelected = event.value;
    this.getHoursOfWeek(event.value.length.theory, event.value.length.practice);
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

  getHoursOfWeek(theory, practice) {

    this.getTheoryHours(theory);
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

  addChildClass() {

    this.isChildDone = false;
    this.isTypeInvalid = false;

    let temp = {
      name: this.courseSelected.name,
      students: null,
      type: '',
      teacher: {
        _id: '',
        name: '',
      },
      date: {
        day: '',
        shift: ''
      },
      room: {
        _id: '',
        name: ''
      }
    };

    this.ELEMENT_DATA.push(temp);
    this.getClassroomsData();

  }

  deleteChildClass(index: number) {

    this.ELEMENT_DATA.splice(index, 1);
    this.theoryWeek = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
    this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');

    if ( (this.ELEMENT_DATA.length == 0) || (index == this.ELEMENT_DATA.length) ) {

      this.isChildDone = true;
      this.isTypeInvalid = true;
    }
    this.getClassroomsData();
  }

  addClass() {
    this.parentClass.push(this.ELEMENT_DATA);
    this.route.navigate(['/classroom-management']);

  }

  takeTimeLeft(time, array, type) {

    for (let i = 0; i < array.length; i++) {
      if (array[i].type == type) {

        let temp = array[i].date.shift;
        let indexCut = temp.indexOf('-');

        if (indexCut == -1) {
          time = time;
        }
        else {
          let startShift = parseInt(temp.substring(0, indexCut));
          let endShift = parseInt(temp.substring(indexCut + 1));
          time = time - (endShift - startShift + 1);
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

        this.ELEMENT_DATA[index].type = data;

        this.isTypeInvalid = true;

        switch (data) {
          case 'LT': {

            if ( this.theoryWeek==0 && this.timeTotal.theory==0 ) {

              this.isTypeInvalid = false;
            }
            return;
          };
          case 'TH': {

            if ( this.practiceWeek==0 && this.timeTotal.practice==0 ) {

              this.isTypeInvalid = false;
            }
            return;
          };
          case 'TC': {

            this.isTypeInvalid = false;
            return;
          }
        }
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

        if ( this.theoryWeek == 0 && this.practiceWeek == 0 ) {
          this.isCreateClassDone = true;
        }

        return;
      };
      case 'shift': {

        this.ELEMENT_DATA[index].date.shift = data;

        switch (this.ELEMENT_DATA[index].type) {
          case 'LT': {

            let timeLeft = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');

            if (timeLeft >= 0) {
              this.theoryWeek = timeLeft;
            }
            else {
              this.ELEMENT_DATA[index].date.shift = '';
              this.theoryWeek = this.takeTimeLeft(this.timeTotal.theory, this.ELEMENT_DATA, 'LT');
            }
            return;
          };
          case 'TH': {

            let timeLeft = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');

            if (timeLeft >= 0) {
              this.practiceWeek = timeLeft;
            }
            else {
              this.ELEMENT_DATA[index].date.shift = '';
              this.practiceWeek = this.takeTimeLeft(this.timeTotal.practice, this.ELEMENT_DATA, 'TH');
            }
            return;
          };
          case 'TC': {
            this.ELEMENT_DATA[index].date.shift = '';
          }
        }


        return;
      }
    }
  }

  getClassroomsData() {
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
  }

  // default() {
    //   this.dataSource.paginator = null;
    //   this.dataSource.sort = this.sort;
    // }

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

  getTeacherByDepartmentId(pageSize: number, pageIndex: number) {
    this.teacherApi.getTeachers(pageSize, pageIndex).subscribe(result => {
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

  updateDepartment(row_obj) {
    // this.courseApi.updateDepartment(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

    //   this.dataSource.data.filter((value, key) => {
    //     if (value._id == row_obj._id) {
    //       value = Object.assign(value, row_obj);
    //     }
    //     return true;
    //   });
    //   this.toastr.success(result.message);
    // }, error => {
    //   this.toastr.error(error.message);
    // })

  }

  deleteDepartment(row_obj) {
    // this.courseApi.deleteDepartment(row_obj._id).subscribe(result => {

    //   this.dataSource.data = this.dataSource.data.filter(item => {

    //     return item._id != row_obj._id;
    //   });
    //   this.toastr.success(result.message);
    // }, error => {
    //   this.toastr.error(error.message);
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

const ELEMENT_DATA = [
  { name: 'Hydrogen', students: 20, type: 'Thực hành', teacher: { _id: '12345678', name: 'Nguyễn Văn A' }, date: { day: '40', shift: '2' }, room: { _id: '123456789', name: 'A303'} },
];

