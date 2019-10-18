import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RoomApiService {

  // Define API
  apiURL = `${environment.apiUrl}/rooms`;

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

  // HttpClient API get() method => Fetch room list
  getRooms(pageSize?: number, pageIndex?: number, filter?: any): Observable<any> {

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

  // HttpClient API get() method => Fetch room
  getRoom(id): Observable<any> {
    return this.http.get(this.apiURL + '/' + id)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API post() method => Create room
  createRoom(room): Observable<any> {
    return this.http.post(this.apiURL + '/', JSON.stringify(room), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API put() method => Update room
  updateRoom(id, room): Observable<any> {
    return this.http.put(this.apiURL + '/' + id, JSON.stringify(room), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // HttpClient API delete() method => Delete room
  deleteRoom(id): Observable<any> {
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