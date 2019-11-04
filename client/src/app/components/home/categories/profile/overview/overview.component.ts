import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  @Input() userData: any;

  constructor() {

  }

  ngOnInit() {
    console.log(this.userData);
  }

  transformGender(gender) {
    switch (gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'unspecified': return 'Không xác định';
      case 'null': return '';
      default: return null;
    }
  }

  transformDate(time) {
    let date = new Date(time);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let y = year.toString();
    let m = month.toString();
    let d = day.toString();

    if (year <= 1990) {
      return null;
    }

    if (day < 10) {
      d = '0' + d;
    }

    if (month < 10) {
      m = '0' + m;
    }

    return d + '-' + m + '-' + y;
  }

}
