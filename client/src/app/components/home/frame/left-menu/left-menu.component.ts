import { SidenavService } from '../../../../services/sidenav.service';
import { Component, OnInit } from '@angular/core';
import { onSideNavChange, animateText } from '../../../../animations/animations';


interface Page {
  link: string;
  name: string;
  icon: string;
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
    { name: 'Thời khóa biểu', link: '/schedule', icon: 'event_available' },
    { name: 'Quản lý môn học', link: '/course-management', icon: 'menu_book' },
    { name: 'Quản lý phòng', link: '/room-management', icon: 'meeting_room' },
    { name: 'Quản lý giáo viên', link: '/teacher-management', icon: 'school' },
    { name: 'Quản lý bộ môn', link: '/department-management', icon: 'account_balance' },
    { name: 'Quản lý kỳ học', link: '/calendar-management', icon: 'date_range'},
    { name: 'Quản lý lớp học', link: '/classroom-management', icon: 'class'},
    { name: 'Quản lý thời khóa biểu', link: '/schedule-management', icon: 'device_hub' },

  ]

  constructor(private _sidenavService: SidenavService) { }

  ngOnInit() {
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
