import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard, adminGuard, employeeOrAdminGuard, clientOrActuaryGuard, supervisorGuard } from './guards/auth-guard.guard';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { RegisterEmployeeComponent } from './components/register-employee/register-employee.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AccountCreationComponent } from './components/account-creation/account-creation.component';
import { CreateForeignCurrencyAccountComponent } from './components/create-foreign-currency-account/create-foreign-currency-account.component';
import { SecuritiesComponent } from './components/securities/securities.component';
import { MailComponent } from './components/mail/mail.component';
import { CardsComponent } from './components/cards/cards.component';
import { ClientPortalComponent } from './components/client-portal/client-portal.component';
import { AccountManagementComponent } from './components/account-management/account-management.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { RecipientsComponent } from './components/recipients/recipients.component';
import { LoanRequestComponent } from './components/loan-request/loan-request.component';
import { ExchageRateListComponent } from './components/exchage-rate-list/exchage-rate-list.component';
import { NewPaymentComponent } from './components/new-payment/new-payment.component';
import { NewTransactionComponent } from './components/new-transaction/new-transaction.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { CreateCardComponent } from './components/create-card/create-card.component';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';
import { SuccessComponent } from './components/success/success.component';
import { LoansComponent } from './components/loans/loans.component';
import { MyPortfolioComponent } from './components/my-portfolio/my-portfolio.component';
import { LoanDetailsComponent } from './components/loan-details/loan-details.component';
import { NewLoanRequestsComponent } from './components/new-loan-requests/new-loan-requests.component';
import { OptionsDisplayComponent } from './components/option/option.component';
import { OrderOverviewComponent } from './components/order-overview/order-overview.component';
import { TaxCalculationComponent } from './components/tax-calculation/tax-calculation.component';
import { BankAccountsComponent } from './components/bank-accounts/bank-accounts.component';
import { ActuaryManagementComponent } from './components/actuary-management/actuary-management.component';

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
  { path: 'register-user', component: RegisterUserComponent, canActivate: [authGuard, employeeOrAdminGuard] },
  { path: 'users/:id', component: EditUserComponent, canActivate: [authGuard, employeeOrAdminGuard] },
  { path: 'user/:id', component: UserDetailComponent, canActivate: [authGuard] },

  // employees
  { path: 'employees', component: EmployeesComponent, canActivate: [authGuard, adminGuard] },
  { path: 'register-employee', component: RegisterEmployeeComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employees/:id', component: EditEmployeeComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employee/:id', component: EmployeeDetailComponent, canActivate: [authGuard] },
  { path: 'client-portal', component: ClientPortalComponent, canActivate: [authGuard, employeeOrAdminGuard] },

  // accounts
  { path: 'account/:accountNumber', component: CardsComponent, canActivate: [authGuard] },
  { path: 'create-foreign-currency-account', component: CreateForeignCurrencyAccountComponent, canActivate: [authGuard, employeeOrAdminGuard] },
  { path: 'create-current-account', component: AccountCreationComponent, canActivate: [authGuard, employeeOrAdminGuard] },
  { path: 'account-management', component: AccountManagementComponent, canActivate: [authGuard] },
  { path: 'bank-accounts', component: BankAccountsComponent, canActivate: [authGuard, adminGuard] },

  // payments
  { path: 'transfer', component: TransferComponent, canActivate: [authGuard] }, // nzm koji guard treba
  { path: 'recipients', component: RecipientsComponent, canActivate: [authGuard] }, // client guard
  { path: 'new-payment', component: NewPaymentComponent, canActivate: [authGuard] }, // client guard
  { path: 'payment-details', component: PaymentDetailsComponent, canActivate: [authGuard] }, // client guard

  // cards and transactions
  { path: 'card/:cardNumber/transactions', component: TransactionListComponent, canActivate: [authGuard] },
  { path: 'card/:cardNumber/transactions/new', component: NewTransactionComponent, canActivate: [authGuard] },
  { path: 'transactions/:transactionId', component: TransactionDetailsComponent, canActivate: [authGuard] },
  { path: 'account/:accountNumber/create-card', component: CreateCardComponent, canActivate: [authGuard] },
  { path: 'loan-management/:clientId', component: LoansComponent, canActivate: [authGuard] },

  // exchange
  { path: 'exchange-rate', component: ExchageRateListComponent, canActivate: [authGuard] },

  // loans
  { path: 'loan-request', component: LoanRequestComponent, canActivate: [authGuard] },
  { path: 'loan-requests', component: NewLoanRequestsComponent, canActivate: [authGuard] },
  { path: 'loan-management/:clientId', component: LoansComponent, canActivate: [authGuard] },
  { path: 'loan-details/:loanId', component: LoanDetailsComponent, canActivate: [authGuard] },

  //success
  { path: 'success', component: SuccessComponent },

  // securities
  { path: 'my-portfolio', component: MyPortfolioComponent, canActivate: [authGuard, clientOrActuaryGuard] },
  { path: 'securities', component: SecuritiesComponent, canActivate: [authGuard, clientOrActuaryGuard] },
  { path: 'tax-portal', component: TaxCalculationComponent, canActivate: [authGuard, employeeOrAdminGuard] }, // not sure if this is the right guard!

  //options
  { path: 'options/:stockId', component: OptionsDisplayComponent, canActivate: [authGuard, clientOrActuaryGuard] },
  { path: 'order-overview', component: OrderOverviewComponent, canActivate: [authGuard, supervisorGuard] },

  //Actuary
  { path: 'actuaries', component: ActuaryManagementComponent, canActivate: [authGuard, supervisorGuard] }

];
