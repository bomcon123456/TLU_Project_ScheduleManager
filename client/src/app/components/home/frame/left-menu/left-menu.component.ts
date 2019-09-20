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
    { name: 'Quản lý môn học', link: '/subject-management', icon: 'menu_book' },
    { name: 'Quản lý phòng học', link: '/classroom-management', icon: 'meeting_room' },
    { name: 'Quản lý kỳ học', link: '/semester-management', icon: 'date_range' },
  ]

  constructor(private _sidenavService: SidenavService) { }

  ngOnInit() {
  }

  onSinenavToggle() {
    this.sideNavState = !this.sideNavState

    setTimeout(() => {
      this.linkText = this.sideNavState;
    }, 150)
    this._sidenavService.sideNavState$.next(this.sideNavState)

    return this.sideNavState;
  }

}
