import { Component, OnInit, OnChanges, Input, Output, SimpleChanges } from '@angular/core';
import { MapService } from '../services/map.service';
import { GeoJsonObject } from 'geojson';

import { environment } from '../../environments/environment';
import { RedistrictService } from '../services/redistrict.service';

import * as L from 'leaflet';
import '../../../node_modules/leaflet.browser.print/dist/leaflet.browser.print.js';
import '../../../node_modules/leaflet-search/dist/leaflet-search.src.js';
import 'leaflet-easybutton';
import { HttpClient } from '@angular/common/http';
import { Statistic } from '../models/statistic';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../models/user';

import * as geojson from 'geojson';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ControllerComponent } from './controller/controller.component';
import { SimpleTimer } from 'ng2-simple-timer';
import { MeasurementProfile } from '../models/measurementProfile';
import { AlertModalComponent } from '../modal/alert.modal.component';
import { VotingStatistic } from '../models/votingstatistic';
import { NgModel } from '@angular/forms';
import { EventEmitter } from 'events';
import { FreezeControllerComponent } from './freeze-controller/freeze-controller.component';

export interface VotingToCongress {
  votingID: string;
  congressID: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: []
})

export class MapComponent implements OnInit, OnChanges {
  @Input()
  user: User;
  chosenState = '';
  geoJsonForSearchBar = new L.GeoJSON(undefined, {style: function(feature) {
    return {
      opacity: 0, fillOpacity: 0
    };
  }});
  stateBoundaries = new Map([
    ['MD', new L.GeoJSON],
    ['WV', new L.GeoJSON],
    ['VA', new L.GeoJSON]
  ]);
  votingDistricts = new Map([
    ['MD', new L.GeoJSON],
    ['WV', new L.GeoJSON],
    ['VA', new L.GeoJSON]
  ]);
  isVotingDistrictLoaded = new Map([
    ['MD', false],
    ['WV', false],
    ['VA', false]
  ]);
  stateLatLngs = new Map([
    ['', L.latLng(38.5, -78.5)],
    ['MD', L.latLng(0, 0)],
    ['WV', L.latLng(0, 0)],
    ['VA', L.latLng(0, 0)]
  ]);
  colorMap = new Map([
    ['2401', '#fff000'],
    ['2402', '#0fff00'],
    ['2403', '#00fff0'],
    ['2404', '#000fff'],
    ['2405', '#f000ff'],
    ['2406', '#ff000f'],
    ['2407', '#0aaa00'],
    ['2408', '#00aaa0'],
    ['5101', '#FFFFFF'],
    ['5102', '#ff0aaa'],
    ['5103', '#af00aa'],
    ['5104', '#aafffa'],
    ['5105', '#aaa000'],
    ['5106', '#f55500'],
    ['5107', '#ff5550'],
    ['5108', '#5505ff'],
    ['5109', '#5f0055'],
    ['5110', '#f50ff5'],
    ['5111', '#f55000'],
    ['5401', '#ff0a00'],
    ['5402', '#0ff0a0'],
    ['5403', '#00ff0a'],
    [undefined, '#55ffaa']
  ]);
  stateScores = new Map([
    ['MD', [0, 0]],
    ['WV', [0, 0]],
    ['VA', [0, 0]]
  ]);
  scores = new Map();
  stateStatistics = new Map();
  cdStatistics = new Map();
  votingStatistics = new Map();
  votingToCongressMap = new Map();
  defaultVotingToCongressMap = new Map();
  stateToCongressMap = new Map();
  frozenVotingDistricts = new Map();
  frozenCongressionalDistricts = new Map();
  stat: VotingStatistic;
  hoverState: string;
  statSubscription: Subscription;
  clickedVotingDistrict: L.Layer;
  timerID: string;
  algorithmStatus: string;
  isPlayMode = false;
  isAlgorithmRunning = false;
  isAlgorithmFinished = false;
  isPause = false;

  initStateDisplayStats = function(mapObject) {
    this._div_info = L.DomUtil.create('div', 'state_info', this._container);
    this._div_info.innerHTML = this.mapService.statBarStyle;
    this._div_info.innerHTML += '<h5>Statistics</h5><p style="text-align: center; font-weight: bold;">Choose State District</p>';
    return this._div_info;
  };

  initDisplayStats = function(mapObject) {
    this._div_info = L.DomUtil.create('div', 'info', this._container);
    this._div_info.innerHTML = this.mapService.statBarStyle;
    this._div_info.innerHTML += '<h5>Statistics</h5><p style="text-align: center; font-weight: bold;">Choose Voting District</p>';
    return this._div_info;
  };

  initAlgoScoreStatus = function(mapObject) {
    this._div_algo = L.DomUtil.create('div', 'algoStatus', this._container);
    this._div_algo.innerHTML = this.mapService.statBarStyle;
    this._div_algo.innerHTML += '<table cellpadding="5"><col width="200"><col width="200">' +
    '<tr><td><h5>Algorithm Status</h5></td><td><h5>State Score</h5></td></tr>' +
    '<tr><td><p style="font-weight: bold;">' + this.algorithmStatus + '</p></td>' +
    '<td><p style="font-weight: bold;">' + this.stateScores.get(this.chosenState)[1] +
    ' ( ' + this.stateScores.get(this.chosenState)[0] + ' <i class="fas fa-arrow-right"></i> ' +
    this.stateScores.get(this.chosenState)[1] + ' )</p></td></tr></table>';
    this._div_algo.innerHTML += '<h5>Measurement Profile Status</h5><table cellpadding="2" style="text-align: left">' +
    '<col width="200"><col width="200">' +
    '<tr><td><span style="font-weight: bold;">Compactness: ' + this.user.activeMeasurementProfile.compactnessWeight + '%</span></td>' +
    '<td><span style="font-weight: bold;">Partisan Fairness: ' + this.user.activeMeasurementProfile.partisanFairnessWeight +
    '%</span></td></tr>' +
    '<tr><td><span style="font-weight: bold;">Racial Fairness: ' + this.user.activeMeasurementProfile.racialFairnessWeight +
    '%</span></td>' +
    '<td><span style="font-weight: bold;">Population: ' + this.user.activeMeasurementProfile.populationDistributionWeight +
    '%</span></td></tr></table>';
    return this._div_algo;
  };

  constructor(private mapService: MapService,
              private redistrictService: RedistrictService,
              private http: HttpClient,
              private modalService: NgbModal,
              private st: SimpleTimer
              ) {
                this.statSubscription = this.mapService.getVotingStat().subscribe(stat => {
                  this.stat = stat;
                });
              }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mapService.openControllerBtn !== undefined) {
      if (this.user === undefined) {
        // User Logout
        if (this.isPlayMode === true) {
          if (this.isAlgorithmRunning === true || this.isPause === true) {
            this.terminateAlgorithm();
          }
          this.quitPlayMode();
        }
        this.mapService.map.removeControl(this.mapService.openControllerBtn);
      } else if (this.isPlayMode === false) {
        this.mapService.map.addControl(this.mapService.openControllerBtn);
        if (this.chosenState === '') {
          this.mapService.openControllerBtn.disable();
        } else {
          this.mapService.openControllerBtn.enable();
        }
      }
    }
  }

  ngOnInit() {
    const map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: true,
      center: this.stateLatLngs.get(''),
      zoom: 7,
      minZoom: 4,
      maxZoom: 18,
      layers: [this.mapService.baseMaps.CartoDB],
    });
    this.st.newTimer('15sec', 5);
    this.mapService.map = map;
    this.loadDefaultStats();
    this.loadStateGeoLayers();
    this.loadMappingStateToCongress();
    this.mapService.map.whenReady(this.onMapReady.bind(this, this.mapService.map));
  }

  onMapReady(map: L.Map) {
    L.control.zoom({ position: 'topleft' }).addTo(this.mapService.map);
    L.control.scale().addTo(this.mapService.map);
    this.mapService.addLeafletSearchToMap(this.geoJsonForSearchBar, this.chosenState, this.stateLatLngs);
    this.mapService.addLeafletBrowserPrintToMap();
    this.mapService.loadStateViewBtn = L.easyButton('fas fa-reply', this.moveBackToStateView.bind(this),
      'Go back to state').addTo(map);
    this.mapService.openControllerBtn = L.easyButton('fas fa-sliders-h', this.openController.bind(this),
      'Open controller', 'red');
    this.mapService.runAlgorithmBtn = L.easyButton('fas fa-play', this.runAlgorithm.bind(this), 'Run algorithm', 'red');
    this.mapService.pauseAlgorithmBtn = L.easyButton('fas fa-pause', this.pauseAlgorithm.bind(this), 'Pause algorithm', 'red');
    this.mapService.terminateAlgorithmBtn = L.easyButton(' fas fa-stop', this.terminateAlgorithm.bind(this), 'Stop algorithm', 'chocolate');
    this.mapService.resetAlgorithmBtn = L.easyButton('fas fa-redo-alt', this.resetAlgorithm.bind(this), 'Reset Algorithm', 'blue');
    this.mapService.quitPlayModeBtn = L.easyButton('fas fa-times', this.quitPlayMode.bind(this), 'Quit playmode', 'chocolate');
    this.mapService.saveCurrConfigBtn = L.easyButton('fas fa-save', this.saveCurrConfig.bind(this),
    'Save current Configuration', 'steelblue');
    this.mapService.algorithmIsRunningBtn = L.easyButton('fas fa-spinner fa-spin', () => {} , 'Algorithm is running!', 'steelblue');
    this.mapService.FreezingDistrictBtn = L.easyButton('fas fa-snowflake', this.openFreezeController.bind(this),
    'Freeze district', 'skyblue');
    this.mapService.displayAlgoScore.onAdd = this.initAlgoScoreStatus.bind(this);
    this.mapService.displayInfoStat.onAdd = this.initDisplayStats.bind(this);
    this.mapService.displayStateInfoStat.onAdd = this.initStateDisplayStats.bind(this);
    map.addControl(this.mapService.displayStateInfoStat);
  }

  openController() {
    const modalRef = this.modalService.open(ControllerComponent, {
    });

    modalRef.componentInstance.user = this.user;
    modalRef.componentInstance.chosenState = this.chosenState;
    modalRef.result.then(() => {
      this.startPlayMode();
    }).catch(() => {});
  }

  displayAlgoScoreStatus() {
    const div = document.getElementsByClassName('algoStatus')[0];
    const congressID = this.stat.congress;

    div.innerHTML = this.mapService.statBarStyle;
    if (this.scores.get(congressID) === undefined) {
      this.scores.set(congressID, [0, 0]);
    }
    div.innerHTML += '<table cellpadding="5"><col width="200"><col width="200">' +
    '<tr><td><h5>Algorithm Status</h5></td><td><h5>Congress Score</h5></td></tr>' +
    '<tr><td><p style="font-weight: bold;">' + this.algorithmStatus + '</p></td>' +
    '<td><p style="font-weight: bold;">' + this.scores.get(congressID)[1] +
    ' ( ' + this.scores.get(congressID)[0] + ' <i class="fas fa-arrow-right"></i> ' +
    this.scores.get(congressID)[1] + ' )</p></td></tr></table>';
    div.innerHTML += '<h5>Measurement Profile Status</h5><table cellpadding="2" style="text-align: left">' +
    '<col width="200"><col width="200">' +
    '<tr><td><span style="font-weight: bold;">Compactness: ' + this.user.activeMeasurementProfile.compactnessWeight + '%</span></td>' +
    '<td><span style="font-weight: bold;">Partisan Fairness: ' + this.user.activeMeasurementProfile.partisanFairnessWeight +
    '%</span></td></tr>' +
    '<tr><td><span style="font-weight: bold;">Racial Fairness: ' + this.user.activeMeasurementProfile.racialFairnessWeight +
    '%</span></td>' +
    '<td><span style="font-weight: bold;">Population: ' + this.user.activeMeasurementProfile.populationDistributionWeight +
    '%</span></td></tr></table>';
  }

  resetDisplayAlgoScoresStatus() {
    const div = document.getElementsByClassName('algoStatus')[0];

    div.innerHTML = this.mapService.statBarStyle;
    div.innerHTML += '<table cellpadding="5"><col width="200"><col width="200">' +
    '<tr><td><h5>Algorithm Status</h5></td><td><h5>State Score</h5></td></tr>' +
    '<tr><td><p style="font-weight: bold;">' + this.algorithmStatus + '</p></td>' +
    '<td><p style="font-weight: bold;">' + this.stateScores.get(this.chosenState)[1] +
    ' ( ' + this.stateScores.get(this.chosenState)[0] + ' <i class="fas fa-arrow-right"></i> ' +
    this.stateScores.get(this.chosenState)[1] + ' )</p></td></tr></table>';
    div.innerHTML += '<h5>Measurement Profile Status</h5><table cellpadding="2" style="text-align: left">' +
    '<col width="200"><col width="200">' +
    '<tr><td><span style="font-weight: bold;">Compactness: ' + this.user.activeMeasurementProfile.compactnessWeight + '%</span></td>' +
    '<td><span style="font-weight: bold;">Partisan Fairness: ' + this.user.activeMeasurementProfile.partisanFairnessWeight +
    '%</span></td></tr>' +
    '<tr><td><span style="font-weight: bold;">Racial Fairness: ' + this.user.activeMeasurementProfile.racialFairnessWeight +
    '%</span></td>' +
    '<td><span style="font-weight: bold;">Population: ' + this.user.activeMeasurementProfile.populationDistributionWeight +
    '%</span></td></tr></table>';
  }

  displayStateStats(hoverState: string) {
    const div = document.getElementsByClassName('state_info')[0];
    const stateStat: Statistic = this.stateStatistics.get(hoverState);
    let stateName;

    switch (hoverState) {
      case 'MD': {
        stateName = 'Maryland';
        break;
      }
      case 'WV': {
        stateName = 'West Virginia';
        break;
      }
      case 'VA': {
        stateName = 'Virginia';
        break;
      }
    }
    div.innerHTML = this.mapService.statBarStyle;
    div.innerHTML += '<h5>Statistics</h5>' +
    '<p style="font-weight: bold; text-align: center;">' + stateName + '</p>';
    if (this.user !== undefined) {
      div.innerHTML += '<table cellpadding="5""><col width="200"><col width="100">' +
      '<tr><td style="font-weight: bold; text-align: left">Score</td>' +
      '<td style="font-weight: bold;">' + this.stateScores.get(hoverState)[1] + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Total Population</td>' +
      '<td>' + stateStat.totalPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Democratic</td>' +
      '<td>' + stateStat.democraticPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Republican</td>' +
      '<td>' + stateStat.republicanPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Third Party</td>' +
      '<td>' + stateStat.thirdPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">White</td>' +
      '<td>' + stateStat.whitePopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Black</td>' +
      '<td>' + stateStat.blackPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Asian</td>' +
      '<td>' + stateStat.asianPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Native American/Alaskan</td>' +
      '<td>' + stateStat.nativeAmericanAlaskanPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Pacific Islander/Hawaiin</td>' +
      '<td>' + stateStat.pacificIslanderHawaiinPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Two or More Races</td>' +
      '<td>' + stateStat.twoOrMoreRacePopulation + '</td></tr></table>';
    } else {
      div.innerHTML += '<table cellpadding="5""><col width="200"><col width="100">' +
      '<tr><td style="font-weight: bold; text-align: left">Total Population</td>' +
      '<td>' + stateStat.totalPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Democratic</td>' +
      '<td>' + stateStat.democraticPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Republican</td>' +
      '<td>' + stateStat.republicanPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Third Party</td>' +
      '<td>' + stateStat.thirdPartyPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">White</td>' +
      '<td>' + stateStat.whitePopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Black</td>' +
      '<td>' + stateStat.blackPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Asian</td>' +
      '<td>' + stateStat.asianPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Native American/Alaskan</td>' +
      '<td>' + stateStat.nativeAmericanAlaskanPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Pacific Islander/Hawaiin</td>' +
      '<td>' + stateStat.pacificIslanderHawaiinPopulation + '</td></tr>' +
      '<tr><td style="font-weight: bold; text-align: left">Two or More Races</td>' +
      '<td>' + stateStat.twoOrMoreRacePopulation + '</td></tr></table>';
    }
  }

  resetDisplayStateStats() {
    const div = document.getElementsByClassName('state_info')[0];

    div.innerHTML = this.mapService.statBarStyle;
    div.innerHTML += '<h5>Statistics</h5><p style="text-align: center; font-weight: bold;">Choose State</p>';
  }

  displayStats() {
    const div = document.getElementsByClassName('info')[0];
    const cdStat: Statistic = this.cdStatistics.get(this.stat.congress);

    div.innerHTML = this.mapService.statBarStyle;
    div.innerHTML += '<h5>Statistics</h5>';
    div.innerHTML += '<table cellpadding="5""><col width="200"><col width="100"><col width="100"><tr><td></td>' +
    '<td style="font-weight: bold">Congress</td><td style="font-weight: bold">Voting</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Name</td>' +
    '<td>' + this.stat.congress + '</td><td>' + this.stat.votingDistrictName + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Total Population</td>' +
    '<td>' + cdStat.totalPopulation + '</td><td>' + this.stat.totalPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Democratic</td>' +
    '<td>' + cdStat.democraticPartyPopulation + '</td><td>' + this.stat.democraticPartyPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Republican</td>' +
    '<td>' + cdStat.republicanPartyPopulation + '</td><td>' + this.stat.republicanPartyPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Third Party</td>' +
    '<td>' + cdStat.thirdPartyPopulation + '</td><td>' + this.stat.thirdPartyPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">White</td>' +
    '<td>' + cdStat.whitePopulation + '</td><td>' + this.stat.whitePopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Black</td>' +
    '<td>' + cdStat.blackPopulation + '</td><td>' + this.stat.blackPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Asian</td>' +
    '<td>' + cdStat.asianPopulation + '</td><td>' + this.stat.asianPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Native American/Alaskan</td>' +
    '<td>' + cdStat.nativeAmericanAlaskanPopulation + '</td><td>' + this.stat.nativeAmericanAlaskanPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Pacific Islander/Hawaiin</td>' +
    '<td>' + cdStat.pacificIslanderHawaiinPopulation + '</td><td>' + this.stat.pacificIslanderHawaiinPopulation + '</td></tr>' +
    '<tr><td style="font-weight: bold; text-align: left">Two or More Races</td>' +
    '<td>' + cdStat.twoOrMoreRacePopulation + '</td><td>' + this.stat.twoOrMoreRacePopulation + '</td></tr></table>';
  }

  resetDisplayStats() {
    const div = document.getElementsByClassName('info')[0];

    div.innerHTML = this.mapService.statBarStyle;
    div.innerHTML += '<h5>Statistics</h5><p style="text-align: center; font-weight: bold;">Choose Voting District</p>';
  }

  moveToChosenState(chosenState) {
    this.chosenState = chosenState;
    this.mapService.manageMoveToChosenStateControls();
    this.mapService.map.removeLayer(this.stateBoundaries.get('MD'));
    this.mapService.map.removeLayer(this.stateBoundaries.get('WV'));
    this.mapService.map.removeLayer(this.stateBoundaries.get('VA'));
    if (this.isVotingDistrictLoaded.get(chosenState)) {
      this.mapService.map.addLayer(this.votingDistricts.get(chosenState));
    } else {
      const requestUrl = 'http://localhost:8080/area/defaultStateFeatureCollection/' + this.chosenState;
      this.generateVotingDistricts(requestUrl);
      this.isVotingDistrictLoaded.set(chosenState, true);
    }
    this.mapService.map.setView(this.stateLatLngs.get(chosenState), 8);
  }

  moveBackToStateView() {
    this.mapService.manageMoveToStateViewControls(this.chosenState);
    this.mapService.map.setView(this.stateLatLngs.get(''), 7);
    if (this.chosenState !== '') {
      this.mapService.map.removeLayer(this.votingDistricts.get(this.chosenState));
      this.mapService.map.addLayer(this.stateBoundaries.get('MD'));
      this.mapService.map.addLayer(this.stateBoundaries.get('WV'));
      this.mapService.map.addLayer(this.stateBoundaries.get('VA'));
      const prevVotingDistrict = <L.GeoJSON<any>>this.votingDistricts.get(this.chosenState);
      this.chosenState = '';
      if (this.clickedVotingDistrict) {
        prevVotingDistrict.resetStyle(this.clickedVotingDistrict);
        this.clickedVotingDistrict = null;
      }
    }
  }

  resetScores() {
    const chosenState = this.chosenState;

    this.stateScores.set(chosenState, [0, 0]);
    this.scores.forEach(function (scores: number[], congressID: string, map: Map<string, number[]>) {
      let state;
      switch (congressID.substring(0, 2)) {
        case '24': {
          state = 'MD';
          break;
        }
        case '51': {
          state = 'VA';
          break;
        }
        case '54': {
          state = 'WV';
          break;
        }
      }
      if (state === chosenState) {
        map.set(congressID, [0, 0]);
      }
    });
  }

  precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  loadScores() {
    this.redistrictService.getCDScores().subscribe(res => {
      const keys = Object.keys(res);

      this.stateScores.set('MD', [this.stateScores.get('MD')[1], 0]);
      this.stateScores.set('WV', [this.stateScores.get('WV')[1], 0]);
      this.stateScores.set('VA', [this.stateScores.get('VA')[1], 0]);
      keys.forEach(congressID => {
        if (this.scores.get(congressID) === undefined) {
          this.scores.set(congressID, [0, this.precisionRound(res[congressID], 3)]);
        } else {
          this.scores.set(congressID, [this.scores.get(congressID)[1], this.precisionRound(res[congressID], 3)]);
        }
        switch (congressID.substring(0, 2)) {
          case '24': {
            this.stateScores.set('MD', [this.stateScores.get('MD')[0], this.stateScores.get('MD')[1] + res[congressID]]);
            break;
          }
          case '51': {
            this.stateScores.set('VA', [this.stateScores.get('VA')[0], this.stateScores.get('VA')[1] + res[congressID]]);
            break;
          }
          case '54': {
            this.stateScores.set('WV', [this.stateScores.get('WV')[0], this.stateScores.get('WV')[1] + res[congressID]]);
            break;
          }
        }
      });
      this.stateScores.set('MD', [this.stateScores.get('MD')[0], this.precisionRound(this.stateScores.get('MD')[1] / 8, 3)]);
      this.stateScores.set('WV', [this.stateScores.get('WV')[0], this.precisionRound(this.stateScores.get('WV')[1] / 3, 3)]);
      this.stateScores.set('VA', [this.stateScores.get('VA')[0], this.precisionRound(this.stateScores.get('VA')[1] / 11, 3)]);
    });
  }

  loadCongressionalDistirctStatistics() {
    this.redistrictService.getCDStats().subscribe(res => {
      const congressIDs = Object.keys(res);
      congressIDs.forEach(congressID => {
        this.cdStatistics.set(congressID, res[congressID]);
      });
    });
  }

  changeVotingDistrictsColor(reset: boolean) {
    const loadedvotingDistricts = reset ? this.redistrictService.loadResetVotingDistricts(this.chosenState) :
      this.redistrictService.loadRedistrictedVotingDistricts();
    loadedvotingDistricts.subscribe(res => {
      const votingIDs = Object.keys(res);
      const colorMap = this.colorMap;
      const votingToCongressMap = this.votingToCongressMap;

      votingIDs.forEach(votingID => {
        votingToCongressMap.set(votingID, res[votingID]);
      });

      this.votingDistricts.get(this.chosenState).eachLayer(function(layer: L.GeoJSON) {
        const layerFeature = <geojson.Feature<geojson.GeometryObject, any>> layer.feature;
        layer.setStyle({color: colorMap.get(votingToCongressMap.get(layerFeature.properties.GEOID))});
      });
    });
  }

  toggleFreezeVotingDistrict(target_layer: L.GeoJSON) {
    const layerFeature = <geojson.Feature<geojson.GeometryObject, any>> target_layer.feature;

    if (this.votingToCongressMap.get(layerFeature.properties.GEOID) === undefined) {
      if (this.frozenCongressionalDistricts.get(this.defaultVotingToCongressMap.get(layerFeature.properties.GEOID)) === true) {
        return;
      }
    } else {
      if (this.frozenCongressionalDistricts.get(this.votingToCongressMap.get(layerFeature.properties.GEOID)) === true) {
        return;
      }
    }

    this.redistrictService.toggleFreezeVotingDistrict(layerFeature.properties.GEOID).subscribe(() => {});
    if (this.frozenVotingDistricts.get(target_layer)) {
      this.votingDistricts.get(this.chosenState).resetStyle(target_layer);
      this.frozenVotingDistricts.delete(target_layer);
    } else {
      this.frozenVotingDistricts.set(target_layer, layerFeature.properties.GEOID);
        target_layer.setStyle({
              weight: 5,
              dashArray: '',
              fillOpacity: 0.7
        });
    }
  }

  toggleFreezeCD(congressID: string, frozen: boolean) {
    if (frozen === true) {
      this.frozenCongressionalDistricts.set(congressID, false);
      this.redistrictService.requestUnfreezeCD(congressID).subscribe(() => {});
    } else {
      this.frozenCongressionalDistricts.set(congressID, true);
      this.redistrictService.requestFreezeCD(congressID).subscribe(() => {});
    }
  }

  controlPlayMode() {
    if (this.isPlayMode === true) {
      this.mapService.loadStateViewBtn.disable();
      if (this.clickedVotingDistrict) {
        this.votingDistricts.get(this.chosenState).resetStyle(this.clickedVotingDistrict);
        this.mapService.clearVotingStat();
        this.clickedVotingDistrict = null;
        this.resetDisplayStats();
      }
    } else {
      this.mapService.saveCurrConfigBtn.enable();
      this.mapService.loadStateViewBtn.enable();
      const frozenVotingLayers = this.frozenVotingDistricts.keys();
      const chosenStateLayer = this.votingDistricts.get(this.chosenState);

      let itrLayer = frozenVotingLayers.next();
      while (itrLayer.done !== true) {
          chosenStateLayer.resetStyle(itrLayer.value);
          itrLayer = frozenVotingLayers.next();
      }
      this.frozenVotingDistricts.clear();
      this.frozenCongressionalDistricts.forEach(function(value, key, map) {
        if (value === true) {
          this.frozenCongressionalDistricts.set(key, false);
          this.redistrictService.requestUnfreezeCD(key).subscribe(() => {});
        }
      }.bind(this));
    }
  }

  generateVotingDistricts(requestUrl) {
    let colorMap;
    let statMap;
    let votingDistrict: L.GeoJSON;
    let mapService: MapService;
    let mapComponent: MapComponent;
    let defaultVotingToCongress;

    this.http.get<any>(requestUrl)
      .subscribe(result => (
        colorMap = this.colorMap,
        statMap = this.votingStatistics,
        mapService = this.mapService,
        defaultVotingToCongress = this.defaultVotingToCongressMap,
        this.geoJsonForSearchBar.addData(result),
        mapComponent = this,
        votingDistrict = L.geoJSON(result, {
          onEachFeature: function(feature, layer) {
            layer.on('mouseover', function(event) {
              const target_layer = event.target;
              if (mapComponent.isPlayMode === true) {
                target_layer.setStyle({
                  weight: 5,
                  dashArray: '',
                  fillOpacity: 0.7
                });
              } else {
                target_layer.setStyle({
                  weight: 1,
                  color: '#ff55',
                  dashArray: '',
                  fillOpacity: 1.0
                });
              }
              if (!L.Browser.ie && !L.Browser.opera12 && !L.Browser.edge) {
                  target_layer.bringToFront();
              }
              if (!mapComponent.clickedVotingDistrict) {
                mapService.sendVotingStat(statMap.get(feature.properties.GEOID));
                mapComponent.displayStats();
                if (mapComponent.isPlayMode) {
                  mapComponent.displayAlgoScoreStatus();
                }
              }
            });
            layer.on('mouseout', function(event) {
              if (!mapComponent.clickedVotingDistrict) {
                mapComponent.resetDisplayStats();
                if (mapComponent.isPlayMode) {
                  mapComponent.resetDisplayAlgoScoresStatus();
                }
                mapService.clearVotingStat();
              }
              if (event.target === mapComponent.clickedVotingDistrict ||
                  mapComponent.frozenVotingDistricts.get(event.target)) {
                  return;
              }
              votingDistrict.resetStyle(event.target);
            });
            layer.on('click', function(event) {
              if (mapComponent.isPlayMode === true) {
                mapComponent.toggleFreezeVotingDistrict(event.target);
              } else {
                if (mapComponent.clickedVotingDistrict) {
                  votingDistrict.resetStyle(mapComponent.clickedVotingDistrict);
                  mapService.clearVotingStat();
                  if (mapComponent.clickedVotingDistrict === event.target) {
                    mapComponent.clickedVotingDistrict = null;
                    mapComponent.resetDisplayStats();
                    return;
                  }
                }
                mapComponent.clickedVotingDistrict = event.target;
                mapService.sendVotingStat(statMap.get(feature.properties.GEOID));
                mapComponent.displayStats();
              }
            });
            const votingStatistic = new VotingStatistic();
            votingStatistic.GEOID = feature.properties.GEOID;
            votingStatistic.centerLat = feature.properties.INTPTLAT10;
            votingStatistic.centerLng = feature.properties.INTPTLON10;
            votingStatistic.congress = feature.properties.congress;
            votingStatistic.votingDistrictName = feature.properties.NAMELSAD10;
            votingStatistic.totalPopulation = feature.properties.pop;
            votingStatistic.whitePopulation = feature.properties.wa;
            votingStatistic.blackPopulation = feature.properties.ba;
            votingStatistic.pacificIslanderHawaiinPopulation = feature.properties.ia;
            votingStatistic.asianPopulation = feature.properties.aa;
            votingStatistic.nativeAmericanAlaskanPopulation = feature.properties.na;
            votingStatistic.twoOrMoreRacePopulation = feature.properties.tom;
            votingStatistic.democraticPartyPopulation = feature.properties.dem;
            votingStatistic.republicanPartyPopulation = feature.properties.gop;
            votingStatistic.thirdPartyPopulation = feature.properties.thd;
            statMap.set(feature.properties.GEOID, votingStatistic);
            defaultVotingToCongress.set(feature.properties.GEOID, votingStatistic.congress);
          },
          style: function(feature) {
            return {
              color: mapComponent.votingToCongressMap
                .get(feature.properties.GEOID) === undefined ?
                colorMap.get(feature.properties.congress) :
                colorMap.get(mapComponent.votingToCongressMap.get(feature.properties.GEOID)),
              weight: 1,
              opacity: 0.65
            };
          }
        }),
        this.mapService.map.addLayer(votingDistrict),
        this.mapService.map.removeLayer(this.votingDistricts.get(this.chosenState)),
        this.votingDistricts.set(this.chosenState, votingDistrict)
      ));
  }

  loadDefaultStats() {
    this.redistrictService.getDefaultStats().subscribe(res => {
      const keys = Object.keys(res);
      keys.forEach(key => {
        if (key === 'MD' || key === 'WV' || key === 'VA') {
          this.stateStatistics.set(key, res[key]);
        } else {
          this.cdStatistics.set(key, res[key]);
        }
      });
    });
  }

  loadMappingStateToCongress() {
    this.redistrictService.requestMappingStateToCongress().subscribe(res => {
      const states = Object.keys(res);

      states.forEach(state => {
        const congressIDs: string[] = res[state];

        this.stateToCongressMap.set(state, congressIDs);
        congressIDs.forEach(congressID => {
          this.frozenCongressionalDistricts.set(congressID, false);
        });
      });
    });
  }

  loadStateGeoLayers() {
    const geoJSONObjects = this.mapService.getGeoJson();
    let mapComponent: MapComponent;

    geoJSONObjects.get(environment.geoJSON_url_s_maryland)
    .subscribe(result => (
      this.geoJsonForSearchBar.addData(result),
      mapComponent = this,
      this.stateBoundaries.set('MD', L.geoJSON(result, {
        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function(event) {
            event.target.setStyle({
              weight: 3,
              color: '#ff7800',
              dashArray: '',
              fillOpacity: 0.65
            });
            if (!L.Browser.ie && !L.Browser.opera12 && !L.Browser.edge) {
              event.target.bringToFront();
            }
            mapComponent.displayStateStats('MD');
          });
          layer.on('mouseout', function(event) {
            mapComponent.resetDisplayStateStats();
            mapComponent.stateBoundaries.get('MD').resetStyle(event.target);
          });
          layer.on('click', function(event) {
            mapComponent.stateBoundaries.get('MD').resetStyle(event.target);
          });
        },
        style: function(feature) {
          return {
            color: '#ff7800',
            weight: 1,
            opacity: 0.65
          };
        }
      })),
      this.stateLatLngs.set('MD', L.latLng(result.properties.INTPTLAT, result.properties.INTPTLON)),
      this.stateBoundaries.get('MD').on('click', this.moveToChosenState.bind(this, 'MD')),
      this.mapService.map.addLayer(this.stateBoundaries.get('MD'))
    ));

    geoJSONObjects.get(environment.geoJSON_url_s_westvirginia)
    .subscribe(result => (
      this.geoJsonForSearchBar.addData(result),
      mapComponent = this,
      this.stateBoundaries.set('WV', L.geoJSON(result, {
        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function(event) {
            event.target.setStyle({
              weight: 3,
              color: '#424bf4',
              dashArray: '',
              fillOpacity: 0.65
            });
            if (!L.Browser.ie && !L.Browser.opera12 && !L.Browser.edge) {
              event.target.bringToFront();
            }
            mapComponent.displayStateStats('WV');
          });
          layer.on('mouseout', function(event) {
            mapComponent.resetDisplayStateStats();
            mapComponent.stateBoundaries.get('WV').resetStyle(event.target);
          });
          layer.on('click', function(event) {
            mapComponent.stateBoundaries.get('WV').resetStyle(event.target);
          });
        },
        style: function(feature) {
          return {
            color: '#424bf4',
            weight: 1,
            opacity: 0.65
          };
        }
      })),
      this.stateLatLngs.set('WV', L.latLng(result.properties.INTPTLAT, result.properties.INTPTLON)),
      this.stateBoundaries.get('WV').on('click', this.moveToChosenState.bind(this, 'WV')),
      this.mapService.map.addLayer(this.stateBoundaries.get('WV'))
    ));

    geoJSONObjects.get(environment.geoJSON_url_s_virginia)
    .subscribe(result => (
      this.geoJsonForSearchBar.addData(result),
      mapComponent = this,
      this.stateBoundaries.set('VA', L.geoJSON(result, {
        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function(event) {
            event.target.setStyle({
              weight: 3,
              color: '#41f480',
              dashArray: '',
              fillOpacity: 0.65
            });
            if (!L.Browser.ie && !L.Browser.opera12 && !L.Browser.edge) {
              event.target.bringToFront();
            }
            mapComponent.displayStateStats('VA');
          });
          layer.on('mouseout', function(event) {
            mapComponent.resetDisplayStateStats();
            mapComponent.stateBoundaries.get('VA').resetStyle(event.target);
          });
          layer.on('click', function(event) {
            mapComponent.stateBoundaries.get('VA').resetStyle(event.target);
          });
        },
        style: function(feature) {
          return {
            color: '#41f480',
            weight: 1,
            opacity: 0.65
          };
        }
      })),
      this.stateLatLngs.set('VA', L.latLng(result.properties.INTPTLAT, result.properties.INTPTLON)),
      this.stateBoundaries.get('VA').on('click', this.moveToChosenState.bind(this, 'VA')),
      this.mapService.map.addLayer(this.stateBoundaries.get('VA'))
    ));
  }

  terminateAlgorithm() {
    this.frozenCongressionalDistricts.forEach(function(value, key, map) {
      map.set(key, false);
    });
    this.isPause = false;
    this.isAlgorithmFinished = true;
    this.isAlgorithmRunning = false;
    this.algorithmStatus = 'FINISH';
    this.st.unsubscribe(this.timerID);
    this.timerID = '';
    this.loadScores();
    this.redistrictService.terminateAlgorithm().subscribe(res => {
      const votingIDs = Object.keys(res);
      const colorMap = this.colorMap;
      const votingToCongressMap = this.votingToCongressMap;

      votingIDs.forEach(votingID => {
        votingToCongressMap.set(votingID, res[votingID]);
      });

      this.votingDistricts.get(this.chosenState).eachLayer(function(layer: L.GeoJSON) {
        const layerFeature = <geojson.Feature<geojson.GeometryObject, any>> layer.feature;
        layer.setStyle({color: colorMap.get(votingToCongressMap.get(layerFeature.properties.GEOID))});
      });
    });
    this.mapService.manageTerminateAlgorithmControls(this.isPause);
    if (this.user !== undefined) {
      this.resetDisplayAlgoScoresStatus();
    }
    // this.openAlertModal('Algorithm Progress', 'Terminate Algorithm!');
  }

  createAlgorithm() {
    this.redistrictService.createAlgorithm(this.chosenState, this.user.activeMeasurementProfile).subscribe(() => {
      this.loadScores();
    });
  }

  runAlgorithm() {
    const displayAlgoStatus = this.displayAlgoScoreStatus.bind(this);
    const resetDisplayAlgoScoresStatus = this.resetDisplayAlgoScoresStatus.bind(this);
    const displayStats = this.displayStats.bind(this);

    this.isPause = false;
    this.isAlgorithmRunning = true;
    this.redistrictService.togglePauseAlgorithm().subscribe(() => {});
    this.timerID = this.st.subscribe('15sec', () => {
      this.redistrictService.isFinished().subscribe(isFinished => {
        if (isFinished === true) {
          this.terminateAlgorithm();
        } else {
          this.loadScores();
          this.loadCongressionalDistirctStatistics();
          if (this.stat === undefined) {
            resetDisplayAlgoScoresStatus();
          } else {
            displayAlgoStatus();
            displayStats();
          }
          this.changeVotingDistrictsColor(false);
        }
      });
    });
    this.mapService.manageRunAlgorithmControls(this.algorithmStatus);
    this.algorithmStatus = 'RUNNING';
    this.resetDisplayAlgoScoresStatus();
    // this.openAlertModal('Algorithm Progress', 'Run Algorithm!');
  }

  pauseAlgorithm() {
    this.isPause = true;
    this.algorithmStatus = 'PAUSE';
    this.resetDisplayAlgoScoresStatus();
    this.st.unsubscribe(this.timerID);
    this.redistrictService.togglePauseAlgorithm().subscribe(() => {});
    this.mapService.managePauseAlgorithmControls();
    // this.openAlertModal('Algorithm Progress', 'Pause Algorithm!');
  }

  resetAlgorithm() {
    this.changeVotingDistrictsColor(true);
    if (this.isAlgorithmFinished === false) {
      this.terminateAlgorithm();
    }
    this.quitPlayMode();
    this.startPlayMode();
    // this.openAlertModal('Algorithm Progress', 'Reset Algorithm!');
  }

  startPlayMode() {
    this.isPlayMode = true;
    this.isAlgorithmFinished = false;
    this.algorithmStatus = 'READY';
    this.resetScores();
    this.mapService.manageStartPlayModeControls();
    this.controlPlayMode();
    this.createAlgorithm();
    // this.openAlertModal('Algorithm Progress', 'Start Algorithm Play Mode!');
  }

  quitPlayMode() {
    this.isPlayMode = false;
    this.algorithmStatus = undefined;
    if (this.isAlgorithmFinished === false) {
      this.redistrictService.terminateAlgorithm().subscribe(() => {});
    }
    this.mapService.manageQuitPlayModeControls();
    this.controlPlayMode();
    // this.openAlertModal('Algorithm Progress', 'Quit Algorithm Play Mode!');
  }

  openAlertModal(title: string, message: string) {
    const modalRef = this.modalService.open(AlertModalComponent, {
    });

    modalRef.componentInstance.name = title;
    modalRef.componentInstance.message = message;
  }

  saveCurrConfig() {
    this.redistrictService.saveCurrentConfiguration().subscribe(res => {
      this.user.activeMeasurementProfile.id = res;
    });
    if (this.user.measurementProfileHistory === null || this.user.measurementProfileHistory === undefined) {
      this.user.measurementProfileHistory = new Array<MeasurementProfile>();
    }
    this.user.measurementProfileHistory.push(Object.assign({}, this.user.activeMeasurementProfile));
    this.mapService.saveCurrConfigBtn.disable();
    // this.openAlertModal('Algorithm Progress', 'Save Current Algorithm Configuration!');
  }

  openFreezeController() {
    const modalRef = this.modalService.open(FreezeControllerComponent, {
    });

    modalRef.componentInstance.congressIDs = this.stateToCongressMap.get(this.chosenState);
    modalRef.result.then(congressID => {
      this.toggleFreezeCD(congressID, this.frozenCongressionalDistricts.get(congressID));
    }).catch(() => {});
  }
}
