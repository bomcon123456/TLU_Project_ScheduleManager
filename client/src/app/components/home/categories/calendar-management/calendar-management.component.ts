import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { debounceTime, delay, tap, filter, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CalendarDialogComponent } from './calendar-dialog/calendar-dialog.component';
import { CalendarElement } from '../../interface/dialog-data';
import { CalendarApiService } from '../../../../services/calendar-api.service';
import { DepartmentApiService } from '../../../../services/department-api.service';


/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-calendar-management',
  templateUrl: './calendar-management.component.html',
  styleUrls: ['./calendar-management.component.scss']
})
export class CalendarManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'group', 'semesters', 'year', 'start', 'end', 'actions'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  public dataSource = null;
  private ELEMENT_DATA: CalendarElement[];
  private isLoading: boolean;
  private isFirstTime: boolean;
  public searching: boolean;
  private action: string;
  private width: string;
  private height: string;
  private index: number;
  private dataLength: number;
  private pageSize: number;
  private pageIndex: number;
  private filter: any;

  public ServerSideCtrl: FormControl = new FormControl();
  public ServerSideFilteringCtrl: FormControl = new FormControl();
  public filteredServerSide: ReplaySubject<any> = new ReplaySubject<any>(1);


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
    private calendarApi: CalendarApiService,
    private departmentApi: DepartmentApiService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = false;
    this.searching = false;
    this.index = 0;
    this.dataLength = 0;
    this.setDefault()

    this.getCalendarsData(this.pageSize, this.pageIndex);

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
  }

  /**
   * SET
   */

  setTable() {
    this.dataSource.paginator = null;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        // case 'department': return item.department.name;
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

  setDepartmentId(data) {

    if (data) {

      return this.filter.department = data._id;
    }
    else {
      return this.filter.department = '';
    }
  }

  /**
   * GET, ACTIONS
   */

  applySearch(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getPageEvent(event) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.getCalendarsData(this.pageSize, this.pageIndex);
  }

  getFilter() {
    this.isLoading = true;
    this.pageSize = 10;
    this.pageIndex = 1;
    this.paginator.pageIndex = 0;
    this.getCalendarsData(this.pageSize, this.pageIndex)
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '275px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') {

        this.isLoading = true;
        this.paginator.pageIndex = 0;
        this.getCalendarsData(this.pageSize, this.pageIndex);
        return;
      }

      if (this.action == 'edit') {
        this.updateCalendar(result.data);
      }

      // if (this.action == 'add') {
      //   this.createCalendar(result.data);
      // } else if (this.action == 'edit') {
      //   this.updateCalendar(result.data);
      // } else if (this.action == 'delete') {
      //   this.deleteCalendar(result.data);
      // }

    });
  }

  /**
   * CRUD
   */

  getDepartments(pageSize: number, pageIndex: number, filter: any) {
    return new Promise((resolve, reject) => {
      this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

        resolve(result.data);
      }, error => {
        reject(error);

      })
    })
  }

  getCalendarsData(pageSize: number, pageIndex: number) {
    this.calendarApi.getCalendars(pageSize, pageIndex).subscribe(result => {
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

  createCalendar(row_obj) {

    this.calendarApi.createCalendar(this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getCalendarsData(this.pageSize, this.pageIndex);
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateCalendar(row_obj) {

    let data = { name: row_obj.name };

    this.calendarApi.updateCalendar(row_obj.id, data).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getCalendarsData(this.pageSize, this.pageIndex);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteCalendar(row_obj) {
    this.calendarApi.deleteCalendar(row_obj.id).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getCalendarsData(this.pageSize, this.pageIndex);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData = {
      group: data.group,
      semesters: data.semesters,
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate
    }
    return newData;
  }

  transformGroup(data) {
    switch (data) {
      case 'Group 1': return 'Nhóm 1';
      case 'Group 2': return 'Nhóm 2';
      case 'Group 3': return 'Nhóm 3';
    }
  }

  transformSemester(data) {
    switch (data) {
      case 'Semester 1': return 'Kỳ 1';
      case 'Semester 2': return 'Kỳ 2';
      case 'Semester 3': return 'Kỳ 3';
    }
  }

  dateFormat(time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDay();
    let y = year.toString();
    let m = month.toString();
    let d = day.toString();

    if ( year <= 1990 ) {
      return null;
    }

    if ( day < 10 ) {
      d = '0' + d;
    }

    if ( month < 10 ) {
      m = '0' + m;
    }

    return d + '-' + m + '-' + y;
  }

  checkDateTime(time) {
    let date = new Date(time);
    let year = date.getFullYear();

    if ( year > 1990 ) {
      return true;
    }
    return false;
  }

}
