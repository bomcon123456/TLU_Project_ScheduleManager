import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, delay, tap, filter, map, takeUntil, switchMap } from 'rxjs/operators'
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

  public dataSource = null;
  private ELEMENT_DATA: CourseElement[];
  private departmentList: DepartmentElement[];
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
              private courseApi: CourseApiService,
              private departmentApi: DepartmentApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = false;
    this.searching = false;
    this.index = 0;
    this.dataLength = 0;
    this.pageIndex = 1;
    this.pageSize = 8;
    this.filter = {
      _id: '',
      name: '',
      credits: {
        min: 0,
        max: 1000
      },
      department: '',
      creditPrerequisites: {
        min: 0,
        max: 1000
      }
    };

    this.getCoursesData(this.pageSize, this.pageIndex, this.filter);

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

  getPageEvent(event) {
    this.isLoading = true;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.getCoursesData(this.pageSize, this.pageIndex, this.filter);
  }

  default() {
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

  applySearch(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
      if (!result || result.event == 'cancel') return;

      if (this.action == 'add') {
        this.createCourse(result.data);
      } else if (this.action == 'edit') {
        this.updateCourse(result.data);
      } else if (this.action == 'delete') {
        this.deleteCourse(result.data);
      }
    });
  }

  getDepartments(pageSize: number, pageIndex: number, filter: any) {
    return new Promise((resolve, reject) => {
      this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

        resolve(result.data);
      }, error => {
        reject(error);

      })
    })
  }

  setDepartmentId(data) {
    return this.filter.department = data._id;
  }

  getCoursesData(pageSize: number, pageIndex: number, filter: any) {

    this.courseApi.getCourses(pageSize, pageIndex, filter).subscribe( result => {
      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;

      for ( let i=0; i<this.ELEMENT_DATA.length; i++) {
        this.ELEMENT_DATA[i].length = this.timeTranform(this.ELEMENT_DATA[i].length, true);

      }

      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.default();
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

    row_obj.length = this.timeTranform(row_obj.length, false);

    this.courseApi.createCourse(this.dataTranform(row_obj)).subscribe(result => {

      this.ELEMENT_DATA.unshift(row_obj);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.default();
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateCourse(row_obj) {

    row_obj.length = this.timeTranform(row_obj.length, false);

    this.courseApi.updateCourse(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

      this.dataSource.data.filter((value, key) => {
        if (value._id == row_obj._id) {
          value = Object.assign(value, row_obj);
        }
        return true;
      });
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteCourse(row_obj) {
    this.courseApi.deleteCourse(row_obj._id).subscribe(result => {

      this.dataSource.data = this.dataSource.data.filter(item => {

        return item._id != row_obj._id;
      });
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  dataTranform(data) {
    let newData = {
      _id: data._id,
      name: data.name,
      capacity: data.credits,
      department: data.department._id,
      length: {
        theory: data.length.theory,
        practice: data.length.practice,
        combined: data.length.combined
      },
      coursePrerequisites: data.coursePrerequisites,
      creditPrerequisites: data.creditPrerequisites
    }
    return newData;
  }

  getFilter() {
    this.isLoading = true;
    this.pageSize = 8;
    this.pageIndex = 1;
    this.paginator.pageIndex = 0;
    this.getCoursesData(this.pageSize, this.pageIndex, this.filter)
  }

  timeTranform(data, getData: boolean) {

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

    // if ( getData == true ) {
    //   if ( data.combined==0 ) {
    //     return data
    //   }
    //   else {
    //     if ( data.combined%9 == 0 ) {
    //       let timeTotal = data.combined / 9;
    //       if ( timeTotal%2 == 0 ) {
    //         length = {
    //           theory: timeTotal / 2 * 9,
    //           practice: timeTotal / 2 * 9,
    //           combined: data.combined
    //         }
    //       }
    //       else {
    //         length = {
    //           theory: ((timeTotal / 2) + 0.5) * 9,
    //           practice: ((timeTotal / 2) - 0.5) * 9,
    //           combined: data.combined
    //         }
    //       }
    //       return length;
    //     }
    //     else {
    //       let timeTotal = data.combined * 60 / 50 / 9;
    //       if ( timeTotal%2 == 0 ) {
    //         length = {
    //           theory: timeTotal / 2 * 9 * 50 / 60,
    //           practice: timeTotal / 2 * 9 * 50 / 60,
    //           combined: data.combined
    //         }
    //       }
    //       else {
    //         length = {
    //           theory: ((timeTotal / 2) + 0.5) * 9 * 50 / 60,
    //           practice: ((timeTotal / 2) - 0.5) * 9 * 50 / 60,
    //           combined: data.combined
    //         }
    //       }
    //       return length;
    //     }
    //   }
    // }
    // else {
    //   if ( data.combined==0 ) {
    //     return data;
    //   }
    //   else {
    //     length = {
    //       theory: 0,
    //       practice: 0,
    //       combined: data.theory + data.practice
    //     }
    //     return length;
    //   }
    // }
  }

}
