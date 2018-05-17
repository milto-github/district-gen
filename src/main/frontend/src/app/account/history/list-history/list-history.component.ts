import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MeasurementProfile } from '../../../models/measurementProfile';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-account-history-list-history',
  templateUrl: './list-history.component.html',
  styleUrls: ['./list-history.component.scss']
})
export class ListHistoryComponent {
  @Input()
  item: MeasurementProfile;
  @Output()
  requestLoadMP = new EventEmitter();
  @Output()
  requestDeleteMP = new EventEmitter();

  constructor(private userService: UserService) {}

  deleteMeasurementProfile() {
    this.userService.deleteMeasurementProfile(this.item.id);
    this.requestDeleteMP.emit(this.item);
  }

  loadMeasurementProfile() {
    this.requestLoadMP.emit(this.item);
  }
}
