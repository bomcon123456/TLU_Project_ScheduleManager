import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { onMainContentChange } from '../../animations/animations';
import { SidenavService } from './../../services/sidenav.service';
import { AuthenticationService } from './../_services/authentication.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [onMainContentChange ]
})

export class HomeComponent implements OnInit {

  public onSideNavChange: boolean;


  constructor(private router: Router,
              private _sidenavService: SidenavService,
              private authService: AuthenticationService) {
    this._sidenavService.sideNavState$.subscribe(res => {
      console.log(res)
      this.onSideNavChange = res;
    })
   }

  ngOnInit() {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
