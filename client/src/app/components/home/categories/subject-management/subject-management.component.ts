import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SubjectDialogComponent } from './subject-dialog/subject-dialog.component';
import { CourseElement } from '../../interface/dialog-data';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-subject-management',
  templateUrl: './subject-management.component.html',
  styleUrls: ['./subject-management.component.scss']
})
export class SubjectManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'id', 'name', 'credits', 'department', 'theory', 'practice', 'coursePrereq', 'creditPrereq', 'actions'];
  public dataSource = new MatTableDataSource(ELEMENT_DATA);

  private isLoading = true;
  private action: string;
  private width: string;
  private height: string;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {
    this.action = obj.action = action;

    if (this.action != 'delete') {
      this.width = '780px';
      this.height = '475px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(SubjectDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.event == 'cancel') return;

      if (this.action == 'add') {
        this.addRowData(result.data);
      } else if (this.action == 'edit') {
        this.updateRowData(result.data);
      } else if (this.action == 'delete') {
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(row_obj) {
    this.dataSource.data.push(row_obj);
    this.table.renderRows();
  }
  updateRowData(row_obj) {
    let data = this.dataSource.data.filter((value, key) => {
      if (value.id == row_obj.id) {
        value = Object.assign(value, row_obj);
      }
      return true;
    });
  }
  deleteRowData(row_obj) {
    this.dataSource.data = this.dataSource.data.filter(item => {
      return item.id != row_obj.id;
    });
  }


}

const ELEMENT_DATA: CourseElement[] = [
  { id: 'RM001', name: 'Hydrogen', credits: 20, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM002', name: 'Helium', credits: 30, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM003', name: 'Lithium', credits: 40, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM004', name: 'Beryllium', credits: 50, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM005', name: 'Boron', credits: 50, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM006', name: 'Carbon', credits: 40, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM007', name: 'Nitrogen', credits: 30, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM008', name: 'Oxygen', credits: 20, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM009', name: 'Fluorine', credits: 20, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM010', name: 'Neon', credits: 30, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM011', name: 'Sodium', credits: 40, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM012', name: 'Magnesium', credits: 50, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM013', name: 'Aluminum', credits: 50, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM014', name: 'Silicon', credits: 40, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM015', name: 'Phosphorus', credits: 30, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM016', name: 'Sulfur', credits: 20, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM017', name: 'Chlorine', credits: 20, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM018', name: 'Argon', credits: 30, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM019', name: 'Potassium', credits: 40, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
  { id: 'RM020', name: 'Calcium', credits: 50, department: 'Bộ môn Toán', length: { theory: 40, practice: null }, coursePrerequisites: [ 'Giải tích 1', 'Đại số tuyến tính' ], creditPrerequisites: 60 },
];
