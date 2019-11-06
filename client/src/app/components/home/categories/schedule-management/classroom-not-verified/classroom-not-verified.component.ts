import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../../storage/storage.service';
import { DepartmentApiService } from '../../../../../services/department-api.service';
import { ClassroomApiService } from '../../../../../services/classroom-api.service';
import { SEMESTERS, YEARS } from '../../../storage/data-storage';
import { ClassroomElement } from './../../../interface/dialog-data';
import { NotVerifiedDialogComponent } from './not-verified-dialog/not-verified-dialog.component';

@Component({
  selector: 'app-classroom-not-verified',
  templateUrl: './classroom-not-verified.component.html',
  styleUrls: ['./classroom-not-verified.component.scss']
})
export class ClassroomNotVerifiedComponent implements OnInit {

  public notVerifiedColumns: string[] = ['position', 'name', 'course', 'room', 'students', 'teacher', 'shift', 'day', 'status', 'action'];

  public dataSourceNotVerified: any;

  private ELEMENT_DATA_NOT_VERIFIED: ClassroomElement[];

  private totalNotVerified: number;
  private indexNotVerified: number;
  private dataLengthNotVerified: number;
  private pageSizeNotVerified: number;
  private pageIndexNotVerified: number;

  private isNotVerifiedLoading: boolean;

  private departmentSelected: any;
  private semesterSelected: any;
  private filter: any;

  private yearSelected: string;
  private action: string;
  private width: string;
  private height: string;

  private isFirstTime: boolean;

  @ViewChild(MatPaginator, { static: true }) paginatorNotVerified: MatPaginator;

  constructor(public dialog: MatDialog,
              private storageApi: StorageService,
              private departmentApi: DepartmentApiService,
              private classroomApi: ClassroomApiService,
              private toastr: ToastrService,
              private location: Location,) {


    this.isFirstTime = true;
    this.setNotVerifiedDefault();
    if (this.storageApi.departmentSelected &&
      this.storageApi.semesterSelected &&
      this.storageApi.yearSelected) {

      this.departmentApi.getDepartment(this.storageApi.departmentSelected).subscribe(result => {
        this.departmentSelected = result.data

        if (this.storageApi.filterVerified) {
          this.filter = this.storageApi.filterVerified;
        }

        if (this.departmentSelected) {
          this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
        }

      })

      this.departmentSelected = this.storageApi.departmentSelected;
      this.semesterSelected = this.storageApi.semesterSelected;
      this.yearSelected = this.storageApi.yearSelected;
    }
    else {
      this.semesterSelected = SEMESTERS[0];
      this.yearSelected = YEARS[0];

      this.departmentApi.getDepartments(1, 1).subscribe(result => {
        this.isFirstTime = false;
        if (!this.departmentSelected) {
          this.departmentSelected = result.data[0];
          this.filter = {
            date: {
              group: this.semesterSelected.key.group,
              semesters: this.semesterSelected.key.semester,
              year: this.yearSelected
            },
            department: this.departmentSelected._id,
            verified: false
          };
        }
      }, error => {
        console.log(error);
      })
    }
  }

  ngOnInit() {

    this.isFirstTime = true;
    this.totalNotVerified = 0;
    this.isNotVerifiedLoading = false;
    this.indexNotVerified = 0;
    this.dataLengthNotVerified = 0;
    if ( this.storageApi.filterNotVerified ) {
      this.filter = this.storageApi.filterNotVerified;
    }

    if ( this.departmentSelected ) {
      this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
    }
  }

  setNotVerifiedTable() {
    this.dataSourceNotVerified.paginator = null;
  }

  setNotVerifiedDefault() {
    // this.paginatorNotVerified.pageIndex = 0;
    this.pageIndexNotVerified = 1;
    this.pageSizeNotVerified = 10;
  }

  getNotVerifiedPageEvent(event) {
    this.isNotVerifiedLoading = true;
    this.pageSizeNotVerified = event.pageSize;
    this.pageIndexNotVerified = event.pageIndex + 1;
    this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
  }

  verifiedClass(index) {

    if ( this.pageSizeNotVerified > 5 ) {
      this.verifiedClassroom(this.ELEMENT_DATA_NOT_VERIFIED[index]._id);
      this.ELEMENT_DATA_NOT_VERIFIED.splice(index, 1);
      this.dataLengthNotVerified = this.totalNotVerified -= 1;
      this.pageSizeNotVerified -= 1;
      this.dataSourceNotVerified = new MatTableDataSource(this.ELEMENT_DATA_NOT_VERIFIED);
    }
    else {
      this.verifiedClassroom(this.ELEMENT_DATA_NOT_VERIFIED[index]._id);
      this.isNotVerifiedLoading = true;
      this.pageSizeNotVerified = 10;
      this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
    }
    // this.indexNotVerified -= 1;
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '580px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(NotVerifiedDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') {

        this.isNotVerifiedLoading = true;
        // this.paginatorNotVerified.pageIndex = 0;
        this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
        return;
      }

      if (this.action == 'edit') {
        this.updateClassroom(result.data);
      }
      else {
        this.deleteRoom(result.data);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  /**
   * CRUD
   */

  getClassroomsData(pageSize: number, pageIndex: number, filter?: any) {

    this.classroomApi.getClassrooms(pageSize, pageIndex, filter).subscribe(result => {

      this.ELEMENT_DATA_NOT_VERIFIED = result.data;
      this.dataLengthNotVerified = this.totalNotVerified = result.size;
      this.dataSourceNotVerified = new MatTableDataSource(this.ELEMENT_DATA_NOT_VERIFIED)
      this.setNotVerifiedTable();
      this.indexNotVerified = pageSize * (pageIndex - 1);
      this.isNotVerifiedLoading = false;

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

      this.isNotVerifiedLoading = true;
      // this.paginatorNotVerified.pageIndex = 0;
      this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  deleteRoom(row_obj) {

    this.classroomApi.deleteClassroom(row_obj._id).subscribe(result => {

      this.isNotVerifiedLoading = true;
      this.setNotVerifiedDefault();
      this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  verifiedClassroom(id) {
    this.classroomApi.updateClassroom(id, { verified: true }).subscribe( result => {
      this.toastr.success(result.message)
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

  transformToVn(data) {
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
