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
  selector: 'app-schedule-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.scss']
})
export class SchoolComponent implements OnInit {

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
    if ( this.yearSelected && this.semesterSelected ) {

      this.filter = {
        group: this.semesterSelected.key.group,
        semesters: this.semesterSelected.key.semester,
        year: this.yearSelected
      }
      this.getClassroomsData(this.filter.year, this.filter.group, this.filter.semesters);
    }
  }

  emptyArray(number): any[] {
    return Array(number);
  }

  /**
   * CRUD
   */

  getClassroomsData(year, group, semester) {
    this.scheduleApi.getSchedule(year, group, semester).subscribe(result => {

      this.isLoading = false;
      console.log(result);

      this.schedule = this.transformScheduleData(result.data);
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

  transformScheduleData(data) {
    let arr = [];
    for (let day = 2; day <= 8; day++) {
      let dataClass = [];
      data.filter(result => {
        if (this.getDay(result.date.day) == day) {
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
