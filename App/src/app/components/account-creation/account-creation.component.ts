import {Component, inject, OnInit} from '@angular/core';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user.model';
import { NewBankAccount } from '../../models/new-bank-account.model';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import {AlertService} from '../../services/alert.service';
import {SelectComponent} from '../shared/select/select.component';
import {ButtonComponent} from '../shared/button/button.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
// import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-account-creation',
  templateUrl: './account-creation.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SelectComponent,
    ButtonComponent,
    InputTextComponent,
    // NgForOf,
    // NgIf
  ],
  styleUrls: ['./account-creation.component.css']
})
export class AccountCreationComponent implements OnInit {
  loggedInEmployee: Employee | null = null;
  users: User[] = [];
  companyInfo = {
    name: '',
    registrationNumber: '',
    taxNumber: '',
    activityCode: '',
    address: '',
    majorityOwner: ''
  };

  isCurrentAccount = true;
  isCompanyAccount = false;
  employeeId: number | null = null;
  availableCurrencies: string[] = ['RSD'];

  newAccount: NewBankAccount = {
    currency: 'RSD',
    clientId: 0,
    employeeId: 0,
    initialBalance: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    dailySpending: 0,
    monthlySpending: 0,
    isActive: 'INACTIVE',
    accountType: 'CURRENT',
    accountOwnerType: 'PERSONAL',
    createCard: false,
    monthlyFee: 0
  };
  constructor(
    private userService: ClientService,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.isAdmin();
    const isEmployee = this.authService.isEmployee();
    if (!(isAdmin || isEmployee)) {
      alert("Access denied. Only employees and admins can create accounts.");
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
    this.employeeId = this.authService.getUserId();
    if (this.employeeId) {
      this.newAccount.employeeId = this.employeeId;
      this.employeeService.getEmployeeSelf().subscribe(
        (employee) => {
          this.loggedInEmployee = employee;
        },
        (error) => {
          console.error('Error fetching employee details:', error);
        }
      );


    }
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.newAccount.clientId = +userId; // preselect
      }
    });
    // this.loadUsers();
    // this.onAccountTypeChange();
  }

  navigateToRegisterUser() {
    this.router.navigate(['/register-user'], { queryParams: { redirect: 'account' } });
  }

  loadUsers() {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content;
      },
      error: (error) => console.error('Failed to load users:', error)
    });
  }

  // onAccountTypeChange() {
  //   this.isCurrentAccount = this.newAccount.accountType === 'CURRENT';
  //   if (!this.isCurrentAccount) {
  //     this.newAccount.monthlyFee = 0;
  //     this.availableCurrencies = ['EUR', 'CHF', 'USD', 'GBP', 'JPY', 'CAD', 'AUD'];
  //     this.newAccount.currency = '';
  //
  //   }else {
  //     this.availableCurrencies = ['RSD'];
  //     this.newAccount.currency = 'RSD';
  //   }
  // }

  onAccountOwnerTypeChange() {
    this.isCompanyAccount = this.newAccount.accountOwnerType === 'COMPANY';
    if (!this.isCompanyAccount) {
      this.newAccount.companyId = undefined;
    }
  }

  toggleIsActive() {
    this.newAccount.isActive = this.newAccount.isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }


  isCompanyFormValid(): boolean {
    if (!this.isCompanyAccount) return true;
    return Object.values(this.companyInfo).every(value => value.trim() !== '');
  }

  onSubmit() {
    if (!this.newAccount.clientId || !this.employeeId) return;

    if (this.isCompanyAccount) {
      this.newAccount.companyId = 1; // hardc
    }

    this.accountService.createCurrentAccount(this.newAccount).subscribe({
      next: () => {
        console.log('Account created successfully!');
        // alert("Account created successfully!");
        this.alertService.showAlert('success', 'Account created successfully!');
        this.router.navigate(['/users']);
      },
      error: (error) => {
        console.error('Failed to create account:', error);
        alert('Failed to create account');
      }
    });
  }
}
