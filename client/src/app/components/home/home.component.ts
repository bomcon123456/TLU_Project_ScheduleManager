import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { onMainContentChange } from '../../animations/animations';
import { SidenavService } from './../../services/sidenav.service';
import { AuthenticationService } from './../_services/authentication.service';
import * as jwt_decode from 'jwt-decode';
import { StorageService } from './storage/storage.service';
import { UserApiService } from '../../services/user-api.service';

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
              private authService: AuthenticationService,
              private userApi: UserApiService,
              private storage: StorageService) {

    let token = JSON.parse(localStorage.getItem('currentUser'));
    let dataUser = jwt_decode(token.token);
    console.log(dataUser);


    if ( !this.storage.avatarUser ) {
      console.log(this.storage.avatarUser);

      this.storage.avatarUser = 'https://a57.foxnews.com/media2.foxnews.com/BrightCove/694940094001/2018/06/21/931/524/694940094001_5800293009001_5800284148001-vs.jpg?ve=1&tl=1';
      this.getUser(dataUser.userId);
    }

    this._sidenavService.sideNavState$.subscribe(res => {
      console.log(res)
      this.onSideNavChange = res;
    })
   }

  ngOnInit() {
  }

  getUser(id) {
    this.userApi.getUser(id).subscribe( result => {
      this.storage.setFullUserName(result.user.name);
    }, error => {
      console.log(error);
    })
  }
}
