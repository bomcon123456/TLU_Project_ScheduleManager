import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { animateText } from './../../../../animations/animations';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [animateText]
})
export class HeaderComponent implements OnInit {

  @Input() sidenav: MatSidenav;

  private fullNameUser: string;
  private avatarUser: string;

  constructor(private router: Router,
              private storage: StorageService) {

    this.avatarUser = this.storage.avatarUser;
    console.log(this.storage.avatarUser);

  }

  ngOnInit() {
  }

  get getFullNameUser() {
    let name;
    this.storage.currentFullNameUser.subscribe( res => {
      name = res
    });
    return name;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
