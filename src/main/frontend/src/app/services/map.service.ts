import { LazyMapsAPILoaderConfigLiteral} from '@agm/core';
import { Injectable, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/map';

import { GeoJsonObject } from 'geojson';
import { Observable } from 'rxjs/Observable';

import * as L from 'leaflet';
import { Subject } from 'rxjs/Subject';
import { Statistic } from '../models/statistic';
import { VotingStatistic } from '../models/votingstatistic';

@Injectable()
export class MapService {
  private defaultRequestUrl = 'http://localhost:8080/area';
  private statSubject = new Subject<any>();
  private geoJSONObjects = new Map<string, Observable<any>>();
  public map: L.Map;
  public baseMaps: any;
  public openControllerBtn: L.Control.EasyButton;
  public loadStateViewBtn: L.Control.EasyButton;
  public runAlgorithmBtn: L.Control.EasyButton;
  public pauseAlgorithmBtn: L.Control.EasyButton;
  public terminateAlgorithmBtn: L.Control.EasyButton;
  public resetAlgorithmBtn: L.Control.EasyButton;
  public quitPlayModeBtn: L.Control.EasyButton;
  public saveCurrConfigBtn: L.Control.EasyButton;
  public algorithmIsRunningBtn: L.Control.EasyButton;
  public FreezingDistrictBtn: L.Control.EasyButton;
  public displayAlgoScore = new L.Control();
  public displayInfoStat = new L.Control();
  public displayStateInfoStat = new L.Control();
  public statBarStyle = '<style>' +
    '.algoStatus { padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; max-width: 100px;' +
    'background: white; background: rgba(255,255,255,0.8);' +
    'width: 400px; max-width: 400px; display: inline-block;' +
    'box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; }' +
    '.algoStatus h5 { margin: 0 0 5px; color: #777; text-align: center}' +
    '.info { padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; max-width: 100px;' +
    'background: white; background: rgba(255,255,255,0.8);' +
    'width: 400px; max-width: 400px; display: inline-block;' +
    'box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; }' +
    '.info h5 { margin: 0 0 5px; color: #777; text-align: center}' +
    '.state_info { padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; max-width: 100px;' +
    'background: white; background: rgba(255,255,255,0.8);' +
    'width: 300px; max-width: 300px; display: inline-block;' +
    'box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; }' +
    '.state_info h5 { margin: 0 0 5px; color: #777; text-align: center}' +
    'table{ text-align: center; }' +
    '</style>';

  constructor(private http: HttpClient) {
    const cartoAttr =
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
      '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

    this.baseMaps = {
      CartoDB: L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        {
          attribution: cartoAttr
        }
      )
    };
  }

  sendVotingStat(stat: VotingStatistic) {
    this.statSubject.next(stat);
  }

  clearVotingStat() {
    this.statSubject.next();
  }

  getVotingStat(): Observable<any> {
    const votingStat = this.statSubject.asObservable();
    return votingStat;
  }

  getWebStats() {
    const requestUrl = this.defaultRequestUrl + '/webStats';
    const response = this.http.get<any>(requestUrl);
    return response;
  }

  getGeoJson() {
    // State Boundaries
    this.geoJSONObjects.set(environment.geoJSON_url_s_maryland, this.http.get<any>(environment.geoJSON_url_s_maryland));
    this.geoJSONObjects.set(environment.geoJSON_url_s_westvirginia, this.http.get<any>(environment.geoJSON_url_s_westvirginia));
    this.geoJSONObjects.set(environment.geoJSON_url_s_virginia, this.http.get<any>(environment.geoJSON_url_s_virginia));

    return this.geoJSONObjects;
  }

  addLeafletBrowserPrintToMap() {
    L.control.browserPrint({
      title: 'Print map',
      printModesNames: {
        Portrait: 'Portrait',
        Landscape: 'Landscape',
        Auto: 'Auto',
        Custom: 'Custom'
      }
    }).addTo(this.map);
  }

  addLeafletSearchToMap(geoJsonForSearchBar, chosenState, statelatlngMap: Map<string, L.LatLng>) {
    const map = this.map;
    L.control.search({
      layer: geoJsonForSearchBar,
      propertyName: 'NAMELSAD10',
      marker: false,
      moveToLocation: function(latlng, title, leafletMap) {
        const zoom = leafletMap.getBoundsZoom(latlng.layer.getBounds());
        leafletMap.setView(latlng, zoom);
      }
    }).on('search:locationfound', function(event: L.LayerEvent) {
      const target_layer = <L.GeoJSON>event.layer;
      target_layer.setStyle({opacity: 1, fillOpacity: 0.1, color: 'yellow'});
    }).on('search:collapsed', function(event) {
      geoJsonForSearchBar.getLayers().forEach(function(layer) {
        geoJsonForSearchBar.resetStyle(layer);
      });
      // map.setView(statelatlngMap.get(chosenState), chosenState === '' ? 7 : 8);
    }).addTo(map);
  }

  manageTerminateAlgorithmControls(isPause: boolean) {
    this.map.removeControl(this.terminateAlgorithmBtn);
    this.map.removeControl(this.FreezingDistrictBtn);
    if (isPause) {
      this.map.removeControl(this.runAlgorithmBtn);
    } else {
      this.map.removeControl(this.pauseAlgorithmBtn);
      this.map.removeControl(this.algorithmIsRunningBtn);
    }
    this.map.addControl(this.quitPlayModeBtn);
    this.map.addControl(this.runAlgorithmBtn);
    this.map.addControl(this.saveCurrConfigBtn);
    this.map.addControl(this.FreezingDistrictBtn);
    this.runAlgorithmBtn.disable();
  }

  manageRunAlgorithmControls(algorithmStatus: string) {
    if (algorithmStatus === 'READY' || algorithmStatus === 'FINISH') {
      this.map.removeControl(this.quitPlayModeBtn);
      this.map.addControl(this.terminateAlgorithmBtn);
    }
    this.map.removeControl(this.runAlgorithmBtn);
    this.map.removeControl(this.saveCurrConfigBtn);
    this.map.removeControl(this.FreezingDistrictBtn);
    this.map.addControl(this.pauseAlgorithmBtn);
    this.map.addControl(this.algorithmIsRunningBtn);
    this.map.addControl(this.FreezingDistrictBtn);
  }

  managePauseAlgorithmControls() {
    this.map.removeControl(this.pauseAlgorithmBtn);
    this.map.removeControl(this.algorithmIsRunningBtn);
    this.map.removeControl(this.FreezingDistrictBtn);
    this.map.addControl(this.runAlgorithmBtn);
    this.map.addControl(this.saveCurrConfigBtn);
    this.map.addControl(this.FreezingDistrictBtn);
  }

  manageStartPlayModeControls() {
    this.loadStateViewBtn.disable();
    this.runAlgorithmBtn.enable();
    this.map.removeControl(this.openControllerBtn);
    this.map.addControl(this.resetAlgorithmBtn);
    this.map.addControl(this.quitPlayModeBtn);
    this.map.addControl(this.runAlgorithmBtn);
    this.map.addControl(this.saveCurrConfigBtn);
    this.map.addControl(this.FreezingDistrictBtn);
    this.map.removeControl(this.displayInfoStat);
    this.map.addControl(this.displayAlgoScore);
    this.map.addControl(this.displayInfoStat);
  }

  manageQuitPlayModeControls() {
    this.loadStateViewBtn.enable();
    this.map.removeControl(this.resetAlgorithmBtn);
    this.map.removeControl(this.quitPlayModeBtn);
    this.map.removeControl(this.runAlgorithmBtn);
    this.map.removeControl(this.saveCurrConfigBtn);
    this.map.removeControl(this.FreezingDistrictBtn);
    this.map.addControl(this.openControllerBtn);
    this.map.removeControl(this.displayAlgoScore);
  }

  manageMoveToChosenStateControls() {
    this.map.removeControl(this.displayStateInfoStat);
    this.map.addControl(this.displayInfoStat);
    this.openControllerBtn.enable();
  }

  manageMoveToStateViewControls(chosenState: string) {
    if (chosenState !== '') {
      this.openControllerBtn.disable();
    }
    this.map.removeControl(this.displayInfoStat);
    this.map.addControl(this.displayStateInfoStat);
  }
}
