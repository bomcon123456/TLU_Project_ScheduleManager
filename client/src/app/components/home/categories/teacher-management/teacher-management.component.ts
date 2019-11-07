import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { debounceTime, delay, tap, filter, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IgxExcelExporterService, IgxExcelExporterOptions } from "igniteui-angular";

import { TeacherDialogComponent } from './teacher-dialog/teacher-dialog.component';
import { TeacherElement, DepartmentElement } from '../../interface/dialog-data';
import { TeacherApiService } from './../../../../services/teacher-api.service';
import { DepartmentApiService } from './../../../../services/department-api.service';


/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-teacher-management',
  templateUrl: './teacher-management.component.html',
  styleUrls: ['./teacher-management.component.scss']
})
export class TeacherManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', '_id', 'name', 'department', 'actions'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  public dataSource = null;
  private ELEMENT_DATA: TeacherElement[];
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
    private teacherApi: TeacherApiService,
    private departmentApi: DepartmentApiService,
    private toastr: ToastrService,
    private excelExportService: IgxExcelExporterService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = false;
    this.searching = false;
    this.index = 0;
    this.dataLength = 0;
    this.setDefault()

    this.getTeachersData(this.pageSize, this.pageIndex, this.filter);

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
        case 'department': return item.department.name;
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

    if ( data ) {

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
    this.getTeachersData(this.pageSize, this.pageIndex, this.filter);
  }

  getFilter() {
    this.isLoading = true;
    this.pageSize = 10;
    this.pageIndex = 1;
    this.paginator.pageIndex = 0;
    this.getTeachersData(this.pageSize, this.pageIndex, this.filter)
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

    const dialogRef = this.dialog.open(TeacherDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') {

        this.isLoading = true;
        this.paginator.pageIndex = 0;
        this.getTeachersData(this.pageSize, this.pageIndex, this.filter);
        return;
      }

      if (this.action == 'add') {
        this.createTeacher(result.data);
      } else if (this.action == 'edit') {
        this.updateTeacher(result.data);
      } else if (this.action == 'delete') {
        this.deleteTeacher(result.data);
      }
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

  getTeachersData(pageSize: number, pageIndex: number, filter: any) {
    this.teacherApi.getTeachers(pageSize, pageIndex, filter).subscribe(result => {

      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.setTable();
      this.index = pageSize * (pageIndex-1);
      this.isLoading = false;

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success('Lấy danh sách giáo viên thành công.');
      }
    }, error => {
      this.toastr.error('Lấy danh sách giáo viên thất bại.')
    })
  }

  createTeacher(row_obj) {

    this.teacherApi.createTeacher(this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getTeachersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success('Tạo giáo viên mới thành công.');
    }, error => {
      this.toastr.error('Tạo giáo viên mới thất bại.')
    })
  }

  updateTeacher(row_obj) {

    let data = { name: row_obj.name };

    this.teacherApi.updateTeacher(row_obj.id, data).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getTeachersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success('Thay đổi thông tin giáo viên thành công.');
    }, error => {
      this.toastr.error('Thay đổi thông tin giáo viên thất bại.');
    })

  }

  deleteTeacher(row_obj) {
    this.teacherApi.deleteTeacher(row_obj.id).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getTeachersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success('Xóa giáo viên thành công.');
    }, error => {
      this.toastr.error('Xóa giáo viên thất bại.');
    })
  }

  exportToExcel() {
    if (this.dataLength) {
      this.teacherApi.getTeachers(this.dataLength, 1).subscribe(result => {
        let data = this.getDataExcel(result.data);
        this.excelExportService.exportData(data, new IgxExcelExporterOptions("Danh sách giáo viên"));
      })
    }
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData = {
      name: data.name,
      department: data.department.id,
    }
    return newData;
  }

  getDataExcel(arr) {
    // console.log(arr);
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      let newData = {
        TenGiaoVien: arr[i].name,
        MaGiaoVien: arr[i]._id,
        BoMon: arr[i].department.name,
      }
      newArr.push(newData);
    }
    return newArr;
  }

}
