import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as jwt_decode from 'jwt-decode';

import { ClassroomDialogComponent } from './classroom-dialog/classroom-dialog.component';
import { ClassroomElement } from '../../interface/dialog-data';
import { RoomApiService } from './../../../../services/room-api.service';
import { ClassroomApiService } from './../../../../services/classroom-api.service'
import { CalendarApiService } from './../../../../services/calendar-api.service';
import { StorageService } from '../../storage/storage.service';
import { SEMESTERS, YEARS } from '../../storage/data-storage';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-classroom-management',
  templateUrl: './classroom-management.component.html',
  styleUrls: ['./classroom-management.component.scss']
})
export class ClassroomManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'name', 'students', 'course', 'room', 'teacher', 'shift', 'day', 'verified', 'actions'];

  private years = YEARS;
  private semesters = SEMESTERS;

  private ELEMENT_DATA: ClassroomElement[];

  public dataSource: any = null;
  public semesterSelected: any;
  private dataUser: any;
  private filter: any;

  private isLoading: boolean;
  private isFirstTime: boolean;
  private isOpenForOffering: boolean;

  private action: string;
  private width: string;
  private height: string;
  public yearSelected: string;

  private index: number;
  private dataLength: number;
  private pageSize: number;
  private pageIndex: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
              private roomApi: RoomApiService,
              private classroomApi: ClassroomApiService,
              private toastr: ToastrService,
              private storageService: StorageService,
              private calendarApi: CalendarApiService,
              private route: Router) {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
    console.log(this.dataUser);

  }

  ngOnInit() {
    // this.isFirstTime = true;
    this.isLoading = false;
    this.index = 0;
    this.dataLength = 0;
    this.setDefault();

    if ( this.storageService.yearSelected && this.storageService.semesterSelected ) {
      this.isLoading = true;
      this.yearSelected = this.storageService.yearSelected;
      this.semesterSelected = this.storageService.semesterSelected;
      this.filter = {
        date: {
          year: this.yearSelected,
          group: this.semesterSelected.key.group,
          semesters: this.semesterSelected.key.semester
        },
        department: this.dataUser.department
      }
      this.getClassroomsData(this.pageSize, this.pageIndex, this.filter);
    }
    else {
      this.yearSelected = null;
      this.semesterSelected = null;
    }

    // this.getClassroomsData(this.pageSize, this.pageIndex);
  }

  /**
   * SET
   */

  setYearSelected(value: string) {
    console.log(value);
    this.yearSelected = value;
    this.storageService.yearSelected = value;
    this.getData();
  }

  setSemesterSelected(value: any) {
    console.log(value);
    this.semesterSelected = value;
    this.storageService.semesterSelected = value;
    this.getData();
  }

  goToAdd() {

    this.route.navigate(['/classroom-management/classroom-add']);
  }

  setTable() {
    this.dataSource.paginator = null;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'course': return item.courseId._id;
        case 'room': return item.roomId._id;
        case 'teacher': return item.teacherId._id;
        case 'shift': return item.date.shift;
        default: return item[property];
      }
    }
    this.dataSource.sort = this.sort;
  }

  setDefault() {
    this.paginator.pageIndex = 0;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.filter = {};
  }

  /**
   * GET, ACTION
   */

  applySearch(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getData() {
    if ( this.yearSelected && this.semesterSelected ) {
      this.isLoading = true;
      this.filter = {
        date: {
          year: this.yearSelected,
          group: this.semesterSelected.key.group,
          semesters: this.semesterSelected.key.semester
        }
      }
      if ( this.dataUser.department ) {
        this.filter.department = this.dataUser.department;
      }

      this.getClassroomsData(this.pageSize, this.pageIndex, this.filter);
      this.getCalendar(this.filter);
    }
  }

  getPageEvent(event) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.getClassroomsData(this.pageSize, this.pageIndex, this.filter);
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if ( this.action != 'delete' ) {
      this.width = '780px';
      this.height = '580px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(ClassroomDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( !result || result.event == 'cancel' ) return;

      if (this.action == 'edit') {
        this.updateClassroom(result.data);
      }
      else {
        this.deleteRoom(result.data);
      }
    });
  }

  /**
   * CRUD
   */

  getClassroomsData(pageSize: number, pageIndex: number, filter?: any) {
    console.log(filter);


    this.classroomApi.getClassrooms(pageSize, pageIndex, filter).subscribe( result => {

      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.setTable();
      this.index = pageSize * (pageIndex - 1);
      this.isLoading = false;

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateClassroom(row_obj) {

    this.classroomApi.updateClassroom(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getClassroomsData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteRoom(row_obj){

    this.classroomApi.deleteClassroom(row_obj._id).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getClassroomsData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  getCalendar(filter) {

    this.calendarApi.getCalendars(1, 1, this.filterCalendar(filter)).subscribe( result => {
      console.log(result.data);

      this.isOpenForOffering = result.data[0].openForOffering;

    }, error => {
      console.log(error);
    })
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData = {
      students: data.students,
      roomId: data.roomId._id,
      teacherId: data.teacherId._id,
      date: {
        shift: data.date.shift,
        day: data.date.day,
        group: data.date.group,
        semesters: data.date.semesters,
        year: data.date.year
      }
    }
    return newData;
  }

  filterCalendar(filter) {
    return {
      year: filter.date.year,
      group: filter.date.group,
      semesters: filter.date.semesters
    }
  }

  getFullText(data) {
    if (data == "TH") {
      return "Thực hành";
    }
    if (data == "LT") {
      return "Lý thuyết";
    }
    if (data == "TC") {
      return "Thể chất";
    }
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

