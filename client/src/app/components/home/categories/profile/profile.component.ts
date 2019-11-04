import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../storage/storage.service';
import { UserApiService } from '../../../../services/user-api.service';
import { DepartmentApiService } from '../../../../services/department-api.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private userData: any;
  private department: any;

  constructor(private storage: StorageService,
              private userApi: UserApiService,
              private departmentApi: DepartmentApiService,
               private toastr: ToastrService) {
    // console.log(this.storage.avatarUser);

    let token = JSON.parse(localStorage.getItem('currentUser'));
    let dataUser = jwt_decode(token.token);

    // this.storage.setFullUserName('Đại học Thăng Long');
    this.getUserData(dataUser.userId);
  }

  ngOnInit() {
  }

  click() {
    this.storage.setFullUserName('Thăng Long University');
  }

  updateProfile(data) {
    this.updateUserData(this.userData._id, data);

  }

  get getFullNameUser() {
    let name;
    this.storage.currentFullNameUser.subscribe( res => {
      name = res;
    });
    return name;
  }

  getUserData(id) {
    this.userApi.getUser(id).subscribe( result => {
      this.userData = result.user;
      if ( this.userData.department ) {
        this.getDepartment(this.userData.department);
      }
      else {
        this.department = {
          name: ''
        }
      }
      this.storage.setFullUserName(this.userData.name);
      this.toastr.success(result.message);
    }, error => {
      console.log(error);
    })
  }

  updateUserData(id, data) {
    this.userApi.updateUser(id, data).subscribe( result => {
      this.getUserData(id);
      this.toastr.success(result.message);
    }, error => {
      console.log(error);
    })
  }

  getDepartment(id) {
    this.departmentApi.getDepartment(id).subscribe( result => {
      this.department = result.data;
    })
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
