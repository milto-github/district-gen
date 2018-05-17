import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-user-management-modal-component',
  templateUrl: './admin.user.management.modal.component.html'
})

export class AdminUserManagementModalComponent {
  name: string;
  message: string;

  constructor(public activeModal: NgbActiveModal) {}
}
