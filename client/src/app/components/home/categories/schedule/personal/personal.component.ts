import { Component, OnInit, enableProdMode } from '@angular/core';
import { GetFreeApiService } from '../../../../../services/get-free-api.service';
import * as jwt_decode from 'jwt-decode';

enableProdMode();

@Component({
  selector: 'app-schedule-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent implements OnInit {

  private schedule: any;
  private fakeData = ELEMENT_DATA;
  private classData: any;
  private isLoading: boolean;
  private height: string;
  private dataUser: any;

  constructor(private getFreeApi: GetFreeApiService) {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
  }

  ngOnInit() {
    this.isLoading = true;

    this.getTeacherSchedule('2019-2020', 'Group 1', 'Semester 1', this.dataUser.username);
    this.classData = null;
  }

  ngAfterViewInit() {

    // this.cdRef.detectChanges();
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
      console.log(result.data);

      this.schedule = this.transformTeacherScheduleData(result.data);
      // Fake Data
      // this.schedule = ELEMENT_DATA;
    }, error => {
      console.log(error);
    })
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

  getRandomColor() {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  randomColor(name) {
    console.log(name);

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

}

const ELEMENT_DATA: any[] = [
  {
    shift: 1,
    data:
      [
        {
          day: 2, class: {
            name: 'Test 1',
            shift: '1-2',
            day: 'Monday'
          }
        },
        {
          day: 4, class: {
            name: 'Test 2',
            shift: '1-3',
            day: 'Wednesday'
          }
        },
        {
          day: 5, class: {
            name: 'Test 3',
            shift: '1-4',
            day: 'Thursday'
          }
        },
        {
          day: 7, class: {
            name: 'Test 4',
            shift: '1-2',
            day: 'Saturday'
          }
        }
      ]
  },
  {
    shift: 2,
    data:
      [
        {
          day: 3, class: {
            name: 'Test 5',
            shift: '2-3',
            day: 'Tuesday'
          }
        },
        {
          day: 6, class: {
            name: 'Test 6',
            shift: '2-4',
            day: 'Friday'
          }
        },
      ]
  },
  {
    shift: 3,
    data: []
  },
  {
    shift: 4,
    data: []
  },
  {
    shift: 5,
    data: []
  },
  {
    shift: 6,
    data: [
      {
        day: 2, class: {
          name: 'Test 7',
          shift: '6-8',
          day: 'Monday'
        }
      },
      {
        day: 3, class: {
          name: 'Test 8',
          shift: '6-8',
          day: 'Tuesday'
        }
      },
      {
        day: 6, class: {
          name: 'Test 9',
          shift: '6-9',
          day: 'Friday'
        }
      },
      {
        day: 7, class: {
          name: 'Test 10',
          shift: '6-7',
          day: 'Saturday'
        }
      },
    ]
  },
  {
    shift: 7,
    data: []
  },
  {
    shift: 8,
    data: []
  },
  {
    shift: 9,
    data: []
  },
  {
    shift: 10,
    data: []
  },
  {
    shift: 11,
    data: []
  },
  {
    shift: 12,
    data: []
  },
  {
    shift: 13,
    data: []
  }
]
