import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ClassroomDialogComponent } from '../../home-components/classroom-dialog/classroom-dialog.component';
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
  displayedColumns: string[] = ['position', 'id', 'name', 'chairs', 'address', 'type', 'multi', 'actions'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  isLoading = true;
  action: string;

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
    const dialogRef = this.dialog.open(ClassroomDialogComponent, {
      width: '700px',
      height: '450px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (this.action == 'Thêm') {
        this.addRowData(result.data);
      } else if (this.action == 'Sửa') {
        this.updateRowData(result.data);
      } else if (this.action == 'Xóa') {
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
  { id: 'RM001', name: 'Hydrogen', chairs: 20, address: 'H', type: '1', multi: true},
  { id: 'RM002', name: 'Helium', chairs: 30, address: 'He', type: '1' , multi: false},
  { id: 'RM003', name: 'Lithium', chairs: 40, address: 'Li', type: '1' , multi: true},
  { id: 'RM004', name: 'Beryllium', chairs: 50, address: 'Be', type: '1' , multi: true},
  { id: 'RM005', name: 'Boron', chairs: 50, address: 'B', type: '1' , multi: true},
  { id: 'RM006', name: 'Carbon', chairs: 40, address: 'C', type: '1' , multi: false},
  { id: 'RM007', name: 'Nitrogen', chairs: 30, address: 'N', type: '1' , multi: true},
  { id: 'RM008', name: 'Oxygen', chairs: 20, address: 'O', type: '1' , multi: true},
  { id: 'RM009', name: 'Fluorine', chairs: 20, address: 'F', type: '1' , multi: true},
  { id: 'RM010', name: 'Neon', chairs: 30, address: 'Ne', type: '1' , multi: false},
  { id: 'RM011', name: 'Sodium', chairs: 40, address: 'Na', type: '1' , multi: true},
  { id: 'RM012', name: 'Magnesium', chairs: 50, address: 'Mg', type: '1' , multi: true},
  { id: 'RM013', name: 'Aluminum', chairs: 50, address: 'Al', type: '1' , multi: false},
  { id: 'RM014', name: 'Silicon', chairs: 40, address: 'Si', type: '1' , multi: true},
  { id: 'RM015', name: 'Phosphorus', chairs: 30, address: 'P', type: '1' , multi: true},
  { id: 'RM016', name: 'Sulfur', chairs: 20, address: 'S', type: '1' , multi: true},
  { id: 'RM017', name: 'Chlorine', chairs: 20, address: 'Cl', type: '1' , multi: false},
  { id: 'RM018', name: 'Argon', chairs: 30, address: 'Ar', type: '1' , multi: true},
  { id: 'RM019', name: 'Potassium', chairs: 40, address: 'K', type: '1' , multi: true},
  { id: 'RM020', name: 'Calcium', chairs: 50, address: 'Ca', type: '1' , multi: false},
];
