import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class GetFreeApiService {

  // Define API
  apiURL = `${environment.apiUrl}/query/`;

  constructor(private http: HttpClient) { }

  /*========================================
    CRUD Methods for consuming RESTful API
  =========================================*/

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  // HttpClient API get() method => Fetch department list
  getFreeRoom(year: string, group: string, semester: string, day: string, shift: string, students: number): Observable<any> {

    return this.http.get(this.apiURL + 'free-rooms' + `?year=${year}&group=${group}&semester=${semester}&day=${day}&shift=${shift}&students=${students}` ) // this.apiURL+ '?page=23'
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getTeacherFreeShifts(year: string, group: string, semester: string, day: string, teacherId: string): Observable<any> {

    return this.http.get(this.apiURL + 'teacher-free-shifts' + `?year=${year}&group=${group}&semester=${semester}&day=${day}&teacherId=${teacherId}`) // this.apiURL+ '?page=23'
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getTeacherSchedule(year: string, group: string, semester: string, teacherId: string): Observable<any> {
    return this.http.get(this.apiURL + 'teacher-schedule' + `?year=${year}&group=${group}&semester=${semester}&teacherId=${teacherId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
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
