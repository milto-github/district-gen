import { Component, OnInit, Input, Output } from '@angular/core';
import { User } from '../../models/user';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../../modal/alert.modal.component';
import { UserService } from '../../services/user.service';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-account-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  model: any = {};
  @Input()
  user: User;
  @Input()
  modal: NgbActiveModal;


  constructor(private modalService: NgbModal,
              private userService: UserService) { }

  ngOnInit() {
  }

  updateUser() {
    if (this.model.inputPassword1 !== this.model.inputPassword2) {
      this.openAlertModal('Update Fail', 'The passwords for update does not match!');
      this.modal.dismiss();
      return;
    }
    this.userService.update(this.user.username, this.model.inputPassword1).subscribe(() => {});
    this.openAlertModal('Update Success', 'The user password is updated!');
    this.modal.dismiss();
  }

  openAlertModal(title: string, message: string) {
    const modalRef = this.modalService.open(AlertModalComponent, {
    });

    modalRef.componentInstance.name = title;
    modalRef.componentInstance.message = message;
  }
}
