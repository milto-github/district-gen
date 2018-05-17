import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../models/user';

@Component({
  selector: 'app-freeze-controller',
  templateUrl: './freeze-controller.component.html',
  styleUrls: ['./freeze-controller.component.css']
})
export class FreezeControllerComponent {
  @Input()
  congressIDs: string[];
  chosenDistrict: string;

  constructor(public activeModal: NgbActiveModal) { }

  apply(event: string) {
    this.activeModal.close(this.chosenDistrict);
  }
}
