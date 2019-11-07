import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { IgxExcelExporterService, IgxExcelExporterOptions } from "igniteui-angular";

import { ScheduleApiService } from 'src/app/services/schedule-api.service';
import { DepartmentApiService } from './../../../../../services/department-api.service';
import { DepartmentElement } from './../../../interface/dialog-data';
import { YEARS, SEMESTERS } from './../../../storage/data-storage';

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
    private toastr: ToastrService,
    private excelExportService: IgxExcelExporterService) {
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
      this.schedule = this.transformScheduleData(result.data);
      this.toastr.success('Lấy thời khóa biểu toàn trường thành công.');
    }, error => {
      this.toastr.error('Lấy thời khóa biểu toàn trường thất bại.')
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

  exportToExcel() {
    if (this.schedule) {
      this.scheduleApi.getSchedule(this.filter.year,
                                  this.filter.group,
                                  this.filter.semesters)
        .subscribe(result => {
          let data = this.getDataExcel(result.data);
          this.excelExportService.exportData(data, new IgxExcelExporterOptions(`Thời khóa biểu toàn trường`));
        })
    }
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

  randomColor(name) {

    if (name.indexOf('_LT') != -1) {
      return 'primary';
    }
    else if (name.indexOf('_TH') != -1) {
      return 'warn';
    }
    else if (name.indexOf('_BT') != -1) {
      return 'accent';
    }
    else {
      return 'primary';
    }

    // let color = Math.floor(Math.random() * 3) + 1;
    // switch (color) {
    //   case 1: return 'primary';
    //   case 2: return 'accent';
    //   case 3: return 'warn';
    // }
  }

  getDataExcel(arr) {
    console.log(arr);
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      let newData = {
        MaHocPhan: arr[i].courseId._id,
        TenHocPhan: arr[i].courseId.name,
        TenLop: arr[i].name,
        NgayHoc: this.getDayVn(arr[i].date.day),
        CaHoc: arr[i].date.shift,
        PhongHoc: arr[i].roomId.name,
        SoLuongSinhVien: arr[i].students,
        GiaoVien: arr[i].teacherId.name + `(${arr[i].teacherId._id})`,
      }
      newArr.push(newData);
    }
    return newArr;
  }

  getDayVn(day) {
    switch (day) {
      case 'Monday': return 'Thứ hai';
      case 'Tuesday': return 'Thứ ba';
      case 'Wednesday': return 'Thứ tư';
      case 'Thursday': return 'Thứ năm';
      case 'Friday': return 'Thứ sáu';
      case 'Saturday': return 'Thứ bảy';
      case 'Sunday': return 'Chủ nhật';
    }
  }

}
