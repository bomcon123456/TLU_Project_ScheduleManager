import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DepartmentApiService } from './../../../../../services/department-api.service';
import { TeacherApiService } from './../../../../../services/teacher-api.service';
import { RoomApiService } from './../../../../../services/room-api.service';
import { CourseElement, TeacherElement, RoomElement } from '../../../interface/dialog-data';



const days = [ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" ];
const shifts = [
  "1-1", "1-2", "1-3", "1-4", "1-5",
  "10-10", "10-11", "10-12", "10-13", "12-13",
  "2-2", "2-3", "2-5", "3-3", "3-4",
  "3-5", "4-4", "4-5", "5-5", "6-1",
  "6-6", "6-7", "6-8", "6-9", "7-1",
  "7-7", "7-8", "8-1", "8-1", "8-8",
  "8-9", "9-1", "9-9"
];

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

  public dataSource = null;
  private ELEMENT_DATA: any;
  private isLoading: boolean;
  private isFisrtTime: boolean;
  private isChildDone: boolean;
  private coursesList: CourseElement[];
  private teacherList: TeacherElement[];
  private roomList: RoomElement[];
  private index: number;
  private pageSize: number;
  private pageIndex: number;
  private theoryWeek: number;
  private practiceWeek: number;
  private course: any;
  public parentClass: any[];
  private childClass: any[];

  days: any;
  shifts: any;
  th = 5;
  lt = 5;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
              private departmentApi: DepartmentApiService,
              private teacherApi: TeacherApiService,
              private roomApi: RoomApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFisrtTime = true;
    this.isLoading = false;
    this.isChildDone = true;
    this.isChildDone = true;
    this.index = 0;
    this.pageIndex = 1;
    this.pageSize = 8;
    this.theoryWeek = null;
    this.practiceWeek = null;

    this.days = days;
    this.shifts = shifts;

    // this.childClass = {

    // }


    const id = '5d833af963c4343292d1733a';

    this.getDepartmentsData(this.pageSize, this.pageIndex);
    this.getCoursesByDepartmentId(id, this.pageSize, this.pageIndex);
    this.getTeacherByDepartmentId(this.pageSize, this.pageIndex);
    this.getRooms(this.pageSize, this.pageIndex);
  }

  async getPageEvent(event) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.getDepartmentsData(this.pageSize, this.pageIndex);
    // if ( !this.isLoading) {
    //   this.index = event.pageSize * event.pageIndex;
    // }
  }

  default() {
    this.dataSource.paginator = null;
    this.dataSource.sort = this.sort;
  }

  applySearch(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  courseSelected(event) {
    this.isChildDone = true;
    this.course = event.value;
    this.getHoursOfWeek(event.value.length.theory, event.value.length.practice);
    this.ELEMENT_DATA = [];

  }

  addChildClass() {

    this.isChildDone = false;

    let temp = {
      name: this.course.name,
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
    this.getDepartmentsData(1,1);

  }

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

  getIdNameFromData(data) {
    let result = {
      _id: data._id,
      name: data.name
    };
    return result;
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

  getDepartmentsData(pageSize: number, pageIndex: number) {
      // this.ELEMENT_DATA = ELEMENT_DATA;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
    // this.courseApi.getDepartments(pageSize, pageIndex).subscribe(result => {
    //   this.ELEMENT_DATA = result.data;
    //   this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
    //   this.default();
    //   this.index = pageSize * (pageIndex - 1);
    //   this.isLoading = false;

    //   if (this.isFisrtTime) {
    //     this.isFisrtTime = false;
    //     this.toastr.success(result.message);
    //   }
    // }, error => {
    //   this.toastr.error(error.message)
    // })
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

  dataTranform(data) {
    let newData = {
      schoolId: data.schoolId,
      name: data.name,
    }
    return newData;
  }

  getHoursOfWeek(theory, practice) {

    this.getTheoryHours(theory);
    if ( practice == 0) {
      return this.practiceWeek = 0;
    }
    else {
      if ( practice % 10 == 0) {
        return this.practiceWeek = practice/10;
      }
      else {
        return this.practiceWeek = practice/9;
      }
    }
  }

  getTheoryHours(theory) {
    if (theory == 0) {
      return this.theoryWeek = 0;
    }
    else {
      if (theory % 10 == 0) {
        return this.theoryWeek = theory / 10;
      }
      else {
        return this.theoryWeek = theory / 9;
      }
    }
  }


}

const ELEMENT_DATA = [
  { name: 'Hydrogen', students: 20, type: 'Thực hành', teacher: { _id: '12345678', name: 'Nguyễn Văn A' }, date: { day: '40', shift: '2' }, room: { _id: '123456789', name: 'A303'} },
];

