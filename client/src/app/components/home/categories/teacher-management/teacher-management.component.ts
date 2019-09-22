import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { TeacherDialogComponent } from './teacher-dialog/teacher-dialog.component';
import { TeacherElement } from '../../interface/dialog-data';
import { TeacherApiService } from './../../../../services/teacher-api.service';


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
  private isLoading = true;
  private action: string;
  private width: string;
  private height: string;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog,
    private teacherApi: TeacherApiService,
    private toastr: ToastrService) { }

  ngOnInit() {

    this.getTeachersData();


    // setTimeout(() => {
    //   this.isLoading = false;
    // }, 3000);
  }

  default() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '365px';
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
      if (!result || result.event == 'cancel') return;

      if (this.action == 'add') {
        this.createTeacher(result.data);
      } else if (this.action == 'edit') {
        this.updateTeacher(result.data);
      } else if (this.action == 'delete') {
        this.deleteTeacher(result.data);
      }
    });
  }

  getTeachersData() {
    this.teacherApi.getTeachers().subscribe(result => {
      this.ELEMENT_DATA = result.data;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.isLoading = false;
      this.default();
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message)
    })
  }

  createTeacher(row_obj) {
    this.teacherApi.createTeacher(this.dataTranform(row_obj)).subscribe(result => {

      this.ELEMENT_DATA.unshift(row_obj);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.default();
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateTeacher(row_obj) {
    this.teacherApi.updateTeacher(row_obj._id, row_obj.name).subscribe(result => {

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

  deleteTeacher(row_obj) {
    this.teacherApi.deleteTeacher(row_obj._id).subscribe(result => {

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
      name: data.name,
      department: data.department._id,
    }
    return newData;
  }


}

// const ELEMENT_DATA: CourseElement[] = [
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
