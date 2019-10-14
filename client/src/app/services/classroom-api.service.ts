import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ClassroomApiService {

  // Define API
  apiURL = `${environment.apiUrl}/classrooms`;

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
  getClassrooms(pageSize?: number, pageIndex?: number, filter?: any): Observable<any> {

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

  // HttpClient API get() method => Fetch department
  getClassroom(id): Observable<any> {
    return this.http.get(this.apiURL + '/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API post() method => Create department
  createClassroom(classroom): Observable<any> {
    return this.http.post(this.apiURL, JSON.stringify(classroom), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API put() method => Update department
  updateClassroom(id, classroom): Observable<any> {
    return this.http.put(this.apiURL + '/' + id, JSON.stringify(classroom), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API delete() method => Delete department
  deleteClassroom(id): Observable<any> {
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
