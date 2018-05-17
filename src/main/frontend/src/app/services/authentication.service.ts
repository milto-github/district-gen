import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { User } from '../models/user';

@Injectable()
export class AuthenticationService {
  private userSubject = new Subject<any>();
  loginRequestUrl: string;
  logoutRequestUrl: string;

  constructor(private http: HttpClient) {
    this.loginRequestUrl = 'http://localhost:8080/user/login';
    this.logoutRequestUrl = 'http://localhost:8080/user/logout';
  }

  login(username: string, password: string) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    headers = headers.append('Authorization', 'Basic ' + window.btoa(username + ':' + password));

    const response =  this.http.get(this.loginRequestUrl, { headers: headers });
    return response;
  }

  logout() {
    this.login('authorization', '');

    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.clearUser();

    this.http.get(this.logoutRequestUrl);
  }

  sendUser(userObject: User) {
    this.userSubject.next(userObject);
  }

  clearUser() {
    this.userSubject.next();
  }

  getUser(): Observable<any> {
    const user = this.userSubject.asObservable();
    return user;
  }
}
