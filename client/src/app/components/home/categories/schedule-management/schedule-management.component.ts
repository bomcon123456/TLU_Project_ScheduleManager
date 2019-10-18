import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SEMESTERS, YEARS } from '../../storage/data-storage';
import { DepartmentElement, ClassroomElement } from '../../interface/dialog-data';
import { DepartmentApiService } from '../../../../services/department-api.service';
import { ClassroomApiService } from '../../../../services/classroom-api.service';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {

  /**
   * VERIFIED
   */
  public approvedColumns: string[] = ['position', 'name', 'room', 'shift', 'day'];
  public dataSourceApproved: any;

  private ELEMENT_DATA_VERIFIED: ClassroomElement[];

  private totalApproved: number;
  private indexVerified: number;
  private dataLengthVerified: number;
  private pageSizeVerified: number;
  private pageIndexVerified: number;

  private isVerifiedLoading: boolean;

  /**
   * NOT VERIFIED
   */
  public notApprovedColumns: string[] = ['position', 'name', 'room', 'shift', 'day'];
  public dataSourceNotApproved: any;

  private ELEMENT_DATA_NOT_VERIFIED: ClassroomElement[];

  private totalNotApproved: number;
  private indexNotVerified: number;
  private dataLengthNotVerified: number;
  private pageSizeNotVerified: number;
  private pageIndexNotVerified: number;

  private isNotVerifiedLoading: boolean;

  /**
   * ANOTHER
   */
  private semesterSelected: any;
  private filter: any;

  private departmentSelected: DepartmentElement;

  private years = YEARS;
  private semesters = SEMESTERS;

  private yearSelected: string;


  public searching: boolean;
  private isFirstTime: boolean;

  public ServerSideCtrl: FormControl = new FormControl();
  public ServerSideFilteringCtrl: FormControl = new FormControl();
  public filteredServerSide: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("notVerified", { static: true }) paginatorVerified: MatPaginator;
  @ViewChild("verified", { static: true }) paginatorNotVerified: MatPaginator;

  constructor(private departmentApi: DepartmentApiService,
              private classroomApi: ClassroomApiService,
              private storageApi: StorageService,
              private toastr: ToastrService,
              private route: Router) { }

  ngOnInit() {

    this.searching = false;
    this.totalApproved = 0;
    this.totalNotApproved = 0;
    this.isVerifiedLoading = false;
    this.indexVerified = 0;
    this.dataLengthVerified = 0;
    this.isNotVerifiedLoading = false;
    this.indexNotVerified = 0;
    this.dataLengthNotVerified = 0;
    this.setNotVerifiedDefault();
    this.setVerifiedDefault();

    this.ServerSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        debounceTime(1000),
        switchMap(async search => {
          let filter = {
            schoolId: '',
            name: search
          }
          let res = await this.getDepartments(17, 1, filter);
          return res;
        }),
        // delay(500)
      )
      .subscribe(filtered => {
        this.searching = false;
        this.filteredServerSide.next(filtered);
      }, error => {
        this.searching = false;
        console.log(error);

      });

    this.getDepartments(5,1,{});
  }

  setVerifiedTable() {
    this.dataSourceApproved.paginator = null;
  }

  setNotVerifiedTable() {
    this.dataSourceNotApproved.paginator = null;
  }

  setVerifiedDefault() {
    this.paginatorVerified.pageIndex = 0;
    this.pageIndexVerified = 1;
    this.pageSizeVerified = 10;
    this.filter = {};
  }

  setNotVerifiedDefault() {
    this.paginatorNotVerified.pageIndex = 0;
    this.pageIndexNotVerified = 1;
    this.pageSizeNotVerified = 10;
    this.filter = {};
  }

  getData() {
    this.storageApi.departmentSelected = this.departmentSelected;
    this.storageApi.yearSelected = this.yearSelected;
    this.storageApi.semesterSelected = this.semesterSelected;
    if ( this.departmentSelected && this.yearSelected && this.semesterSelected ) {
      this.isVerifiedLoading = true;
      this.isNotVerifiedLoading = true;
      this.filter = {
        date: {
          group: this.semesterSelected.key.group,
          sememesters: this.semesterSelected.key.semester,
          year: this.yearSelected
        },
        department: this.departmentSelected._id,
      }
      this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, {...this.filter, verified: true});
      this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, {...this.filter, verified: false});
      // this.setVerifiedTable();
      // this.setNotVerifiedTable();
    }
  }

  getVerifiedPageEvent(event) {
    this.isVerifiedLoading = true;
    this.pageSizeVerified = event.pageSize;
    this.pageIndexVerified = event.pageIndex + 1;
    this.getClassroomsData(this.pageSizeVerified, this.pageIndexVerified, this.filter);
  }

  getNotVerifiedPageEvent(event) {
    this.isNotVerifiedLoading = true;
    this.pageSizeNotVerified = event.pageSize;
    this.pageIndexNotVerified = event.pageIndex + 1;
    this.getClassroomsData(this.pageSizeNotVerified, this.pageIndexNotVerified, this.filter);
  }

  goToVerifiedPage() {
    if (this.departmentSelected && this.yearSelected && this.semesterSelected ) {
      this.route.navigate(['/schedule-management/verified']);
    }
    else {
      return;
    }
  }

  goToNotVerifiedPage() {
    if (this.departmentSelected && this.yearSelected && this.semesterSelected) {
      this.route.navigate(['/schedule-management/not-verified']);
    }
    else {
      return;
    }
  }

  /**
   * CRUD
   */

  getClassroomsData(pageSize: number, pageIndex: number, filter?: any) {
    console.log(pageSize, pageIndex, filter);


    this.classroomApi.getClassrooms(pageSize, pageIndex, filter).subscribe(result => {

      if ( filter.verified == true ) {

        this.ELEMENT_DATA_VERIFIED = result.data;
        this.dataLengthVerified = this.totalApproved = result.size;
        this.dataSourceApproved = new MatTableDataSource(this.ELEMENT_DATA_VERIFIED)
        this.setVerifiedTable();
        this.indexVerified = pageSize * (pageIndex - 1);
        this.isVerifiedLoading = false;
      }
      else {
        this.ELEMENT_DATA_NOT_VERIFIED = result.data;
        this.dataLengthNotVerified = this.totalNotApproved = result.size;
        this.dataSourceNotApproved = new MatTableDataSource(this.ELEMENT_DATA_NOT_VERIFIED)
        this.setNotVerifiedTable();
        this.indexNotVerified = pageSize * (pageIndex - 1);
        console.log(this.indexNotVerified);

        this.isNotVerifiedLoading = false;
      }

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  getDepartments(pageSize: number, pageIndex: number, filter: any) {
    return new Promise((resolve, reject) => {
      this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

        this.filteredServerSide.next(result.data);
        resolve(result.data);
      }, error => {
        reject(error);

      })
    })
  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  room: number;
  shift: '1-1', day: 'monday', status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', room: 1.0079, shift: '1-1', day: 'monday', status: 'H' },
  { position: 2, name: 'Helium', room: 4.0026, shift: '1-1', day: 'monday', status: 'He' },
  { position: 3, name: 'Lithium', room: 6.941, shift: '1-1', day: 'monday', status: 'Li' },
  { position: 4, name: 'Beryllium', room: 9.0122, shift: '1-1', day: 'monday', status: 'Be' },
  { position: 5, name: 'Boron', room: 10.811, shift: '1-1', day: 'monday', status: 'B' },
  { position: 6, name: 'Carbon', room: 12.0107, shift: '1-1', day: 'monday', status: 'C' },
  { position: 7, name: 'Nitrogen', room: 14.0067, shift: '1-1', day: 'monday', status: 'N' },
  { position: 8, name: 'Oxygen', room: 15.9994, shift: '1-1', day: 'monday', status: 'O' },
  { position: 9, name: 'Fluorine', room: 18.9984, shift: '1-1', day: 'monday', status: 'F' },
  { position: 10, name: 'Neon', room: 20.1797, shift: '1-1', day: 'monday', status: 'Ne' },
  { position: 11, name: 'Sodium', room: 22.9897, shift: '1-1', day: 'monday', status: 'Na' },
  { position: 12, name: 'Magnesium', room: 24.305, shift: '1-1', day: 'monday', status: 'Mg' },
  { position: 13, name: 'Aluminum', room: 26.9815, shift: '1-1', day: 'monday', status: 'Al' },
  { position: 14, name: 'Silicon', room: 28.0855, shift: '1-1', day: 'monday', status: 'Si' },
  { position: 15, name: 'Phosphorus', room: 30.9738, shift: '1-1', day: 'monday', status: 'P' },
  { position: 16, name: 'Sulfur', room: 32.065, shift: '1-1', day: 'monday', status: 'S' },
  { position: 17, name: 'Chlorine', room: 35.453, shift: '1-1', day: 'monday', status: 'Cl' },
  { position: 18, name: 'Argon', room: 39.948, shift: '1-1', day: 'monday', status: 'Ar' },
  { position: 19, name: 'Potassium', room: 39.0983, shift: '1-1', day: 'monday', status: 'K' },
  { position: 20, name: 'Calcium', room: 40.078, shift: '1-1', day: 'monday', status: 'Ca' },
];
