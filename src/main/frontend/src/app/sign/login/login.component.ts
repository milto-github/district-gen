import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../models/user';
import { AlertModalComponent } from '../../modal/alert.modal.component';

@Component({
  selector: 'app-sign-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  user: User;
  @Output()
  register = new EventEmitter<boolean>();

  constructor(
      private authenticationService: AuthenticationService,
      private activeModal: NgbActiveModal,
      private modalService: NgbModal
  ) {}

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  moveToRegister() {
    this.register.emit(null);
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .toPromise().then(
        data => {
          this.user = <User>data;
          console.log(this.user);
          localStorage.setItem('currentUser', JSON.stringify(this.user));
          this.authenticationService.sendUser(this.user);
          const modalRef = this.modalService.open(AlertModalComponent, {
          });
          modalRef.componentInstance.name = 'Sign In Success';
          modalRef.componentInstance.message = 'Succeed!';
        })
      .catch(error => {
        const modalRef = this.modalService.open(AlertModalComponent, {
        });
        modalRef.componentInstance.name = 'Login Fail';
        modalRef.componentInstance.message = 'Please type correct username and password';
      })
      .then(() => {
        this.loading = false;
      });
    this.activeModal.close();
  }
}
