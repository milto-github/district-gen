import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { MeasurementProfile } from '../models/measurementProfile';

@Injectable()
export class UserService {
  private userUrl = 'http://localhost:8080/user';
  constructor(private http: HttpClient) { }

  public getAllUsers(): Observable<Array<User>> {
    const response = this.http.get<Array<User>>(this.userUrl + '/admin/getAllUsers');
    return response;
  }

  public createUser(user: User): Observable<User> {
    const response = this.http.post<User>(this.userUrl + '/register', user);
    return response;
  }

  public delete(user: User): Observable<string> {
    // const response = this.http.delete<string>(this.userUrl + '/admin/deleteUserAccount', user.username);
    const response = this.http.post<string>(this.userUrl + '/admin/deleteUserAccount', user.username);
    return response;
  }

  // public get(id: string): Observable<Hero> {
  //   const response = this.httpClient.get<Hero>(`${this.URL}/${id}`);
  // }

  // public list(): Observable<Array<Hero>> {
  //   const response = this.httpClient.get<Array<Hero>>(this.URL);
  // }

  public update(username: string, updatedPassword: string): Observable<string> {
    const response = this.http.post<string>(this.userUrl + '/editUser', [username, updatedPassword]);
    return response;
  }

  public deleteMeasurementProfile(id: number) {
    const response = this.http.get<string>(this.userUrl + '/deleteMeasurementProfile/' + id);
    return response;
  }
}
