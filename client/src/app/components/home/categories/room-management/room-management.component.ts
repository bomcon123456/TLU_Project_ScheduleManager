import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { RoomDialogComponent } from './room-dialog/room-dialog.component';
import { RoomElement } from '../../interface/dialog-data';
import { RoomApiService } from './../../../../services/room-api.service';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss']
})
export class RoomManagementComponent implements OnInit {

  public displayedColumns: string[] = ['position', 'name', 'capacity', 'location', 'roomType', 'multi', 'actions'];
  // public dataSource = new MatTableDataSource(ELEMENT_DATA);

  public dataSource = null;
  private ELEMENT_DATA: RoomElement[];
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
              private roomApi: RoomApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = true;
    this.index = 0;
    this.dataLength = 111;
    this.pageIndex = 1;
    this.pageSize = 8;

    this.getRoomsData(this.pageSize, this.pageIndex);
  }

  getPageEvent(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex + 1;
    this.index = event.pageSize * event.pageIndex;
    this.getRoomsData(this.pageSize, this.pageIndex);
  }

  default() {
    this.dataSource.paginator = null;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action, obj): void {
    console.log(obj);

    this.action = obj.action = action;

    if ( this.action != 'delete' ) {
      this.width = '780px';
      this.height = '450px';
    }
    else {
      this.width = '460px';
      this.height = '230px';
    }

    const dialogRef = this.dialog.open(RoomDialogComponent, {
      width: this.width,
      height: this.height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( !result || result.event == 'cancel' ) return;

      console.log(result);


      if (this.action == 'add') {
        this.createRoom(result.data);
      } else if (this.action == 'edit') {
        this.updateRoom(result.data);
      } else if (this.action == 'delete') {
        this.deleteRoom(result.data);
      }
    });
  }

  getRoomsData(pageSize: number, pageIndex: number) {
    this.roomApi.getRooms(pageSize, pageIndex).subscribe( result => {
      console.log(result);

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

  createRoom(row_obj){

    this.roomApi.createRoom(this.dataTranform(row_obj)).subscribe( result => {

      this.ELEMENT_DATA.unshift(row_obj);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.default();
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateRoom(row_obj){

    this.roomApi.updateRoom(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

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

  deleteRoom(row_obj){

    this.roomApi.deleteRoom(row_obj._id).subscribe(result => {

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
      capacity: data.capacity,
      location: {
        building: data.location.building,
        floor: data.location.floor
      },
      roomType: data.roomType
    }
    return newData;
  }

  getFullText(data) {
    if (data == "TH") {
      return "Thực hành";
    }
    if (data == "LT") {
      return "Lý thuyết";
    }
    if (data == "TC") {
      return "Thể chất";
    }
  }


}

// const ELEMENT_DATA: RoomElement[] = [
//   { _id: 'RM001', name: 'Hydrogen', capacity: 20, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM002', name: 'Helium', capacity: 30, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM003', name: 'Lithium', capacity: 40, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM004', name: 'Beryllium', capacity: 50, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM005', name: 'Boron', capacity: 50, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM006', name: 'Carbon', capacity: 40, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM007', name: 'Nitrogen', capacity: 30, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM008', name: 'Oxygen', capacity: 20, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM009', name: 'Fluorine', capacity: 20, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM010', name: 'Neon', capacity: 30, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM011', name: 'Sodium', capacity: 40, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM012', name: 'Magnesium', capacity: 50, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM013', name: 'Aluminum', capacity: 50, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM014', name: 'Silicon', capacity: 40, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM015', name: 'Phosphorus', capacity: 30, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM016', name: 'Sulfur', capacity: 20, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM017', name: 'Chlorine', capacity: 20, location: { building: 'B', floor: 4 }, roomType: '1'},
//   { _id: 'RM018', name: 'Argon', capacity: 30, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM019', name: 'Potassium', capacity: 40, location: { building: 'B', floor: 4 }, roomType: '1' },
//   { _id: 'RM020', name: 'Calcium', capacity: 50, location: { building: 'B', floor: 4 }, roomType: '1'},
// ];
