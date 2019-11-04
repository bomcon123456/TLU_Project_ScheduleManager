import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable()

export class StorageService {
  yearSelected: string;
  yearSelectedAdd: string;
  semesterSelected: any;
  semesterSelectedAdd: any;
  departmentSelected: any;
  filter: any;
  filterVerified: any;
  filterNotVerified: any;
  userId: string;
  private fullNameUserSource = new BehaviorSubject<string>(null);
  currentFullNameUser = this.fullNameUserSource.asObservable();
  avatarUser: string;

  constructor() {
  }

  setFullUserName(fullUserName) {
    console.log(fullUserName);
    console.log(this.fullNameUserSource.getValue());

    this.fullNameUserSource.next(fullUserName);
    // console.log(this.fullNameUser.getValue());

  }

  // getFullUserName(): Observable<string> {
  //   console.log(this.fullNameUser.getValue());

  //   return this.fullNameUser.asObservable();
  // }
}
