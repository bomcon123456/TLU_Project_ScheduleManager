import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private userId: string;
  private fullNameUser: string;
  private avatarUser: string;

  constructor(private storage: StorageService) {
    // console.log(this.storage.avatarUser);
    this.storage.setFullUserName('Đại học Thăng Long');
  }

  ngOnInit() {
  }

  click() {
    console.log(123);

    this.storage.setFullUserName('Thăng Long University');
  }

  get getFullNameUser() {
    let name;
    this.storage.currentFullNameUser.subscribe( res => {
      name = res;
    });
    return name;
  }
}
