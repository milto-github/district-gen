import { Component, OnChanges, SimpleChanges, Input, EventEmitter, Output } from '@angular/core';
import { ChangeEvent } from 'angular2-virtual-scroll';
import { MeasurementProfile } from '../../models/measurementProfile';
import { User } from '../../models/user';

@Component({
  selector: 'app-account-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnChanges {
  @Input()
  user: User;
  @Output()
  measurementProfileLoader = new EventEmitter();
  @Output()
  requestCloseModal = new EventEmitter();
  scrollItems: MeasurementProfile[];
  indices: ChangeEvent;
  timer;
  protected buffer: MeasurementProfile[] = [];
  protected loading: boolean;
  readonly bufferSize: number = 5;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.reset();
  }

  reset() {
    this.fetchNextChunk(0, this.bufferSize, {}).then(chunk => this.buffer = chunk);
  }

  fetchMore(event: ChangeEvent) {
    this.indices = event;
    if (event.end === this.buffer.length) {
      this.loading = true;
      this.fetchNextChunk(this.buffer.length, this.bufferSize, event).then(chunk => {
        this.buffer = this.buffer.concat(chunk);
        this.loading = false;
      }, () => this.loading = false).catch(() => {});
    }
  }

  fetchNextChunk(skip: number, limit: number, event?: any): Promise<MeasurementProfile[]> {
    return new Promise((resolve, reject) => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // if (skip < this.items.length) {
        //   return resolve(this.items.slice(skip, skip + limit));
        // }
        if (skip < this.user.measurementProfileHistory.length) {
          return resolve(this.user.measurementProfileHistory.slice(skip, skip + limit));
        }
        reject();
      }, 1000 + Math.random() * 1000);
    });
  }

  loadMeasurementProfile(event: MeasurementProfile) {
    this.user.activeMeasurementProfile = event;
    this.measurementProfileLoader.emit(this.user);
  }

  deleteMeasurementProfile(event: MeasurementProfile) {
    const index: number = this.user.measurementProfileHistory.indexOf(event);
    if (index !== -1) {
      this.user.measurementProfileHistory.splice(index, 1);
    }
    this.requestCloseModal.emit(this.user);
  }
}
