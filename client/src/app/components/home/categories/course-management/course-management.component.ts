import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { debounceTime, delay, tap, filter, switchMap } from 'rxjs/operators'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CourseDialogComponent } from './course-dialog/course-dialog.component';
import { CourseElement, DepartmentElement } from '../../interface/dialog-data';
import { CourseApiService } from './../../../../services/course-api.service';
import { DepartmentApiService } from './../../../../services/department-api.service';


@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.scss']
})
export class CourseManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', '_id', 'name', 'credits', 'department', 'theory', 'practice', 'coursePrereq', 'creditPrereq', 'actions'];

  public dataSource: any;
  private filter: any;

  private ELEMENT_DATA: CourseElement[];
  private departmentList: DepartmentElement[];

  public searching: boolean;
  private isLoading: boolean;
  private isFirstTime: boolean;

  private action: string;
  private width: string;
  private height: string;

  private index: number;
  private dataLength: number;
  private pageSize: number;
  private pageIndex: number;

  public ServerSideCtrl: FormControl = new FormControl();
  public ServerSideFilteringCtrl: FormControl = new FormControl();
  public filteredServerSide: ReplaySubject<any> = new ReplaySubject<any>(1);


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  @ViewChild('minCredits', { static: true }) minCredits: ElementRef;
  @ViewChild('maxCredits', { static: true }) maxCredits: ElementRef;
  @ViewChild('minCreditPrerequisites', { static: true }) minCreditPrerequisites: ElementRef;
  @ViewChild('maxCreditPrerequisites', { static: true }) maxCreditPrerequisites: ElementRef;

  constructor(public dialog: MatDialog,
              private courseApi: CourseApiService,
              private departmentApi: DepartmentApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.searching = false;
    this.index = 0;
    this.dataLength = 0;
    this.setDefault();

    this.getDepartments(this.pageSize, this.pageIndex);
    this.getCoursesData(this.pageSize, this.pageIndex, {});

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
      .subscribe( filtered => {
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
        case 'department': return item.department.name;
        case 'theory': return item.length.theory;
        case 'practice': return item.length.practice;
        case 'coursePrereq': return item.coursePrerequisites.join(', ');
        case 'creditPrereq': return item.creditPrerequisites;
        default: return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  setDefault() {
    this.paginator.pageIndex = 0;
    this.pageIndex = 1;
    this.pageSize = 7;
    this.filter = {};
  }

  setDepartmentId(data) {

    if ( data ) {

      return this.filter.department = data._id;
    }
    else {
      return this.filter.department = '';
    }
  }

  setCredits(data, obj: string) {

    if ( !this.filter.credits ) {
      this.filter.credits = {};
      this.filter.credits[obj] = data;
    }
    else {
      this.filter.credits[obj] = data;
    }
  }

  setCreditPrerequisites(data, obj: string) {

    if ( !this.filter.creditPrerequisites ) {
      this.filter.creditPrerequisites = {};
      this.filter.creditPrerequisites[obj] = data;
    }
    else {
      this.filter.creditPrerequisites[obj] = data;
    }
  }

  /**
   * GET, ACTION
   */

  applySearch(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getPageEvent(event) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
  }

  getFilter() {

    if ( !this.filter.credits || !this.filter.credits.min || !this.filter.credits.max ) {
      delete this.filter.credits;
      this.minCredits.nativeElement.value = null;
      this.maxCredits.nativeElement.value = null;
    }

    if ( !this.filter.creditPrerequisites || !this.filter.creditPrerequisites.min || !this.filter.creditPrerequisites.max ) {

      delete this.filter.creditPrerequisites;
      this.minCreditPrerequisites.nativeElement.value = null;
      this.maxCreditPrerequisites.nativeElement.value = null;
    }

    this.isLoading = true;
    this.pageSize = 8;
    this.pageIndex = 1;
    this.paginator.pageIndex = 0;
    console.log(this.filter);

    this.getCoursesData(this.pageSize, this.pageIndex, this.filter)
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '600px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(CourseDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result || result.event == 'cancel') {

        this.isLoading = true;
        this.paginator.pageIndex = 0;
        this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
        return;
      }

      if (this.action == 'add') {
        this.createCourse(result.data);
      } else if (this.action == 'edit') {
        this.updateCourse(result.data);
      } else if (this.action == 'delete') {
        this.deleteCourse(result.data);
      }
    });
  }

  /**
   * CRUD
   */

  getDepartments(pageSize: number, pageIndex: number, filter?: any) {
    return new Promise((resolve, reject) => {
      this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

        if ( this.isFirstTime ) {
          this.filteredServerSide.next(result.data);
        }
        resolve(result.data);
      }, error => {
        reject(error);

      })
    })
  }

  getCoursesData(pageSize: number, pageIndex: number, filter: any) {

    this.courseApi.getCourses(pageSize, pageIndex, filter).subscribe( result => {
      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;

      for ( let i=0; i<this.ELEMENT_DATA.length; i++) {
        this.ELEMENT_DATA[i].length = this.timeTransform(this.ELEMENT_DATA[i].length, true);

      }

      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.setTable();
      this.index = pageSize * (pageIndex-1);
      this.isLoading = false;

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  createCourse(row_obj) {

    row_obj.length = this.timeTransform(row_obj.length, false);

    this.courseApi.createCourse(row_obj).subscribe(result => {

      this.isLoading = true
      this.setDefault();
      this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateCourse(row_obj) {

    row_obj.length = this.timeTransform(row_obj.length, false);

    this.courseApi.updateCourse(row_obj.id, row_obj).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteCourse(row_obj) {
    this.courseApi.deleteCourse(row_obj.id).subscribe(result => {

      this.setDefault();
      this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  /**
   * TRANSFORM DATA
   */

  timeTransform(data, getData: boolean) {

    let length;

    if ( getData==true ) {
      if ( data.combined == 0 ) {
        return data;
      }
      else {
        length = {
          theory: data.combined,
          practice: data.combined,
          combined: data.combined
        }
        return length;
      }
    }
    else {
      if ( data.combined == 0 ) {
        return data;
      }
      else {
        length = {
          theory: 0,
          practice: 0,
          combined: data.combined
        }
        return length;
      }
    }
  }

}
