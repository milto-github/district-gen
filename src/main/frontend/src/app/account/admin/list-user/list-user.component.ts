import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.scss']
})
export class ListUserComponent implements OnInit {
  @Input()
  item: User;
  @Output()
  requestDeleteUser = new EventEmitter();
  @Output()
  requestEditUser = new EventEmitter();

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  editUser() {
    this.requestEditUser.emit(this.item);
  }

  deleteUser() {
    this.userService.delete(this.item).subscribe(res => {
      console.log(res);
    });
    this.requestDeleteUser.emit(this.item);
  }

}
