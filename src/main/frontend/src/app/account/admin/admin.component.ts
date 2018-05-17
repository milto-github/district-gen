import { Component, Input, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, OnInit, ViewChild,
  Output, EventEmitter } from '@angular/core';
import { ChangeEvent } from 'angular2-virtual-scroll';
import { User } from '../../models/user';
import { MapService } from '../../services/map.service';
import { SimpleTimer } from 'ng2-simple-timer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignComponent } from '../../sign/sign.component';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { AlertModalComponent } from '../../modal/alert.modal.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-account-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnChanges, OnDestroy {
  @Input()
  userList: User[];
  @Output()
  requestDeleteUser = new EventEmitter();
  @Output()
  requestEditUser = new EventEmitter();
  @Output()
  requestAddUser = new EventEmitter();
  scrollItems: User[];
  indices: any;
  filteredList: User[];
  isEdit = false;
  model: any = {};
  userForEdit: User;
  @ViewChild(VirtualScrollComponent)
  private virtualScroll: VirtualScrollComponent;

  constructor(private mapService: MapService,
              private modalService: NgbModal,
              private userService: UserService,
              private st: SimpleTimer) { }

  ngOnDestroy() {
    this.isEdit = false;
    this.userForEdit = undefined;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.filteredList = (this.userList || []).slice();
  }

  deleteUser(event: User) {
    this.requestDeleteUser.emit(event);
  }

  editUser(event: User) {
    this.isEdit = true;
    this.userForEdit = event;
  }

  updateUser() {
    if (this.model.inputPassword1 !== this.model.inputPassword2) {
      this.openAlertModal('Update Fail', 'The passwords for update does not match!');
    } else {
      this.userService.update(this.userForEdit.username, this.model.inputPassword1).subscribe(() => {});
      this.openAlertModal('Update Success', 'The user password is updated!');
    }
    this.requestEditUser.emit(null);
  }

  register() {
    const user = new User();
    user.username = this.model.username;
    user.email = this.model.email;
    user.role = 'USER';
    console.log('register!!!!');
    console.log(user);
    this.userService.createUser(user)
      .toPromise()
      .then(res => {
        console.log('success!!!');
        const modalRef = this.modalService.open(AlertModalComponent, {
        });
        modalRef.componentInstance.name = 'Sign Up Success';
        modalRef.componentInstance.message = 'Succeed!';
        this.requestAddUser.emit(user);
      })
      .catch(res => {
        console.log('failedd1!!!');
        const modalRef = this.modalService.open(AlertModalComponent, {
        });
        modalRef.componentInstance.name = 'Sign Up Fail';
        modalRef.componentInstance.message = 'Failed to sign up.';
      });
  }

  openAlertModal(title: string, message: string) {
    const modalRef = this.modalService.open(AlertModalComponent, {
    });

    modalRef.componentInstance.name = title;
    modalRef.componentInstance.message = message;
  }
}
