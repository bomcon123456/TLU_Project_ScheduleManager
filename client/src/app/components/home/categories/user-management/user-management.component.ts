import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { UserApiService } from '../../../../services/user-api.service';
import { DepartmentApiService } from '../../../../services/department-api.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

/**
 * @title Table with pagination
 */

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'name', 'username', 'role', 'department', 'birthday', 'gender', 'actions'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  public dataSource = null;
  private ELEMENT_DATA: any[];
  private isLoading: boolean;
  private isFirstTime: boolean;
  private action: string;
  private width: string;
  private height: string;
  private index: number;
  private dataLength: number;
  private pageSize: number;
  private pageIndex: number;
  private filter: any;
  private departmentList: any[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  @ViewChild('building', { static: true }) building: ElementRef;
  @ViewChild('floor', { static: true }) floor: ElementRef;
  @ViewChild('minCapacity', { static: true }) minCapacity: ElementRef;
  @ViewChild('maxCapacity', { static: true }) maxCapacity: ElementRef;

  constructor(public dialog: MatDialog,
              private userApi: UserApiService,
              private toastr: ToastrService,
              private departmentApi: DepartmentApiService) {

    this.getDepartments();
  }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = false;
    this.index = 0;
    this.setDefault()

    this.getUsersData(this.pageSize, this.pageIndex);
  }

  /**
   * SET
   */

  setTable() {
    this.dataSource.paginator = null;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        default: return item[property];
      }
    }
    this.dataSource.sort = this.sort;
  }

  setDefault() {
    this.paginator.pageIndex = 0;
    this.pageIndex = 1;
    this.pageSize = 297;
    this.filter = {};
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
    this.getUsersData(this.pageSize, this.pageIndex, this.filter);
  }

  // getFilter() {
  //   console.log(this.filter);

  //   // CHECK CAPACITY

  //   if (!this.filter.capacity || !this.filter.capacity.min || !this.filter.capacity.max) {

  //     delete this.filter.capacity;
  //     this.minCapacity.nativeElement.value = null;
  //     this.maxCapacity.nativeElement.value = null;
  //   }

  //   // CHECK LOCATION

  //   if (!this.filter.location) {

  //     delete this.filter.location;
  //   }
  //   else {
  //     if (this.filter.location.building) {

  //       this.filter.location.building = this.filter.location.building.toUpperCase();
  //     }
  //   }

  //   this.isLoading = true;
  //   this.paginator.pageIndex = 0;
  //   this.pageSize = 10;
  //   this.pageIndex = 1;
  //   this.getUsersData(this.pageSize, this.pageIndex, this.filter);
  // }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '350px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') {

        this.isLoading = true;
        this.paginator.pageIndex = 0;
        this.getUsersData(this.pageSize, this.pageIndex, this.filter);
        return;
      }

      if (this.action == 'add') {
        this.createUser(result.data);
      } else if (this.action == 'edit') {
        this.updateUser(result.data);
      } else if (this.action == 'delete') {
        this.deleteUser(result.data);
      }
    });
  }

  /**
   * CRUD
   */

  getUsersData(pageSize: number, pageIndex: number, filter?: any) {

    this.userApi.getUsers(pageSize, pageIndex, filter).subscribe(result => {

      this.ELEMENT_DATA = result;
      // this.dataLength = result.size;
      this.dataLength = 297;
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

  createUser(row_obj) {

    this.userApi.createUser(this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getUsersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateUser(row_obj) {
    console.log(row_obj);

    this.userApi.updateUser(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getUsersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteUser(row_obj) {

    this.userApi.deleteUser(row_obj._id).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getUsersData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  getDepartments() {
    let size = 50;
    let page = 1;
    this.departmentApi.getDepartments(size, page).subscribe( result => {
      this.departmentList = result.data;
      this.toastr.success(result.message);
    }, error => {
      console.log(error);
    })
  }

  /**
   * TRANSFORM DATA
   */

  dataTranform(data) {
    let newData;
    let obj = {
      name: data.name,
      username: data.username,
      role: data.role,
    }

    if ( data.department ) {
      newData = { ...obj, department: data.department };
    }
    else {
      newData = obj;
    }
    return newData;
  }

  getDepartmentName(id) {
    for ( let i = 0; i < this.departmentList.length; i++) {
      if ( id == this.departmentList[i]._id ) {
        return this.departmentList[i].name;
      }
    }
  }

  transformRole(role) {
    switch (role) {
      case 99: return 'Admin';
      case 2: return 'Phòng đào tạo';
      case 1: return 'Người phụ trách bộ môn';
      case 0: return 'Giáo viên';
    }
  }

  transformGender(gender) {
    switch (gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'unspecified': return 'Không xác định';
      case 'null': return '';
      default: return null;
    }
  }

  transformDate(time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let y = year.toString();
    let m = month.toString();
    let d = day.toString();

    if (year <= 1990) {
      return null;
    }

    if (day < 10) {
      d = '0' + d;
    }

    if (month < 10) {
      m = '0' + m;
    }

    return d + '-' + m + '-' + y;
  }

}
