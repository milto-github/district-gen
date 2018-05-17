import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../../modal/alert.modal.component';

@Component({
  selector: 'app-sign-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Output()
  resultNotification = new EventEmitter();
  userModel: any = {};
  loading = false;

  constructor(private userService: UserService,
              private modalService: NgbModal) {}

  register() {
    this.loading = true;
    const user = new User();
    user.username = this.userModel.username;
    user.email = this.userModel.email;
    // user.password = this.userModel.password;
    user.role = 'USER';
    this.userService.createUser(user)
      .toPromise()
      .then(res => {
        // Succeed to create an User
        const modalRef = this.modalService.open(AlertModalComponent, {
        });
        modalRef.componentInstance.name = 'Sign Up Success';
        modalRef.componentInstance.message = 'Succeed!';
        this.resultNotification.emit(true);
      })
      .catch(res => {
        // Failed to create an User
        const modalRef = this.modalService.open(AlertModalComponent, {
        });
        modalRef.componentInstance.name = 'Sign Up Fail';
        modalRef.componentInstance.message = 'Failed to sign up.';
        this.resultNotification.emit(false);
      })
      .then(() => {
        this.loading = false;
      });
  }
}
