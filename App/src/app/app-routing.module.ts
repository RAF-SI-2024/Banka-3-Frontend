import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard, adminGuard } from './guards/auth-guard.guard';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { RegisterEmployeeComponent } from './components/register-employee/register-employee.component';
import { UsersComponent } from './components/users/users.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import {EmployeeDetailComponent} from './components/employee-detail/employee-detail.component';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {SuccessComponent} from './components/success/success.component';
import {MailComponent} from './components/mail/mail.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { AccountManagementComponent } from './components/account-management/account-management.component';

export const routes: Routes = [
  // login
  { path: '', component: WelcomeComponent },
  { path: 'login/:type', component: LoginComponent },

  // password
  { path: 'forgot-password', component: MailComponent },
  { path: 'set-password/:token', component: PasswordResetComponent },
  { path: 'reset-password/:token', component: PasswordResetComponent },
  { path: 'forgot-password', component: MailComponent },

  // users
  { path: 'users', component: UsersComponent, canActivate: [adminGuard, authGuard] },
  { path: 'register-user', component: RegisterUserComponent, canActivate: [adminGuard, authGuard] },
  { path: 'users/:id', component: EditUserComponent, canActivate: [adminGuard, authGuard] },
  { path: 'user/:id', component: UserDetailComponent, canActivate: [authGuard] },

  // employees
  { path: 'employees', component: EmployeesComponent, canActivate: [adminGuard, authGuard] },
  { path: 'register-employee', component: RegisterEmployeeComponent, canActivate: [adminGuard, authGuard] },
  { path: 'employees/:id', component: EditEmployeeComponent, canActivate: [adminGuard, authGuard] },
  { path: 'employee/:id', component: EmployeeDetailComponent, canActivate: [authGuard] },

  { path: 'accounts', component: AccountsComponent },
  { path: 'account-management', component: AccountManagementComponent },

];
