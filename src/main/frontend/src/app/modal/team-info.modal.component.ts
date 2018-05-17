import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-team-info-modal',
  templateUrl: './team-info.modal.component.html'
})

export class TeamInfoModalComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
