import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode'

import { environment } from '../../../environments/environment';
import { UserData } from './../home/interface/dialog-data';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  // Define API
  apiURL = `${environment.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<UserData>;
  public currentUser: Observable<UserData>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<UserData>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  public get currentUserValue(): UserData {
    return this.currentUserSubject.value;
  }

  login(loginUser: any) {
    console.log(this.apiURL, loginUser, this.httpOptions);

    return this.http.post<{ token: string }>(this.apiURL, loginUser, this.httpOptions)
      .pipe(tap(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify({token: user.token}));
        this.currentUserSubject.next(user);
        // return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
