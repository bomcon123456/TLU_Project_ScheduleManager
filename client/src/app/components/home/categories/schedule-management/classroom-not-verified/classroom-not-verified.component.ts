import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';

import { StorageService } from '../../../storage/storage.service';
import { DepartmentApiService } from '../../../../../services/department-api.service';
import { SEMESTERS, YEARS } from '../../../storage/data-storage';

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

  private isFirstTime: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private storageApi: StorageService,
              private departmentApi: DepartmentApiService) {

    this.isFirstTime = true;
    this.semesterSelected = SEMESTERS[0];
    this.yearSelected = YEARS[0];
    this.departmentApi.getDepartments(1, 1).subscribe(result => {
      this.isFirstTime = false;
      if ( !this.departmentSelected ) {
        this.departmentSelected = result.data[0];
      }
    }, error => {
      console.log(error);
    })
    if (this.storageApi.departmentSelected &&
      this.storageApi.semesterSelected &&
      this.storageApi.yearSelected) {

      this.departmentSelected = this.storageApi.departmentSelected;
      this.semesterSelected = this.storageApi.semesterSelected;
      this.yearSelected = this.storageApi.yearSelected;
    }
  }

  ngOnInit() {
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
