import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { Component, OnInit, enableProdMode } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import { tap, debounceTime, switchMap, filter } from 'rxjs/operators';
import { IgxExcelExporterService, IgxExcelExporterOptions } from "igniteui-angular";
import { ToastrService } from 'ngx-toastr';

import { GetFreeApiService } from '../../../../../services/get-free-api.service';
import { TeacherApiService } from './../../../../../services/teacher-api.service';
import { TeacherElement } from './../../../interface/dialog-data';
import { YEARS, SEMESTERS } from './../../../storage/data-storage';

enableProdMode();

@Component({
  selector: 'app-schedule-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent implements OnInit {

  private teacherList: TeacherElement[];
  private years = YEARS;
  private semesters = SEMESTERS;
  private schedule: any;
  private classData: any;
  private isLoading: boolean;
  private height: string;
  private dataUser: any;
  private searching: boolean;
  private teacherSelected: string;
  private semesterSelected: any;
  private yearSelected: string;
  private isTeacherFisrtTime: boolean;

  public ServerSideFilteringCtrl: FormControl = new FormControl();

  constructor(private getFreeApi: GetFreeApiService,
              private teacherApi: TeacherApiService,
              private excelExportService: IgxExcelExporterService,
              private toastr: ToastrService) {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
  }

  ngOnInit() {
    this.isLoading = false;
    this.searching = false;
    this.isTeacherFisrtTime = true;

    if ( this.dataUser.role != 0 ) {
      if ( this.dataUser.department ) {
        let filter = {
          department: this.dataUser.department
        }
        this.getTeacherByDepartmentId(10, 1, filter);
      }
      else {
        this.getTeacherByDepartmentId(10, 1);
      }
    }

    this.ServerSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        debounceTime(1000),
        switchMap(async search => {
          let filter;
          if ( this.dataUser.department ) {
            filter = {
              department: this.dataUser.department,
              name: search
            }
          }
          else {
            filter = {
              name: search
            }
          }
          let res = await this.getTeacherByDepartmentId(10, 1, filter);
          return res;
        }),
        // delay(500)
      )
      .subscribe(filtered => {
        this.searching = false;
      }, error => {
        this.searching = false;
        console.log(error);

      });
    this.classData = null;
  }

  getData() {
    if (this.yearSelected && this.semesterSelected) {
      if (this.dataUser.role == 0) {
        this.isLoading = true;
        this.getTeacherSchedule(this.yearSelected,
                                this.semesterSelected.key.group,
                                this.semesterSelected.key.semester,
                                this.dataUser.username);
      }
      else {
        if ( this.teacherSelected ) {
          this.isLoading = true;
          this.getTeacherSchedule(this.yearSelected,
                                  this.semesterSelected.key.group,
                                  this.semesterSelected.key.semester,
                                  this.teacherSelected);
        }
      }
    }
  }

  printTdNull(data: any, indexRow: number, currentShift: number): any[] {
    let rowLength = data;
    for (let i = 0; i < indexRow; i++) {
      this.schedule[i].data.filter(result => {
        if (this.getEndShift(result.class.shift) >= currentShift) {
          rowLength -= 1;
        }
      })
    }
    return Array(rowLength);
  }

  emptyArray(number): any[] {
    return Array(number);
  }

  haveData(indexRow, indexCol) {
    let data = this.schedule[indexRow].data;
    for (let i = 0; i < data.length; i++) {
      if (data[i].day == indexCol + 2) {
        this.classData = data[i].class;
        return true;
      }
    }
    return false;
  }

  notHaveAnotherData(indexRow: number, indexCol: number, currentShift: number) {
    this.classData = null;
    for (let i = indexRow - 1; i >= 0; i--) { // shift
      for (let x = 0; x < this.schedule[i].data.length; x++) {
        if (this.schedule[i].data[x].day == indexCol + 2) {
          if (this.getEndShift(this.schedule[i].data[x].class.shift) >= currentShift) {
            return false;
          }
        }
      }
    }

    return true;
  }

  printShift(shift) {
    this.classData = null;
    return shift;
  }

  /**
   * CRUD
   */

  getTeacherSchedule(year, group, semester, id) {

    this.getFreeApi.getTeacherSchedule(year, group, semester, id).subscribe(result => {
      this.isLoading = false;
      this.schedule = this.transformTeacherScheduleData(result.data);
      this.toastr.success('Lấy thời khóa biểu thành công.')
    }, error => {
      this.toastr.error('Lấy thời biểu thất bại.')
      console.log(error);
    })
  }

  getTeacherByDepartmentId(pageSize: number, pageIndex: number, filter?: any) {

    return new Promise((resolve, reject) => {
      this.teacherApi.getTeachers(pageSize, pageIndex, filter).subscribe(result => {

        if (this.isTeacherFisrtTime) {
          this.isTeacherFisrtTime = false;
          // this.filteredTeachers.next(result.data);
          this.teacherList = result.data;
        }
        this.teacherList = result.data;
        resolve(result.data);
      }, error => {
        reject(error);
      })
    })
  }

  exportToExcel() {
    if (this.schedule) {
      let id = this.dataUser.username;
      if ( this.teacherSelected ) {
        id = this.teacherSelected;
      }
      this.getFreeApi.getTeacherSchedule(this.yearSelected,
                                        this.semesterSelected.key.group,
                                        this.semesterSelected.key.semester,
                                        id)
      .subscribe(result => {
        let data = this.getDataExcel(result.data);
        this.excelExportService.exportData(data, new IgxExcelExporterOptions(`Thời khóa biểu`));
      })
    }
  }

  /**
   * TRANSFORM DATA
   */

  transformTeacherScheduleData(data) {
    let arr = [];
    for (let shift = 1; shift <= 13; shift++) {
      let dataClass = [];
      data.filter(result => {
        let startShift = this.getStartShift(result.shift);
        if (startShift == shift) {
          let day = this.getDay(result.day);
          dataClass.push({
            day: day,
            class: result
          });
        }
      })
      let obj = {
        shift: shift,
        data: dataClass
      };
      arr.push(obj);
    }
    return arr;
  }

  getStartShift(shift) {
    let indexCut = shift.indexOf('-');
    let startShift = parseInt(shift.substring(0, indexCut));
    return startShift;
  }

  getEndShift(shift) {
    let indexCut = shift.indexOf('-');
    let endShift = parseInt(shift.substring(indexCut + 1));
    return endShift;
  }

  getShiftTotal(indexRow, indexCol) {
    this.height = null;
    let shiftTotal;
    let data = this.schedule[indexRow].data;
    for ( let i = 0; i < data.length; i++ ) {
      if ( data[i].day == indexCol + 2) {
        let shift = data[i].class.shift;
        let indexCut = shift.indexOf('-');
        let startShift = parseInt(shift.substring(0, indexCut));
        let endShift = parseInt(shift.substring(indexCut + 1));
        shiftTotal = endShift - startShift + 1;
        break;
      }
    }
    this.height = this.getHeight(shiftTotal);
    return shiftTotal;
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

  getHeight(n) {
    let number = n*35;
    let height = number.toString() + 'px';
    return height;
  }

  randomColor(name) {

    if ( name.indexOf('_LT') != -1 ) {
      return 'primary';
    }
    else if (name.indexOf('_TH') != -1 ) {
      return 'warn';
    }
    else if (name.indexOf('_BT') != -1 ) {
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
        TenLop: arr[i].name,
        PhongHoc: arr[i].room,
        NgayHoc: this.getDayVn(arr[i].day),
        CaHoc: arr[i].shift,
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
