import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { reject } from 'q';
import { Observable } from 'rxjs/Observable';
import { MeasurementProfile } from '../models/measurementProfile';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent {
  @Input()
  user: User;
  @Input()
  userList: User[]; // Only for 'ADMIN'
  activeModal;

  constructor(activeModal: NgbActiveModal) { this.activeModal = activeModal; }

  closeModal(event) {
    this.activeModal.close();
  }

  deleteMeasurementProfile(event: User) {
    const result = ['deleteMeasurementProfile', this.user];

    this.activeModal.close(result);
  }

  loadMeasurementProfile(event: User) {
    const result = ['loadMeasurementProfile', this.user];

    this.activeModal.close(result);
  }

  deleteUser(event: User) {
    const result = ['deleteUser', event];

    this.activeModal.close(result);
  }

  editUser(event: User) {
    // const result = ['editUser', this.user];
    this.activeModal.dismiss();
  }

  addUser(event: User) {
    const result = ['addUser', event];

    this.activeModal.close(result);
  }
}
