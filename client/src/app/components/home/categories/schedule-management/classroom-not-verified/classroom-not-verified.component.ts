import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService } from '../../../storage/storage.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-classroom-not-verified',
  templateUrl: './classroom-not-verified.component.html',
  styleUrls: ['./classroom-not-verified.component.scss']
})
export class ClassroomNotVerifiedComponent implements OnInit {

  public notApprovedColumns: string[] = ['position', 'name', 'course', 'room', 'students', 'teacher', 'shift', 'day', 'status', 'action'];

  public dataSourceNotApproved: any;

  private departmentSelected: any;
  private semesterSelected: any;

  private yearSelected: string;

  private totalNotApproved: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private storageApi: StorageService) {}

  ngOnInit() {
    this.departmentSelected = this.storageApi.departmentSelected;
    this.semesterSelected = this.storageApi.semesterSelected;
    this.yearSelected = this.storageApi.yearSelected;
    this.totalNotApproved = 0;
    this.dataSourceNotApproved = new MatTableDataSource(ELEMENT_DATA);
  }

  setTable() {
    this.dataSourceNotApproved.paginator = this.paginator;
  }

}

export interface PeriodicElement {
  position: number,
  name: string,
  course: string,
  room: number,
  students: number,
  teacher: string,
  shift: '1-1', day: 'monday', status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', course: 'abc', room: 1.0079, students: 90, teacher: 'Alan', shift: '1-1', day: 'monday', status: 'H' },
];
