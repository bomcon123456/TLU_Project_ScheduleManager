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

@Component({
  selector: 'app-classroom-verified',
  templateUrl: './classroom-verified.component.html',
  styleUrls: ['./classroom-verified.component.scss']
})
export class ClassroomVerifiedComponent implements OnInit {

  public VerifiedColumns: string[] = ['position', 'name', 'course', 'room', 'students', 'teacher', 'shift', 'day', 'status', 'action'];

  public dataSourceVerified: any;

  private ELEMENT_DATA_VERIFIED: ClassroomElement[];

  private totalVerified: number;
  private indexVerified: number;
  private dataLengthVerified: number;
  private pageSizeVerified: number;
  private pageIndexVerified: number;

  private isVerifiedLoading: boolean;

  private departmentSelected: any;
  private semesterSelected: any;
  private filter: any;

  private yearSelected: string;

  private isFirstTime: boolean;

  @ViewChild("verified", { static: true }) paginatorVerified: MatPaginator;

  constructor(private storageApi: StorageService,
              private departmentApi: DepartmentApiService,
              private classroomApi: ClassroomApiService,
              private toastr: ToastrService,
              private location: Location,) {


    this.setVerifiedDefault();
    this.isFirstTime = true;
    if (this.storageApi.departmentSelected &&
        this.storageApi.semesterSelected &&
        this.storageApi.yearSelected) {

        this.departmentApi.getDepartment(this.storageApi.departmentSelected).subscribe( result => {
          this.departmentSelected = result.data

          if (this.storageApi.filterVerified) {
            this.filter = this.storageApi.filterVerified;
          }

          if (this.departmentSelected) {
            this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
          }

        })
        // this.departmentSelected = this.storageApi.departmentSelected;
        this.semesterSelected = this.storageApi.semesterSelected;
        this.yearSelected = this.storageApi.yearSelected;
    }
    else {
      this.yearSelected = YEARS[0];
      this.semesterSelected = SEMESTERS[0].value;

      this.departmentApi.getDepartments(1, 1).subscribe(result => {
        if (!this.departmentSelected) {
          this.departmentSelected = result.data[0];
          this.filter = {
            date: {
              group: SEMESTERS[0].key.group,
              semesters: SEMESTERS[0].key.semester,
              year: this.yearSelected
            },
            department: this.departmentSelected._id,
            verified: true
          };

          if (this.departmentSelected) {
            this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
          }
        }
      }, error => {
        console.log(error);
      })
    }
  }

  ngOnInit() {

    this.isFirstTime = true;
    this.totalVerified = 0;
    this.isVerifiedLoading = false;
    this.indexVerified = 0;
    this.dataLengthVerified = 0;
    if (this.storageApi.filterVerified) {
      this.filter = this.storageApi.filterVerified;
    }

    if (this.departmentSelected) {
      this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
    }
  }

  setVerifiedTable() {
    this.dataSourceVerified.paginator = null;
  }

  setVerifiedDefault() {
    // this.paginatorVerified.pageIndex = 0;
    this.pageIndexVerified = 1;
    this.pageSizeVerified = 10;
  }

  getVerifiedPageEvent(event) {
    this.isVerifiedLoading = true;
    this.pageSizeVerified = event.pageSize;
    this.pageIndexVerified = event.pageIndex + 1;
    this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
  }

  cancelClass(index) {

    if (this.pageSizeVerified > 5) {
      this.cancelClassroom(this.ELEMENT_DATA_VERIFIED[index]._id);
      this.ELEMENT_DATA_VERIFIED.splice(index, 1);
      this.dataLengthVerified = this.totalVerified -= 1;
      this.pageSizeVerified -= 1;
      this.dataSourceVerified = new MatTableDataSource(this.ELEMENT_DATA_VERIFIED);
    }
    else {
      this.cancelClassroom(this.ELEMENT_DATA_VERIFIED[index]._id);
      this.isVerifiedLoading = true;
      this.pageSizeVerified = 10;
      this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
    }
    // this.indexVerified -= 1;
  }

  goBack() {
    this.location.back();
  }

  /**
   * CRUD
   */

  getClassroomsData(pageSize: number, pageIndex: number, filter?: any) {
    this.classroomApi.getClassrooms(pageSize, pageIndex, filter).subscribe(result => {

      this.ELEMENT_DATA_VERIFIED = result.data;
      this.dataLengthVerified = this.totalVerified = result.size;
      this.dataSourceVerified = new MatTableDataSource(this.ELEMENT_DATA_VERIFIED)
      this.setVerifiedTable();
      this.indexVerified = pageSize * (pageIndex - 1);
      this.isVerifiedLoading = false;

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  cancelClassroom(id) {
    this.classroomApi.updateClassroom(id, { verified: false }).subscribe(result => {
      this.toastr.success(result.message)
    })
  }

  /**
   * TRANSFORM DATA
   */

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
