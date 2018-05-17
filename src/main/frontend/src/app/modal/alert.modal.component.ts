import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert.modal.component.html'
})

export class AlertModalComponent {
  name: string;
  message: string;

  constructor(public activeModal: NgbActiveModal) {}
}
