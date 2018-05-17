import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MeasurementProfile } from '../models/measurementProfile';
import { User } from '../models/user';

@Injectable()
export class RedistrictService {
  private defaultRequestUrl = 'http://localhost:8080/area';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json; charset=utf-8',
    })
  };

  constructor(private http: HttpClient) { }

  saveCurrentConfiguration() {
    const requestUrl = this.defaultRequestUrl + '/saveCurrentConfig';
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  loadRedistrictedVotingDistricts() {
    const requestUrl = this.defaultRequestUrl + '/votingDistricts';
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  loadResetVotingDistricts(chosenState: string) {
    const requestUrl = this.defaultRequestUrl + '/defaultVotingDistricts/' + chosenState;
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  createAlgorithm(chosenState, measurementProfile) {
    const requestUrl = this.defaultRequestUrl + '/setMeasurementProfile/' + chosenState;
    const response = this.http.post<any>(requestUrl, measurementProfile, this.httpOptions);
    return response;
  }

  togglePauseAlgorithm() {
    const requestUrl = this.defaultRequestUrl + '/togglePause';
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  terminateAlgorithm() {
    const requestUrl = this.defaultRequestUrl + '/terminate';
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  isFinished() {
    const requestUrl = this.defaultRequestUrl + '/isFinished';
    const response = this.http.get<any>(requestUrl, this.httpOptions);
    return response;
  }

  toggleFreezeVotingDistrict(votingID: string) {
    const requestUrl = this.defaultRequestUrl + '/toggleFreeze/' + votingID;
    const response = this.http.get<any>(requestUrl);
    console.log('im hererererre');
    return response;
  }

  getCDStats() {
    const requestUrl = this.defaultRequestUrl + '/cdStats';
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  getDefaultStats() {
    const requestUrl = this.defaultRequestUrl + '/defaultStats';
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  getCDScores() {
    const requestUrl = this.defaultRequestUrl + '/scores';
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  requestFreezeCD(congressID) {
    const requestUrl = this.defaultRequestUrl + '/freezeDistrict/' + congressID;
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  requestUnfreezeCD(congressID) {
    const requestUrl = this.defaultRequestUrl + '/unfreezeDistrict/' + congressID;
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  requestMappingStateToCongress() {
    const requestUrl = this.defaultRequestUrl + '/congressIds';
    const response = this.http.get<any>(requestUrl);
    return response;
  }
}
