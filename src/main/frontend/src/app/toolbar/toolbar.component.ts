import { Component, ViewChild } from '@angular/core';
import { SignComponent } from '../sign/sign.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountComponent } from '../account/account.component';
import { Subscription } from 'rxjs/Subscription';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';
import { MeasurementProfile } from '../models/measurementProfile';
import { UserService } from '../services/user.service';
import { TeamInfoModalComponent } from '../modal/team-info.modal.component';
import { AlgorithmInfoModalComponent } from '../modal/algorithm-info.modal.component';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  user: User;
  userList: User[];
  measurementProfiles: MeasurementProfile[];
  loginSubscription: Subscription;
  isMeasurementProfileLoading: boolean;
  @ViewChild(MapComponent)
  mapComponent: MapComponent;

  constructor(private modalService: NgbModal,
              private authenticationService: AuthenticationService,
              private userService: UserService
              ) {
    this.loginSubscription = this.authenticationService.getUser().subscribe(user => {
      this.user = user;
      if (user !== undefined) {
        if (this.user.role === 'ADMIN') {
          this.userService.getAllUsers()
          .subscribe(data => {
            this.userList = data;
            // const index: number = data.indexOf(this.user);
            // if (index !== -1) {
            //   data.splice(index, 1);
            // }
            // this.userList = data;
            // console.log(this.userList);
          });
        }
      }
    });
  }

  logout() {
    if (this.user.role === 'ADMIN') {
      this.userList = [];
    }
    this.measurementProfiles = [];
    this.user = undefined;
    this.authenticationService.logout();
  }

  openTeamInfo() {
    const modalRef = this.modalService.open(TeamInfoModalComponent, {
      size: 'lg'
    });
  }

  openAlgorithm() {
    const modalRef = this.modalService.open(AlgorithmInfoModalComponent, {
      size: 'lg'
    });
  }

  openWindowSignIn() {
    const modalRef = this.modalService.open(SignComponent, {
      windowClass: 'dark-modal',
      centered: true
    });
    modalRef.componentInstance.name = 'Login';
  }

  openWindowSignUp() {
    const modalRef = this.modalService.open(SignComponent, {
      windowClass: 'dark-modal',
      centered: true
    });
    modalRef.componentInstance.name = 'Register';
  }

  openWindowAccountInfo() {
    const modalRef = this.modalService.open(AccountComponent, {
      size: 'lg',
      windowClass: 'dark-modal'
    });
    modalRef.componentInstance.user = this.user;
    if (this.user.role === 'ADMIN') {
      modalRef.componentInstance.userList = this.userList;
    }
    modalRef.result.then(res => {
      if (res !== null || res[0] === 'loadMeasurementProfile') {
        if (res[0] === 'loadMeasurementProfile') {
          this.user = <User>res[1];
          this.isMeasurementProfileLoading = true;
          if (this.mapComponent.isPlayMode === true) {
            if (this.mapComponent.isAlgorithmRunning === true || this.mapComponent.isPause === true) {
              this.mapComponent.terminateAlgorithm();
            }
            this.mapComponent.quitPlayMode();
          }
          this.mapComponent.startPlayMode();
        } else if (res[0] === 'deleteMeasurementProfile') {
          this.user = <User>res[1];
        } else if (res[0] === 'deleteUser') {
          const target_user = <User>res[1];
          const index: number = this.userList.indexOf(target_user);

          if (this.user.username === target_user.username) {
            return;
          } else if (index !== -1) {
            this.userList.splice(index, 1);
          }
        } else if (res[0] === 'addUser') {
          this.userList.push(<User>res[1]);
        }
      }
    }).catch(() => {});
  }
}

