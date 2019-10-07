import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TeacherApiService {

  // Define API
  apiURL = `${ environment.apiUrl }/teachers`;

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

  // HttpClient API get() method => Fetch teacher list
  getTeachers(pageSize?: number, pageIndex?: number, filter?: any): Observable<any> {

    const options = filter ? { params: new HttpParams().set('filter', JSON.stringify(filter)) } : {};
    if (!pageIndex) {
      pageIndex = 1;
    }
    if (!pageSize) {
      pageSize = 5;
    }
    return this.http.get(this.apiURL + `?size=${pageSize}&page=${pageIndex}`, options) // this.apiURL+ '?page=23'
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API get() method => Fetch teacher
  getTeacher(id): Observable<any> {
    return this.http.get(this.apiURL + '/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API post() method => Create teacher
  createTeacher(teacher): Observable<any> {
    console.log(teacher);

    return this.http.post(this.apiURL + '/' , JSON.stringify(teacher), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API put() method => Update teacher
  updateTeacher(id, teacher): Observable<any> {
    return this.http.put(this.apiURL + '/' + id, JSON.stringify(teacher), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API delete() method => Delete teacher
  deleteTeacher(id): Observable<any> {
    return this.http.delete(this.apiURL + '/' + id, this.httpOptions)
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
