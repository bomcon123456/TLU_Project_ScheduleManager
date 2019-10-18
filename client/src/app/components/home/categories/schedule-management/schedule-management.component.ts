import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SEMESTERS, YEARS } from '../../storage/data-storage';
import { DepartmentElement } from '../../interface/dialog-data';
import { DepartmentApiService } from '../../../../services/department-api.service';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {

  public approvedColumns: string[] = ['position', 'name', 'room', 'shift', 'day'];
  public notApprovedColumns: string[] = ['position', 'name', 'room', 'shift', 'day'];

  public dataSourceApproved: any;
  public dataSourceNotApproved: any;
  private semesterSelected: any;

  private departmentSelected: DepartmentElement;

  private years = YEARS;
  private semesters = SEMESTERS;

  private yearSelected: string;

  private totalApproved: number;
  private totalNotApproved: number;

  private isShowData: boolean;
  public searching: boolean;

  public ServerSideCtrl: FormControl = new FormControl();
  public ServerSideFilteringCtrl: FormControl = new FormControl();
  public filteredServerSide: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private departmentApi: DepartmentApiService,
              private storageApi: StorageService,
              private route: Router) { }

  ngOnInit() {

    this.searching = false;
    this.totalApproved = 0;
    this.totalNotApproved = 0;

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

  setTable() {
    this.dataSourceApproved.paginator = this.paginator;
    this.dataSourceNotApproved.paginator = this.paginator;
  }

  getData() {
    this.storageApi.departmentSelected = this.departmentSelected;
    this.storageApi.yearSelected = this.yearSelected;
    this.storageApi.semesterSelected = this.semesterSelected;
    if ( this.departmentSelected && this.yearSelected && this.semesterSelected ) {
      this.dataSourceApproved = new MatTableDataSource(ELEMENT_DATA);
      this.dataSourceNotApproved = new MatTableDataSource(ELEMENT_DATA);
      this.totalApproved = 20;
      this.totalNotApproved = 20;
      this.setTable();
      return this.isShowData = true;
    }
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
