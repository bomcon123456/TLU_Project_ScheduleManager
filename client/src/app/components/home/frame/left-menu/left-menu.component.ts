import { SidenavService } from '../../../../services/sidenav.service';
import { Component, OnInit } from '@angular/core';
import { onSideNavChange, animateText } from '../../../../animations/animations';
import * as jwt_decode from 'jwt-decode';

interface Page {
  link: string;
  name: string;
  icon: string;
  role: number;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  animations: [onSideNavChange, animateText]
})
export class LeftMenuComponent implements OnInit {

  public sideNavState: boolean = false;
  public linkText: boolean = false;

  public pages: Page[] = [
    { name: 'Thời khóa biểu', link: '/schedule', icon: 'event_available', role: -1 },
    { name: 'Quản lý lớp học', link: '/classroom-management', icon: 'class', role: 1},
    { name: 'Quản lý môn học', link: '/course-management', icon: 'menu_book', role: 2 },
    { name: 'Quản lý phòng', link: '/room-management', icon: 'meeting_room', role: 2 },
    { name: 'Quản lý giáo viên', link: '/teacher-management', icon: 'school', role: 2 },
    { name: 'Quản lý bộ môn', link: '/department-management', icon: 'account_balance', role: 2 },
    { name: 'Quản lý kỳ học', link: '/calendar-management', icon: 'date_range', role: 2 },
    { name: 'Quản lý thời khóa biểu', link: '/schedule-management', icon: 'device_hub', role: 2 },
    { name: 'Quản lý người dùng', link: '/user-management', icon: 'group', role: 99}

  ]

  constructor(private _sidenavService: SidenavService) { }

  ngOnInit() {
  }

  checkRole(role: number) {
    const token = JSON.parse(localStorage.getItem('currentUser'));
    const tokenPayload = jwt_decode(token.token);

    if ( role == -1 ) {
      return true;
    }

    if ( role == tokenPayload.role ) {
      return true;
    }

    return false;
  }

  onSinenavToggle() {
    this.sideNavState = !this.sideNavState

    setTimeout(() => {
      this.linkText = this.sideNavState;
    }, 200)
    this._sidenavService.sideNavState$.next(this.sideNavState)

    // return this.sideNavState;
  }

}
