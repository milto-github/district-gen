import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ControllerComponent } from './map/controller/controller.component';
import { AccountComponent } from './account/account.component';
import { SignComponent } from './sign/sign.component';
import { SettingComponent } from './account/setting/setting.component';
import { HistoryComponent } from './account/history/history.component';
import { LoginComponent } from './sign/login/login.component';
import { RegisterComponent } from './sign/register/register.component';
import { AdminComponent } from './account/admin/admin.component';
import { ListHistoryComponent } from './account/history/list-history/list-history.component';
import { AlertModalComponent } from './modal/alert.modal.component';
import { WebStatComponent } from './account/admin/web-stat/web-stat.component';
import { TeamInfoModalComponent } from './modal/team-info.modal.component';
import { AlgorithmInfoModalComponent } from './modal/algorithm-info.modal.component';
import { ListUserComponent } from './account/admin/list-user/list-user.component';
import { AdminUserManagementModalComponent } from './modal/admin.user.management.modal.component';

import { MapService } from './services/map.service';
import { RedistrictService } from './services/redistrict.service';
import { AuthenticationService } from './services/authentication.service';
import { UserService } from './services/user.service';

import { SimpleTimer } from 'ng2-simple-timer';
import { FreezeControllerComponent } from './map/freeze-controller/freeze-controller.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ToolbarComponent,
    ControllerComponent,
    AccountComponent,
    SignComponent,
    SettingComponent,
    HistoryComponent,
    LoginComponent,
    RegisterComponent,
    AdminComponent,
    ListHistoryComponent,
    AlertModalComponent,
    WebStatComponent,
    TeamInfoModalComponent,
    AlgorithmInfoModalComponent,
    ListUserComponent,
    AdminUserManagementModalComponent,
    FreezeControllerComponent
  ],
  entryComponents: [
    AccountComponent,
    SignComponent,
    SettingComponent,
    HistoryComponent,
    AlertModalComponent,
    ControllerComponent,
    TeamInfoModalComponent,
    AlgorithmInfoModalComponent,
    AdminUserManagementModalComponent,
    FreezeControllerComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    NgbModule.forRoot(),
    AppRoutingModule,
    VirtualScrollModule,
    ChartsModule
  ],
  providers: [
    MapService,
    RedistrictService,
    AuthenticationService,
    UserService,
    SimpleTimer
  ],
  bootstrap: [AppComponent
  ]
})

export class AppModule { }
