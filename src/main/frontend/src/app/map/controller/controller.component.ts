import { Component, OnDestroy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RedistrictService } from '../../services/redistrict.service';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models/user';
import { MeasurementProfile } from '../../models/measurementProfile';
import { SimpleTimer } from 'ng2-simple-timer';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.css']
})
export class ControllerComponent {
  @Input()
  user: User;

  constructor(public activeModal: NgbActiveModal) { }
}
