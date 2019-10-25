import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ScheduleApiService {

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

  getTeacherSchedule(year: string, group: string, semester: string, teacherId: string): Observable<any> {
    return this.http.get(this.apiURL + 'teacher-schedule' + `?year=${year}&group=${group}&semester=${semester}&teacherId=${teacherId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getDepartmentSchedule(year: string, group: string, semester: string, department: string): Observable<any> {
    return this.http.get(this.apiURL + 'department-schedule' + `?year=${year}&group=${group}&semester=${semester}&department=${department}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  getSchedule(year: string, group: string, semester: string): Observable<any> {
    return this.http.get(this.apiURL + 'get-schedule' + `?year=${year}&group=${group}&semester=${semester}`)
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
