import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError, retry } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { UserData } from './../home/interface/dialog-data';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  // Define API
  apiURL = `${environment.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<UserData>;
  private token: string;
  public currentUser: Observable<UserData>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<UserData>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    if ( localStorage.getItem('currentUser') ) {
      this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    }
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

  changePassword(currentP, newP): Observable<any> {
    let obj = {
      currentPassword: currentP,
      newPassword: newP
    };
    console.log(this.apiURL + '/change-password');
    console.log(this.token)

    return this.http.post(this.apiURL + '/change-password', JSON.stringify(obj), {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      })
    }).pipe(
      retry(1),
      catchError(this.handleError)
    )
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Error handling
  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
