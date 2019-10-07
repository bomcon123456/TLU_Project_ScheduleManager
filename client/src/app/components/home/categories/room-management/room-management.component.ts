import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  private isMulti: boolean;
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

  @ViewChild('building', { static: true }) building: ElementRef;
  @ViewChild('floor', { static: true }) floor: ElementRef;
  @ViewChild('minCapacity', { static: true }) minCapacity: ElementRef;
  @ViewChild('maxCapacity', { static: true }) maxCapacity: ElementRef;

  constructor(public dialog: MatDialog,
              private roomApi: RoomApiService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.isFirstTime = true;
    this.isLoading = false;
    this.isMulti = false;
    this.index = 0;
    this.setDefault()

    this.getRoomsData(this.pageSize, this.pageIndex, {});
  }

  /**
   * SET
   */

  setTable() {
    this.dataSource.paginator = null;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'location': return item.location.floor;
        default: return item[property];
      }
    }
    this.dataSource.sort = this.sort;
  }

  setDefault() {
    this.paginator.pageIndex = 0;
    this.pageIndex = 1;
    this.pageSize = 8;
    this.filter = {};
  }

  setLocation(data, obj: string) {

    if ( !this.filter.location ) {
      this.filter.location = {};
      this.filter.location[obj] = data;
    }
    else {
      this.filter.location[obj] = data;

      if ( !this.filter.location[obj] ) {
        delete this.filter.location[obj];
      }
    }
  }

  setCapacity(data, obj: string) {

    if ( !this.filter.capacity ) {
      this.filter.capacity = {};
      this.filter.capacity[obj] = data;
    }
    else {
      this.filter.capacity[obj] = data;
    }
  }

  setMulti() {

    this.isMulti = !this.isMulti;

    if ( !this.isMulti ) {
      delete this.filter.capacity;
    }

    this.minCapacity.nativeElement.value = null;
    this.maxCapacity.nativeElement.value = null;
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
    this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
  }

  getFilter() {
    console.log(this.filter);

    // CHECK CAPACITY

    if (!this.filter.capacity || !this.filter.capacity.min || !this.filter.capacity.max ) {

      delete this.filter.capacity;
      this.minCapacity.nativeElement.value = null;
      this.maxCapacity.nativeElement.value = null;
    }

    // CHECK LOCATION

    if ( !this.filter.location ) {

      delete this.filter.location;
    }
    else {
      if ( this.filter.location.building ) {

        this.filter.location.building = this.filter.location.building.toUpperCase();
      }
    }

    // CHECK MULTI

    if ( this.isMulti ) {

      this.filter.capacity = {};
      this.filter.capacity.min = -1;
      this.filter.capacity.max = -1;
    }

    this.isLoading = true;
    this.paginator.pageIndex = 0;
    this.pageSize = 8;
    this.pageIndex = 1;
    this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
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
      if ( !result || result.event == 'cancel' ) {

        this.isLoading = true;
        this.paginator.pageIndex = 0;
        this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
        return;
      }

      if (this.action == 'add') {
        this.createRoom(result.data);
      } else if (this.action == 'edit') {
        this.updateRoom(result.data);
      } else if (this.action == 'delete') {
        this.deleteRoom(result.data);
      }
    });
  }

  /**
   * CRUD
   */

  getRoomsData(pageSize: number, pageIndex: number, filter: any) {

    this.roomApi.getRooms(pageSize, pageIndex, filter).subscribe( result => {

      this.ELEMENT_DATA = result.data;
      this.dataLength = result.size;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA)
      this.setTable();
      this.index = pageSize * (pageIndex-1);
      this.isLoading = false;

      if (this.isFirstTime) {
        this.isFirstTime = false;
        this.toastr.success(result.message);
      }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  createRoom(row_obj){

    this.roomApi.createRoom(this.dataTranform(row_obj)).subscribe( result => {

      this.isLoading = true;
      this.setDefault();
      this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message)
    }, error => {
      this.toastr.error(error.message)
    })
  }

  updateRoom(row_obj){

    this.roomApi.updateRoom(row_obj._id, this.dataTranform(row_obj)).subscribe(result => {

      this.isLoading = true;
      this.paginator.pageIndex = 0;
      this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })

  }

  deleteRoom(row_obj){

    this.roomApi.deleteRoom(row_obj._id).subscribe(result => {

      this.isLoading = true;
      this.setDefault();
      this.getRoomsData(this.pageSize, this.pageIndex, this.filter);
      this.toastr.success(result.message);
    }, error => {
      this.toastr.error(error.message);
    })
  }

  /**
   * TRANSFORM DATA
   */

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
