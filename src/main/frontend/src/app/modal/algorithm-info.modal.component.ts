import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-algorithm-info-modal',
  templateUrl: './algorithm-info.modal.component.html'
})

export class AlgorithmInfoModalComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
