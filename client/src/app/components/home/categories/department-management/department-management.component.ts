import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

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
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

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


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
    private courseApi: DepartmentApiService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.isFisrtTime = true;
    this.isLoading = true;
    this.index = 0;
    this.dataLength = 17;
    this.pageIndex = 1;
    this.pageSize = 8;

    this.getDepartmentsData(this.pageSize, this.pageIndex);
  }

  getPageEvent(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.index = event.pageSize * event.pageIndex;
    this.getDepartmentsData(this.pageSize, this.pageIndex);
  }

  default() {
    this.dataSource.paginator = null;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '280px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') return;

      if (this.action == 'add') {
        this.createDepartment(result.data);
      } else if (this.action == 'edit') {
        this.updateDepartment(result.data);
      } else if (this.action == 'delete') {
        this.deleteDepartment(result.data);
      }
    });
  }

  getDepartmentsData(pageSize: number, pageIndex: number) {
    this.courseApi.getDepartments(pageSize, pageIndex).subscribe(result => {
      this.ELEMENT_DATA = result.data;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.default();

      if (this.isFisrtTime) {
        this.isLoading = false;
        this.isFisrtTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  createDepartment(row_obj) {
    this.courseApi.createDepartment(this.dataTranform(row_obj)).subscribe(result => {

      this.ELEMENT_DATA.unshift(row_obj);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.default();
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateDepartment(row_obj) {
    this.courseApi.updateDepartment(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

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

  deleteDepartment(row_obj) {
    this.courseApi.deleteDepartment(row_obj._id).subscribe(result => {

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
      schoolId: data.schoolId,
      name: data.name,
    }
    return newData;
  }


}

// const ELEMENT_DATA: DepartmentElement[] = [
//   { _id: 'RM001', name: 'Hydrogen', credits: 20, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM002', name: 'Helium', credits: 30, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM003', name: 'Lithium', credits: 40, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM004', name: 'Beryllium', credits: 50, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM005', name: 'Boron', credits: 50, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM006', name: 'Carbon', credits: 40, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM007', name: 'Nitrogen', credits: 30, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM008', name: 'Oxygen', credits: 20, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM009', name: 'Fluorine', credits: 20, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM010', name: 'Neon', credits: 30, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM011', name: 'Sodium', credits: 40, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM012', name: 'Magnesium', credits: 50, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM013', name: 'Aluminum', credits: 50, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM014', name: 'Silicon', credits: 40, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM015', name: 'Phosphorus', credits: 30, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM016', name: 'Sulfur', credits: 20, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM017', name: 'Chlorine', credits: 20, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM018', name: 'Argon', credits: 30, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM019', name: 'Potassium', credits: 40, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
//   { _id: 'RM020', name: 'Calcium', credits: 50, department: { _id: '5d833af963c4343292d1735a', name: 'Bộ môn Kinh tế quản lý' }, length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
// ];
