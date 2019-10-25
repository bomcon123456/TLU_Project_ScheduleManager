import { DepartmentApiService } from './../../../../../services/department-api.service';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DepartmentElement } from './../../../interface/dialog-data';
import { YEARS, SEMESTERS } from './../../../storage/data-storage';
import * as jwt_decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { ScheduleApiService } from 'src/app/services/schedule-api.service';

@Component({
  selector: 'app-schedule-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {

  private semesterSelected: any;
  private filter: any;
  private dataUser: any;
  private schedule: any;
  private departmentSelected: DepartmentElement;

  private years = YEARS;
  private semesters = SEMESTERS;

  private yearSelected: string;

  private pageSize: number = 100;
  private pageIndex: number = 1;

  public searching: boolean;
  private isLoading: boolean;
  private isFirstTime: boolean;

  public ServerSideCtrl: FormControl = new FormControl();
  public ServerSideFilteringCtrl: FormControl = new FormControl();
  public filteredServerSide: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(private scheduleApi: ScheduleApiService,
              private departmentApi: DepartmentApiService,
              private toastr: ToastrService) {
    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
  }

  ngOnInit() {

    this.ServerSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        debounceTime(1000),
        switchMap(async search => {
          let filter = {
            schoolId: '',
            name: search
          }
          let res = await this.getDepartments(17, 1, filter);
          return res;
        }),
        // delay(500)
      )
      .subscribe(filtered => {
        this.searching = false;
        this.filteredServerSide.next(filtered);
      }, error => {
        this.searching = false;
        console.log(error);

      });

    this.getDepartments(5, 1, {});
  }

  getData() {
    if (this.departmentSelected && this.yearSelected && this.semesterSelected) {
      this.filter = {
        date: {
          group: this.semesterSelected.key.group,
          semesters: this.semesterSelected.key.semester,
          year: this.yearSelected
        },
      }
      if ( this.dataUser.department ) {
        console.log(this.dataUser);

        this.filter.department = this.dataUser.department;
      }
      else {
        console.log(this.departmentSelected);

        this.filter.department = this.departmentSelected;
      }
      this.getClassroomsData(this.filter.date.year, this.filter.date.group, this.filter.date.semesters, this.filter.department);
      // this.setVerifiedTable();
      // this.setNotVerifiedTable();
    }
  }

  emptyArray(number): any[] {
    return Array(number);
  }

  /**
   * CRUD
   */

  getClassroomsData(year, group, semester, department) {
    this.scheduleApi.getDepartmentSchedule(year, group, semester, department).subscribe(result => {

      this.isLoading = false;
      this.schedule = this.transformDepartmentScheduleData(result.data);
      // this.schedule = ELEMENT_DATA;
      console.log(this.schedule);

      // if (this.isFirstTime) {
      //   this.isFirstTime = false;
      //   this.toastr.success(result.message);
      // }
    }, error => {
      this.toastr.error(error.message)
    })
  }

  getDepartments(pageSize: number, pageIndex: number, filter: any) {
    return new Promise((resolve, reject) => {
      this.departmentApi.getDepartments(pageSize, pageIndex, filter).subscribe(result => {

        this.filteredServerSide.next(result.data);
        resolve(result.data);
      }, error => {
        reject(error);

      })
    })
  }

  /**
   * TRANSFORM DATA
   */

  transformDepartmentScheduleData(data) {
    let arr = [];
    for (let day = 2; day <= 8; day++) {
      let dataClass = [];
      data.filter(result => {
        if (this.getDay(result.day) == day) {
          dataClass.push(result);
        }
      })
      let obj = {
        day: day,
        data: dataClass
      };
      arr.push(obj);
    }
    return arr;
  }

  getDay(day) {
    switch (day) {
      case 'Monday': return 2;
      case 'Tuesday': return 3;
      case 'Wednesday': return 4;
      case 'Thursday': return 5;
      case 'Friday': return 6;
      case 'Saturday': return 7;
      case 'Sunday': return 8;
    }
  }

  randomColor() {
    let color = Math.floor(Math.random() * 3) + 1;
    switch (color) {
      case 1: return 'primary';
      case 2: return 'accent';
      case 3: return 'warn';
    }
  }

}

const ELEMENT_DATA: any[] = [
  {
    day: 2,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Monday'

        },
        {
          name: 'Test 2',
          shift: '1-3',
          day: 'Monday'
        },
        {
          name: 'Test 3',
          shift: '1-4',
          day: 'Monday'
        },
        {
          name: 'Test 4',
          shift: '1-2',
          day: 'Monday'
        }
      ]
  },
  {
    day: 3,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Tuesday'

        },
        {
          name: 'Test 2',
          shift: '1-3',
          day: 'Tuesday'
        },
        {
          name: 'Test 4',
          shift: '1-2',
          day: 'Tuesday'
        }
      ]
  },
  {
    day: 4,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Wednesday'

        },
        {
          name: 'Test 2',
          shift: '1-3',
          day: 'Wednesday'
        },
        {
          name: 'Test 3',
          shift: '1-4',
          day: 'Wednesday'
        },
        {
          name: 'Test 4',
          shift: '1-2',
          day: 'Wednesday'
        }
      ]
  },
  {
    day: 5,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Thursday'

        },
        {
          name: 'Test 2',
          shift: '1-3',
          day: 'Thursday'
        },
      ]
  },
  {
    day: 6,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Friday'

        },
      ]
  },
  {
    day: 7,
    data:
      [
        {
          name: 'Test 1',
          shift: '1-2',
          day: 'Saturday'

        },
        {
          name: 'Test 2',
          shift: '1-3',
          day: 'Saturday'
        },
        {
          name: 'Test 3',
          shift: '1-4',
          day: 'Saturday'
        },
      ]
  },
  {
    day: 8,
    data: []
  },

]
