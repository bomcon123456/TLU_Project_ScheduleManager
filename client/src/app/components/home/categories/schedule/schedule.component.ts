import { Component, OnInit, ViewChild } from '@angular/core';
import { GetFreeApiService } from '../../../../services/get-free-api.service';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-semester-management',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  private schedule: any;
  private fakeData = ELEMENT_DATA;
  private countDay: number;
  private checkPoint: number;
  private classData: any;

  constructor(private getFreeApi: GetFreeApiService) {}

  ngOnInit() {
    this.getTeacherSchedule('2019-2020', 'Group 1', 'Semester 1', 'CTI011');
    this.countDay = 2;
    this.checkPoint = 0;
    this.classData = null;
  }

  printTdNull(data: any, indexRow: number, currentShift: number): any[] {
    let rowLength = data;
    for ( let i = 0; i < indexRow; i++) {
      this.schedule[i].data.filter( result => {
        if ( this.getEndShift(result.class.shift) >= currentShift ) {
          rowLength -= 1;
        }
      })
    }
    return Array(rowLength);
  }

  emptyArray(number): any[] {
    return Array(number);
  }

  checkHaveWhatData(indexRow, indexCol, currentShift) {




    // let isHaveData = false;
    // let day = indexCol + 2;

    // for (let i = 0; i < indexRow; i++) {
    //   this.schedule[i].data.filter(result => {
    //     if (result.day == day) {
    //       if (this.getEndShift(result.class.shift) >= currentShift) {
    //         this.countDay++;
    //         isHaveData = true;
    //       }
    //     }
    //   })
    // }

    // if ( isHaveData == false ) {
    //   return false;
    // }
    // else {
    //   for ( let i = 1; i < 7; i++) {
    //     isHaveData = false;
    //     let day = indexCol + 2;
    //     for (let i = 0; i < indexRow; i++) {
    //       this.schedule[i].data.filter(result => {
    //         if (result.day == day) {
    //           if (this.getEndShift(result.class.shift) >= currentShift) {
    //             this.countDay++;
    //             isHaveData = true;
    //           }
    //         }
    //       })
    //     }
    //     if ( !isHaveData ) {
    //       break;
    //     }
    //   }
    // }


  }

  haveData(indexRow, indexCol) {
    // console.log('indexRow: ', index);
    // console.log('day: ', key);
    // this.checkPoint++;
    // let data;
    // console.log(this.schedule[index].data);
    let data = this.schedule[indexRow].data;
    for ( let i = 0; i < data.length; i++ ) {
      if ( data[i].day == indexCol+2 ) {
        this.classData = data[i].class;
        console.log(indexRow, indexCol, data[i]);

        return true;
      }
    }
    return false;

    // this.schedule[indexRow].data.filter( result => {
    //   if ( result.day == indexCol+2 ) {
    //     this.classData = result.class;
    //     console.log(this.classData);
    //     console.log(result);

    //     // data = result;
    //     return true;
    //   }
    // })
    // return false;
  }

  notHaveAnotherData(indexRow: number, indexCol: number, currentShift: number) {
    // console.log('indexRow: ',indexRow);
    // console.log('indexCol: ',indexCol);
    // console.log('currentShift: ',currentShift);

    // let isHaveData = false;
    // let day = indexCol + 2;
    // for ( let i = 0; i < indexRow; i++ ) {
    //   this.schedule[i].data.filter( result => {
    //     if ( result.day == day ) {
    //       if ( this.getEndShift(result.class.shift) >= currentShift ) {
    //         this.countDay++;
    //         isHaveData = true;
    //       }
    //     }
    //   })
    // }
    // return isHaveData;

    // let day = this.checkPoint + 2;
    this.classData = null;
    for(let i = indexRow - 1; i >= 0; i--){ // shift
      for (let x = 0; x < this.schedule[i].data.length; x++){
        if (this.schedule[i].data[x].day == indexCol+2){
          if (this.getEndShift(this.schedule[i].data[x].class.shift) >= currentShift){
            return false;
          }
        }
      }
    }

    return true;
  }

  printShift(shift) {
    this.classData = null;
    this.countDay = 2;
    return shift;
  }

  /**
   * CRUD
   */

   getTeacherSchedule(year, group, semester, id) {
     this.getFreeApi.getTeacherSchedule(year, group, semester, id).subscribe( result => {
      //  this.schedule = this.transformData(result.data);
      // Fake Data
      this.schedule = ELEMENT_DATA;
      //  console.log(this.schedule);

     }, error => {
       console.log(error);
     })
   }

  /**
   * TRANSFORM DATA
   */

  transformData(data) {
    let arr = [];
    for ( let shift = 1; shift <= 13; shift++ ) {
      let dataClass = [];
      data.filter( result => {
        let startShift = this.getStartShift(result.shift);
        if ( startShift == shift ) {
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
    let endShift = parseInt(shift.substring(indexCut+1));
    return endShift;
  }

  getShiftTotal(indexRow, indexCol) {

    // if ( this.classData ) {
      let shiftTotal;
      this.schedule[indexRow].data.filter( result => {
        if ( result.day == indexCol+2 ) {
          let shift = result.class.shift;
          let indexCut = shift.indexOf('-');
          let startShift = parseInt(shift.substring(0, indexCut));
          let endShift = parseInt(shift.substring(indexCut + 1));
          shiftTotal = endShift - startShift + 1;
        }
      })
      // console.log(shiftTotal);
      // this.classData = null;
      return shiftTotal;
    // }
    // return 1;
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

}

export interface PeriodicElement {
  name: any[];
  position: number;
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





