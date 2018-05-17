import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './sign/login/login.component';
import { RegisterComponent } from './sign/register/register.component';

// import { TabsComponent } from './tabs/tabs.component';
// import { ListComponent } from './list/list.component';

// const routes = [
//   { path: 'characters', component: TabsComponent, children: [
//     { path: '', redirectTo: 'all', pathMatch: 'full' },
//     { path: ':side', component: ListComponent }
//   ] },
//   { path: 'new-character', loadChildren: './create-character/create-character.module#CreateCharacterModule' },
//   { path: '**', redirectTo: '/characters' }
// ];

const routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
