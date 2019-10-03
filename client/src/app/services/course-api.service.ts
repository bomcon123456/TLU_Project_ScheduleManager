import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CourseApiService {

  // Define API
  apiURL = `${environment.apiUrl}/courses`;

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

  // HttpClient API get() method => Fetch course list
  getCourses(pageSize?: number, pageIndex?: number, filter?: any): Observable<any> {



    const options = filter ? { params: new HttpParams().set('filter', JSON.stringify(filter)) } : {};

    console.log(options);


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

  // HttpClient API get() method => Fetch course
  getCourse(id): Observable<any> {
    return this.http.get(this.apiURL + '/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API post() method => Create course
  createCourse(course): Observable<any> {
    return this.http.post(this.apiURL, JSON.stringify(course), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API put() method => Update course
  updateCourse(id, course): Observable<any> {
    return this.http.put(this.apiURL + '/' + id, JSON.stringify(course), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API delete() method => Delete course
  deleteCourse(id): Observable<any> {
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
