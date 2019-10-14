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

  public displayedColumns: string[] = ['position', 'name', 'students', 'course', 'room', 'teacher', 'shift', 'day', 'confirm', 'actions'];

  private years = YEARS;
  private semesters = SEMESTERS;

  private ELEMENT_DATA: ClassroomElement[];

  public dataSource: any = null;
  public semesterSelected: any;
  private dataUser: any;

  private isLoading: boolean;
  private isFirstTime: boolean;

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
              private toastr: ToastrService,
              private storageService: StorageService,
              private route: Router) {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
    console.log(this.dataUser);

  }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = true;
    this.index = 0;
    this.dataLength = 0;
    this.pageIndex = 1;
    this.pageSize = 8;

    this.yearSelected = null;
    this.semesterSelected = null;

    this.getRoomsData(this.pageSize, this.pageIndex);
  }

  getPageEvent(event) {
    // console.log(event);
    // this.pageSize = event.pageSize;
    // this.pageIndex = event.pageIndex + 1;
    // this.index = event.pageSize * event.pageIndex;
    // this.getRoomsData(this.pageSize, this.pageIndex);
  }

  setYearSelected(value: string) {

    console.log(value);

    this.storageService.yearSelected = value;

    console.log(this.storageService.yearSelected);

  }

  setSemesterSelected(value: any) {

    console.log(value);

    this.storageService.semesterSelected = value;

    console.log(this.storageService.semesterSelected);

  }

  goToAdd() {
    this.route.navigate(['/classroom-management/classroom-add']);
  }

  default() {
    this.dataSource.paginator = null;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {
    console.log(obj);

    this.action = obj.action = action;

    if ( this.action != 'delete' ) {
      this.width = '780px';
      this.height = '450px';
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

      console.log(result);

      if (this.action == 'edit') {
        this.updateRoom(result.data);
      } else if (this.action == 'delete') {
        this.deleteRoom(result.data);
      }
    });
  }

  getRoomsData(pageSize: number, pageIndex: number) {
    this.ELEMENT_DATA = ELEMENT_DATA;
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
    this.default();
    this.isLoading = false;
    this.isFirstTime = false;

    // this.roomApi.getRooms(pageSize, pageIndex).subscribe( result => {
    //   console.log(result);

    //   this.ELEMENT_DATA = result.data;
    //   this.dataLength = result.size;

    //   this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
    //   this.default();

    //   if (this.isFirstTime) {
    //     this.isLoading = false;
    //     this.isFirstTime = false;
    //     this.toastr.success(result.message);
    //   }
    // }, error => {
    //   this.toastr.error(error.message)
    // })
  }

  createRoom(row_obj){

    // this.roomApi.createRoom(this.dataTranform(row_obj)).subscribe( result => {

    //   this.ELEMENT_DATA.unshift(row_obj);
    //   this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    //   this.default();
    //   this.toastr.success(result.message)
    // }, error => {
    //   this.toastr.error(error.message)
    // })
  }

  updateRoom(row_obj){

    // this.roomApi.updateRoom(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

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

  deleteRoom(row_obj){

    // this.roomApi.deleteRoom(row_obj._id).subscribe(result => {

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
      name: data.name,
      capacity: data.capacity,
      location: {
        building: data.location.building,
        floor: data.location.floor
      },
      roomType: data.roomType
    }
    return newData;
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


}

const ELEMENT_DATA: ClassroomElement[] = [
  { name: 'Hydrogen', students: 20, courseId: { _id: 'B', name: 'abc' }, roomId: { _id: 'B', name: 'abc' }, teacherId: { _id: 'B', name: 'abc' }, date: { shift: 'abc', day: 'abc', group: 'abc', semester: 'abc', year: 'abc'}, verified: false },
  { name: 'Hydrogen', students: 20, courseId: { _id: 'B', name: 'abc' }, roomId: { _id: 'B', name: 'abc' }, teacherId: { _id: 'B', name: 'abc' }, date: { shift: 'abc', day: 'abc', group: 'abc', semester: 'abc', year: 'abc' }, verified: true },

];

