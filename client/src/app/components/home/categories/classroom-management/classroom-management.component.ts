import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ClassroomDialogComponent } from './classroom-dialog/classroom-dialog.component';
import { ClassroomElement } from '../../interface/dialog-data';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-classroom-management',
  templateUrl: './classroom-management.component.html',
  styleUrls: ['./classroom-management.component.scss']
})
export class ClassroomManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'id', 'name', 'capacity', 'location', 'roomType', 'multi', 'actions'];
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

    if ( this.action != 'delete' ) {
      this.width = '780px';
      this.height = '475px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(ClassroomDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( !result || result.event == 'cancel' ) return;

      if (this.action == 'add') {
        this.addRowData(result.data);
      } else if (this.action == 'edit') {
        this.updateRowData(result.data);
      } else if (this.action == 'delete') {
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(row_obj){
    this.dataSource.data.push(row_obj);
    this.table.renderRows();
  }
  updateRowData(row_obj){
    let data = this.dataSource.data.filter((value, key) => {
      if(value.id == row_obj.id){
        value = Object.assign(value, row_obj);
      }
      return true;
    });
  }
  deleteRowData(row_obj){
    this.dataSource.data = this.dataSource.data.filter(item => {
      return item.id != row_obj.id;
    });
  }


}

const ELEMENT_DATA: ClassroomElement[] = [
  { id: 'RM001', name: 'Hydrogen', capacity: 20, location: { building: 'B', floor: '4' }, roomType: '1', multi: true},
  { id: 'RM002', name: 'Helium', capacity: 30, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
  { id: 'RM003', name: 'Lithium', capacity: 40, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM004', name: 'Beryllium', capacity: 50, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM005', name: 'Boron', capacity: 50, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM006', name: 'Carbon', capacity: 40, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
  { id: 'RM007', name: 'Nitrogen', capacity: 30, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM008', name: 'Oxygen', capacity: 20, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM009', name: 'Fluorine', capacity: 20, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM010', name: 'Neon', capacity: 30, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
  { id: 'RM011', name: 'Sodium', capacity: 40, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM012', name: 'Magnesium', capacity: 50, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM013', name: 'Aluminum', capacity: 50, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
  { id: 'RM014', name: 'Silicon', capacity: 40, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM015', name: 'Phosphorus', capacity: 30, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM016', name: 'Sulfur', capacity: 20, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM017', name: 'Chlorine', capacity: 20, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
  { id: 'RM018', name: 'Argon', capacity: 30, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM019', name: 'Potassium', capacity: 40, location: { building: 'B', floor: '4' }, roomType: '1' , multi: true},
  { id: 'RM020', name: 'Calcium', capacity: 50, location: { building: 'B', floor: '4' }, roomType: '1' , multi: false},
];
