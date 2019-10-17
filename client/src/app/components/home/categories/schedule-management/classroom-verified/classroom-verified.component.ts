import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';

import { StorageService } from '../../../storage/storage.service';
import { DepartmentApiService } from '../../../../../services/department-api.service';
import { SEMESTERS, YEARS } from '../../../storage/data-storage';

@Component({
  selector: 'app-classroom-verified',
  templateUrl: './classroom-verified.component.html',
  styleUrls: ['./classroom-verified.component.scss']
})
export class ClassroomVerifiedComponent implements OnInit {

  public ApprovedColumns: string[] = ['position', 'name', 'course', 'room', 'students', 'teacher', 'shift', 'day', 'status', 'action'];

  public dataSourceApproved: any;

  private departmentSelected: any;
  private semesterSelected: any;

  private yearSelected: string;

  private totalApproved: number;

  private isFirstTime: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private storageApi: StorageService,
              private departmentApi: DepartmentApiService) {

    this.isFirstTime = true;
    this.yearSelected = YEARS[0];
    this.semesterSelected = SEMESTERS[0];
    this.departmentApi.getDepartments(1, 1).subscribe( result => {
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

  async ngOnInit() {

    this.totalApproved = 0;
    this.dataSourceApproved = new MatTableDataSource(ELEMENT_DATA);
  }

  setTable() {
    this.dataSourceApproved.paginator = this.paginator;
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
