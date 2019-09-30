import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { CourseDialogComponent } from './course-dialog/course-dialog.component';
import { CourseElement } from '../../interface/dialog-data';
import { CourseApiService } from './../../../../services/course-api.service';


/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.scss']
})
export class CourseManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', '_id', 'name', 'credits', 'department', 'theory', 'practice', 'coursePrereq', 'creditPrereq', 'actions'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  public dataSource = null;
  private ELEMENT_DATA: CourseElement[];
  private isLoading: boolean;
  private isFirstTime: boolean;
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
              private courseApi: CourseApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = true;
    this.index = 0;
    this.dataLength = 743;
    this.pageIndex = 1;
    this.pageSize = 8;

    this.getCoursesData(this.pageSize, this.pageIndex);
  }

  getPageEvent(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.index = event.pageSize * event.pageIndex;
    this.getCoursesData(this.pageSize, this.pageIndex);
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {

    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '550px';
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

  getCoursesData(pageSize: number, pageIndex: number) {
    this.courseApi.getCourses(pageSize, pageIndex).subscribe( result => {
      this.ELEMENT_DATA = result.data;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.default();

      if (this.isFirstTime) {
        this.isLoading = false;
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  createCourse(row_obj) {
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
        practice: data.length.practice
      },
      coursePrerequisites: data.coursePrerequisites,
      creditPrerequisites: data.creditPrerequisites
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
