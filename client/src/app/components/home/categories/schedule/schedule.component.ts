import { Component, OnInit, ViewChild } from '@angular/core';
import { GetFreeApiService } from '../../../../services/get-free-api.service';
import * as jwt_decode from 'jwt-decode';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'app-semester-management',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  private dataUser: any;

  constructor() {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    this.dataUser = jwt_decode(token.token);
  }

  ngOnInit() {
  }

}
