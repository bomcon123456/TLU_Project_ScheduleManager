import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IgxExcelExporterService, IgxExcelExporterOptions } from "igniteui-angular";

import { DepartmentDialogComponent } from './department-dialog/department-dialog.component';
import { DepartmentElement } from '../../interface/dialog-data';
import { DepartmentApiService } from './../../../../services/department-api.service';


/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.scss']
})
export class DepartmentManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'schoolId', 'name', 'actions'];

  public dataSource = null;
  private ELEMENT_DATA: DepartmentElement[];
  private isLoading: boolean;
  private isFisrtTime: boolean;
  private action: string;
  private width: string;
  private height: string;
  private index: number;
  private dataLength: number;
  private pageSize: number;
  private pageIndex: number;
  private filter: any;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
    private departmentApi: DepartmentApiService,
    private toastr: ToastrService,
    private excelExportService: IgxExcelExporterService) { }

  ngOnInit() {
    this.isFisrtTime = true;
    this.isLoading = false;
    this.index = 0;
    this.dataLength = 0;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.filter = {};

    this.getDepartmentsData(this.pageSize, this.pageIndex, this.filter);
  }

  /**
   * SET
   */

  setTable() {
    this.dataSource.paginator = null;
    this.dataSource.sort = this.sort;
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
    this.getDepartmentsData(this.pageSize, this.pageIndex, this.filter);
  }

  getFilter() {
    this.isLoading = true;
    this.paginator.pageIndex = 0;
    this.pageSize = 10;
    this.pageIndex = 1;
    this.getDepartmentsData(this.pageSize, this.pageIndex, this.filter);
  }

  // openDialog(action, obj): void {

  //   this.action = obj.action = action;

  //   if (this.action != 'delete') {
  //     this.width = '780px';
  //     this.height = '280px';
  //   }
  //   else {
  //     this.width = '460px';
  //     this.height = '230px';
  //   }

  //   const dialogRef = this.dialog.open(DepartmentDialogComponent, {
  //     width: this.width,
  //     height: this.height,
  //     data: obj
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (!result || result.event == 'cancel') return;

  //     if (this.action == 'add') {
  //       this.createDepartment(result.data);
  //     } else if (this.action == 'edit') {
  //       this.updateDepartment(result.data);
  //     } else if (this.action == 'delete') {
  //       this.deleteDepartment(result.data);
  //     }
  //   });
  // }

  /**
   * CRUD
   */

  getDepartmentsData(pageSize: number, pageIndex: number, filter: any) {
    this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.setTable();
      this.index = pageSize * ( pageIndex-1 );
      this.isLoading = false;

      if (this.isFisrtTime) {
        this.isFisrtTime = false;
        this.toastr.success('Lấy danh sách bộ môn thành công.');
        console.log(result.message);

      }
    }, error => {
      this.toastr.error('Lấy danh sách bộ môn thất bại.');
      console.log(error.message);
    })
  }

  exportToExcel() {
    if ( this.dataLength ) {
      this.departmentApi.getDepartments(this.dataLength, 1).subscribe( result => {
        let data = this.getDataExcel(result.data);
        this.excelExportService.exportData(data, new IgxExcelExporterOptions("Danh sách bộ môn"));
      })
    }
  }

  // createDepartment(row_obj) {
  //   console.log(row_obj);

  //   this.departmentApi.createDepartment(this.dataTranform(row_obj)).subscribe(result => {

  //     this.ELEMENT_DATA.unshift(row_obj);
  //     this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  //     this.default();
  //     this.toastr.success(result.message)
  //   }, error => {
  //     this.toastr.error(error.message)
  //   })
  // }

  // updateDepartment(row_obj) {
  //   this.departmentApi.updateDepartment(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

  //     this.dataSource.data.filter((value, key) => {
  //       if (value._id == row_obj._id) {
  //         value = Object.assign(value, row_obj);
  //       }
  //       return true;
  //     });
  //     this.toastr.success(result.message);
  //   }, error => {
  //     this.toastr.error(error.message);
  //   })

  // }

  // deleteDepartment(row_obj) {
  //   this.departmentApi.deleteDepartment(row_obj._id).subscribe(result => {

  //     this.dataSource.data = this.dataSource.data.filter(item => {

  //       return item._id != row_obj._id;
  //     });
  //     this.toastr.success(result.message);
  //   }, error => {
  //     this.toastr.error(error.message);
  //   })
  // }

  /**
   * TRANSFORM DATA
   */

  getDataExcel(arr) {
    console.log(arr);
    let newArr = [];
    for ( let i = 0; i < arr.length; i++ ) {
      let newData = {
        TenBoMon: arr[i].name,
        MaBoMon: arr[i].schoolId,
      }
      newArr.push(newData);
    }
    return newArr;
  }

}
