import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent {
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}

  checkUserCreation(event: boolean) {
    if (event === true) {
      this.activeModal.close();
    } else {
      this.activeModal.dismiss();
    }
  }

}
