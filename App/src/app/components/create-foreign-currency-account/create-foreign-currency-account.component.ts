import { Component, OnInit, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';
import { Currency } from '../../models/currency.model';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { Account as Account } from '../../models/account.model';
import { AccountType } from '../../enums/account-type.enum';
import { AccountOwnerType } from '../../enums/account-owner-type.enum';
import { AccountStatus } from '../../enums/account-status.enum';

@Component({
  selector: 'app-create-foreign-currency-account',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-foreign-currency-account.component.html',
  styleUrl: './create-foreign-currency-account.component.css',
})
export class CreateForeignCurrencyAccountComponent implements OnInit {
  accountForm: FormGroup;
  isBusinessAccount = false;
  users: User[] = [];
  currencies: Currency[] = [];
  generatedAccountNumber: string = '';
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  loggedInEmployeeFullName: string = '';
  loggedInEmployeePosition: string = '';

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      accountType: ['CLIENT'],
      currency: ['', Validators.required],
      companyName: ['', Validators.required],
      companyRegistrationNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]+$/)],
      ],
      taxIdentificationNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]+$/)],
      ],
      companyActivityCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{2}\.\d{2}$/)],
      ],
      companyAddress: ['', Validators.required],
      majorityOwnerId: ['', Validators.required],
      clientId: ['', Validators.required],
      accountNumber: [''],
      dailyLimit: ['', [Validators.required]],
      monthlyLimit: ['', [Validators.required]],
      createCard: [false],
      employeeId: [''],
    });
  }

  ngOnInit(): void {
    this.accountForm
      .get('accountType')
      ?.valueChanges.subscribe(accountType => {
        this.isBusinessAccount = accountType === 'business';
        this.updateBusinessFieldsVisibility();
        this.generateAccountNumber();
      });
    this.updateBusinessFieldsVisibility();

    this.loadUsers();
    this.preselectNewUser();
    this.loadCurrencies();
    this.generateAccountNumber();
    this.populateEmployeeId();
    this.loadLoggedInEmployeeInfo();
  }

  private populateEmployeeId() {
    const loggedInEmployeeId = this.authService.getUserId();
    if (loggedInEmployeeId !== null) {
      this.accountForm.patchValue({ employeeId: loggedInEmployeeId });
    } else {
      this.alertService.showAlert(
        'error',
        'Failed to load employee details. Please try again later.'
      );
    }
  }

  private loadLoggedInEmployeeInfo() {
    this.employeeService.getEmployeeSelf().subscribe({
      next: (fetchedEmployee) => {
        if (!fetchedEmployee) {
          this.alertService.showAlert('error', 'Employee not found.');
          this.router.navigate(['/']);
          return;
        }
        this.loggedInEmployeeFullName = `${fetchedEmployee.firstName} ${fetchedEmployee.lastName}`;
        this.loggedInEmployeePosition = fetchedEmployee.position;
      },
      error: () => {
        this.alertService.showAlert(
          'error',
          'Failed to load employee details. Please try again later.'
        );
      },
    });
  }

  private loadUsers() {
    this.userService.getAllUsers(0, 1000).subscribe({
      next: (response) => {
        this.users = response.content;
      },
      error: () => {
        this.alertService.showAlert(
          'error',
          'Failed to load users. Please try again later.'
        );
      },
    });
  }

  private preselectNewUser() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const newUserId = params['newUserId'];
      if (newUserId) {
        this.accountForm.patchValue({ clientId: newUserId });
      }
    });
  }

  private loadCurrencies() {
    // mock data, should be loaded from the server when implemented
    this.currencies = [
      {
        code: 'RSD',
        name: 'Serbian Dinar',
        symbol: 'RSD',
        country: ['Serbia'],
        description: 'Serbian Dinar',
        isActive: true,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        country: ['Germany', 'Slovenia', 'Other EU'],
        description: 'Euro',
        isActive: true,
      },
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        country: ['USA'],
        description: 'US Dollar',
        isActive: true,
      },
      {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        country: ['Switzerland'],
        description: 'Swiss Franc',
        isActive: true,
      },
    ];

    const rsdIndex = this.currencies.findIndex(
      (currency) => currency.code === 'RSD'
    );
    if (rsdIndex > -1) this.currencies.splice(rsdIndex, 1);
  }

  generateAccountNumber() {
    const bankCode = '111';
    const branchCode = '0001';
    const accountNumberDigits = 9;
    const randomNumber = Math.random()
      .toString()
      .slice(2, 2 + accountNumberDigits)
      .padEnd(accountNumberDigits, '0');
    const accountType =
      this.accountForm.get('accountType')?.value === 'business' ? '22' : '21';

    this.generatedAccountNumber = `${bankCode}${branchCode}${randomNumber}${accountType}`;
    this.accountForm.patchValue({ accountNumber: this.generatedAccountNumber });
  }

  updateBusinessFieldsVisibility() {
    if (this.isBusinessAccount) {
      this.accountForm.controls['companyName'].enable();
      this.accountForm.controls['companyRegistrationNumber'].enable();
      this.accountForm.controls['taxIdentificationNumber'].enable();
      this.accountForm.controls['companyActivityCode'].enable();
      this.accountForm.controls['companyAddress'].enable();
      this.accountForm.controls['majorityOwnerId'].enable();
    } else {
      this.accountForm.controls['companyName'].disable();
      this.accountForm.controls['companyRegistrationNumber'].disable();
      this.accountForm.controls['taxIdentificationNumber'].disable();
      this.accountForm.controls['companyActivityCode'].disable();
      this.accountForm.controls['companyAddress'].disable();
      this.accountForm.controls['majorityOwnerId'].disable();
    }
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      Object.keys(this.accountForm.controls).forEach((key) => {
        this.accountForm.get(key)?.markAsTouched();
      });
      return;
    }

    const accountData = this.accountForm.value;
    accountData.clientId = parseInt(accountData.clientId, 10);
    accountData.employeeId = parseInt(accountData.employeeId, 10);
    accountData.createCard = !!accountData.createCard;

    const foreignCurrencyAccountData: Account = {
      availableBalance: 0, name: "", number: "",
      currency: accountData.currency,
      clientId: accountData.clientId,
      employeeId: accountData.employeeId,
      companyId: accountData.companyName ? accountData.companyId : null,
      initialBalance: 0,
      dailyLimit: accountData.dailyLimit,
      monthlyLimit: accountData.monthlyLimit,
      dailySpending: 0,
      monthlySpending: 0,
      isActive: AccountStatus.ACTIVE,
      accountType: AccountType.FOREIGN,
      accountOwnerType: this.isBusinessAccount
        ? AccountOwnerType.COMPANY
        : AccountOwnerType.PERSONAL,
      createCard: accountData.createCard
    };

    this.accountService.createForeignAccount(foreignCurrencyAccountData).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Account created successfully!');
      },
      error: () => {
        this.alertService.showAlert(
          'error',
          'Failed to create account. Please try again.'
        );
      },
    });
  }

  onCreateNewUserClick() {
    this.router.navigate(['/register-user']);
  }
}
