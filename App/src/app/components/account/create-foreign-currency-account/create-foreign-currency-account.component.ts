import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { User } from '../../../models/user.model';
import { NewBankAccount } from '../../../models/new-bank-account.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
import { AlertService } from '../../../services/alert.service';
import { CompanyService } from '../../../services/company.service';
import { Company, CreateCompany } from '../../../models/company.model';
import { AuthorizedPersonnel, CreateAuthorizedPersonnel } from '../../../models/authorized-personnel.model';
import { AuthorizedPersonnelService } from '../../../services/authorized-personnel.service';
import { CurrencyDto } from '../../../models/currency-dto.model';
import { CurrencyService } from '../../../services/currency.service';
import { CardService, CreateCardDto } from '../../../services/card.service';
import {NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {ButtonComponent} from '../../shared/button/button.component';
import {InputTextComponent} from '../../shared/input-text/input-text.component';
import {ModalComponent} from '../../shared/modal/modal.component';

@Component({
  selector: 'app-create-foreign-currency-account',
  templateUrl: './create-foreign-currency-account.component.html',
  styleUrls: ['./create-foreign-currency-account.component.css'],
  standalone: true,
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    NgForOf,
    ButtonComponent,
    InputTextComponent,
    NgIf,
    ModalComponent
  ]
})
export class CreateForeignCurrencyAccountComponent implements OnInit {
  loggedInEmployee: Employee | null = null;
  users: User[] = [];
  currencies: CurrencyDto[] = [];
  companies: Company[] = [];
  availablePersonnel: AuthorizedPersonnel[] = [];

  isCurrentAccount = true;
  isCompanyAccount = false;
  isNewCompany = false;
  isNewPersonnel = false;
  loadingCompanies = false;
  employeeId: number | null = null;
  isCurrAdmin: boolean = false;

  showCardModal: boolean = false;


  newAccount: NewBankAccount = {
    currency: 'EUR',
    clientId: 0,
    employeeId: 0,
    initialBalance: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    dailySpending: 0,
    monthlySpending: 0,
    isActive: 'INACTIVE',
    accountType: 'FOREIGN',
    accountOwnerType: 'PERSONAL',
    createCard: false,
    monthlyFee: 0,
    name: ''
  };

  companyInfo = {
    name: '',
    registrationNumber: '',
    taxNumber: '',
    activityCode: '',
    address: '',
    majorityOwner: ''
  };

  newCard: CreateCardDto = {
    accountNumber: '',
    name: '',
    type: 'DEBIT',
    issuer: 'VISA',
    cardLimit: 0
  };

  accountForm!: FormGroup;
  cardForm!: FormGroup;
  newPersonnelForm!: FormGroup;

  selectedCompanyId: number | null = null;
  selectedAuthorizedPersonnelId: number | null = null;
  private allowedActivityCodes: string[] = [
    "10.01", "62.01", "5.1", "62.09", "56.1", "86.1", "90.02",
    "1.11", "1.13", "13.1", "24.1", "24.2", "41.1", "41.2", "42.11",
    "42.12", "42.13", "42.21", "42.22", "7.1", "7.21", "8.11", "8.92",
    "47.11", "53.1", "53.2", "85.1", "85.2", "86.21", "86.22", "86.9",
    "84.12", "90.01", "90.04", "93.11", "93.13", "93.19", "26.11", "27.12", "29.1"
  ];

  constructor(
    private fb: FormBuilder,
    private userService: ClientService,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private authorizedPersonnelService: AuthorizedPersonnelService,
    private cardService: CardService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      clientId: [this.newAccount.clientId, Validators.required],
      accountType: [{ value: this.newAccount.accountType, disabled: true }],
      monthlyFee: [this.newAccount.monthlyFee, Validators.pattern(/^\d+(\.\d+)?$/)],
      accountOwnerType: [this.newAccount.accountOwnerType, Validators.required],
      selectedCompany: [this.selectedCompanyId],
      companyName: [this.companyInfo.name, Validators.minLength(3)],
      registrationNumber: [this.companyInfo.registrationNumber, Validators.minLength(3)],
      taxNumber: [this.companyInfo.taxNumber, Validators.minLength(3)],
      activityCode: [this.companyInfo.activityCode, [this.activityCodeValidator.bind(this)]],
      companyAddress: [this.companyInfo.address, Validators.minLength(5)],
      selectedAuthorizedPersonnel: [this.selectedAuthorizedPersonnelId],
      currency: [this.newAccount.currency, Validators.required], //, disabled: true
      dailyLimit: [this.newAccount.dailyLimit, Validators.pattern(/^\d+(\.\d+)?$/)],
      monthlyLimit: [this.newAccount.monthlyLimit, Validators.pattern(/^\d+(\.\d+)?$/)],
      isActive: [this.newAccount.isActive],
      createCard: [this.newAccount.createCard]
    });

    // card modal
    this.cardForm = this.fb.group({
      type: [this.newCard.type, Validators.required],
      issuer: [this.newCard.issuer, Validators.required],
      name: [this.newCard.name, Validators.required],
      cardLimit: [this.newCard.cardLimit, Validators.required]
    });

    // new auth p
    this.newPersonnelForm = this.fb.group({
      firstName: ['', [Validators.minLength(2)]],
      lastName: ['', [Validators.minLength(2)]],
      dateOfBirth: ['', [this.pastDateValidator]],
      gender: [''],
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: ['', [Validators.minLength(5)]]
    });

    const isAdmin = this.authService.isAdmin();
    const isEmployee = this.authService.isEmployee();
    this.isCurrAdmin = isAdmin;
    if (!(isAdmin || isEmployee)) {
      alert("Access denied. Only employees and admins can create accounts.");
      this.router.navigate(['/']);
      return;
    }
    this.isCompanyAccount = this.newAccount.accountOwnerType === 'COMPANY';
    this.currencies = this.currencyService.getCurrencies();
    this.loadUsers();

    this.employeeId = this.authService.getUserId();
    if (this.employeeId) {
      this.newAccount.employeeId = this.employeeId;
      if (!this.authService.isAdmin()) {
        this.employeeService.getEmployeeSelf().subscribe(
          (employee) => {
            this.loggedInEmployee = employee;
          },
          (error) => {
            console.error('Error fetching employee details:', error);
          }
        );
      }
    }

    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.accountForm.patchValue({ clientId: +userId });
        if (this.isCompanyAccount) {
          this.loadCompaniesForClient();
        }
      }
    });
  }

  navigateToRegisterUser() {
    this.router.navigate(['/register-user'], { queryParams: { redirect: 'foreign-account' } });
  }

  loadUsers() {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content;
      },
      error: (error) => console.error('Failed to load users:', error)
    });
  }

  private loadAvailablePersonnel(companyId: number): void {
    this.authorizedPersonnelService.getByCompany(companyId).subscribe({
      next: (personnel) => {
        this.availablePersonnel = personnel;
      },
      error: (error) => console.error('Failed to load personnel:', error)
    });
  }

  onAccountOwnerTypeChange() {
    this.isCompanyAccount = this.accountForm.get('accountOwnerType')?.value === 'COMPANY';
    if (this.isCompanyAccount && this.accountForm.get('clientId')?.value) {
      this.loadCompaniesForClient();
      // da sve to bude required
      this.accountForm.get('companyName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.accountForm.get('registrationNumber')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.accountForm.get('taxNumber')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.accountForm.get('activityCode')?.setValidators([Validators.required, this.activityCodeValidator.bind(this)]);
      this.accountForm.get('companyAddress')?.setValidators([Validators.required, Validators.minLength(5)]);

      // da apdejtuje validnost
      this.accountForm.get('companyName')?.updateValueAndValidity();
      this.accountForm.get('registrationNumber')?.updateValueAndValidity();
      this.accountForm.get('taxNumber')?.updateValueAndValidity();
      this.accountForm.get('activityCode')?.updateValueAndValidity();
      this.accountForm.get('companyAddress')?.updateValueAndValidity();
    }
    if (!this.isCompanyAccount) {
      this.accountForm.patchValue({ selectedCompany: null });
      this.selectedCompanyId = null;
      this.isNewCompany = false;

      // vrni sve ovo ni na sta :)
      this.accountForm.get('companyName')?.clearValidators();
      this.accountForm.get('registrationNumber')?.clearValidators();
      this.accountForm.get('taxNumber')?.clearValidators();
      this.accountForm.get('activityCode')?.clearValidators();
      this.accountForm.get('companyAddress')?.clearValidators();

      this.accountForm.get('companyName')?.setValue('');
      this.accountForm.get('registrationNumber')?.setValue('');
      this.accountForm.get('taxNumber')?.setValue('');
      this.accountForm.get('activityCode')?.setValue('');
      this.accountForm.get('companyAddress')?.setValue('');

      this.accountForm.get('companyName')?.updateValueAndValidity();
      this.accountForm.get('registrationNumber')?.updateValueAndValidity();
      this.accountForm.get('taxNumber')?.updateValueAndValidity();
      this.accountForm.get('activityCode')?.updateValueAndValidity();
      this.accountForm.get('companyAddress')?.updateValueAndValidity();

      //vrati i novu personelu ako je postojalo nesto tu
      this.newPersonnelForm.get('firstName')?.clearValidators();
      this.newPersonnelForm.get('lastName')?.clearValidators();
      this.newPersonnelForm.get('dateOfBirth')?.clearValidators();
      this.newPersonnelForm.get('gender')?.clearValidators();
      this.newPersonnelForm.get('email')?.clearValidators();
      this.newPersonnelForm.get('phoneNumber')?.clearValidators();
      this.newPersonnelForm.get('address')?.clearValidators();

      this.newPersonnelForm.patchValue({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phoneNumber: '',
        address: ''
      });
      this.newPersonnelForm.updateValueAndValidity();
    }
  }

  toggleIsActive() {
    const current = this.accountForm.get('isActive')?.value;
    this.accountForm.get('isActive')?.setValue(current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
  }

  toggleCreateCard() {
    const current = this.accountForm.get('createCard')?.value;
    this.accountForm.get('createCard')?.setValue(!current);
  }

  isCompanyFormValid(): boolean {
    if (!this.isCompanyAccount) return true;

    if (!this.isNewCompany && !this.accountForm.get('selectedCompany')?.value) return false;

    if (this.isNewCompany) {
      const { companyName, registrationNumber, taxNumber, activityCode, companyAddress } = this.accountForm.getRawValue();
      if (
        !companyName.trim() ||
        !registrationNumber.trim() ||
        !taxNumber.trim() ||
        !activityCode.trim() ||
        !companyAddress.trim()
      ) {
        return false;
      }
    }

    if (this.isNewPersonnel) {
      if (this.newPersonnelForm.invalid) {
        return false;
      }
    }
    return true;
  }

  onClientChange() {
    if (this.accountForm.get('clientId')?.value && this.isCompanyAccount) {
      this.loadCompaniesForClient();
    }
  }

  private loadCompaniesForClient() {
    this.loadingCompanies = true;
    this.accountForm.get('selectedCompany')?.disable();

    const clientId = this.accountForm.get('clientId')?.value;
    this.companyService.getCompaniesByClientId(clientId).subscribe({
      next: (companies) => {
        this.companies = companies;
        this.loadingCompanies = false;
        this.accountForm.get('selectedCompany')?.enable();
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.loadingCompanies = false;
        this.accountForm.get('selectedCompany')?.enable();
      }
    });
  }

  onCompanySelect() {
    const selected = +this.accountForm.get('selectedCompany')?.value;
    this.selectedCompanyId = selected;
    if (selected === -1) { // create new company selektovano
      this.isNewCompany = true;
      this.resetCompanyForm();
      this.availablePersonnel = [];
    } else {
      this.isNewCompany = false;
      const selectedCompany = this.companies.find(c => c.id === selected);
      if (selectedCompany) {
        this.populateCompanyForm(selectedCompany);
        this.loadAvailablePersonnel(selectedCompany.id);
      } else {
        this.resetCompanyForm();
        this.availablePersonnel = [];
      }
    }
    this.isNewPersonnel = false;
    this.accountForm.patchValue({ selectedAuthorizedPersonnel: null });
  }

  onPersonnelSelect() {
    const selected = +this.accountForm.get('selectedAuthorizedPersonnel')?.value;
    this.selectedAuthorizedPersonnelId = selected;
    this.isNewPersonnel = selected === -1;
    if (!this.isNewPersonnel) {
      this.newPersonnelForm.reset();
    }

    if (this.isNewPersonnel) {
      // isto i ovde prevrt
      this.newPersonnelForm.get('firstName')?.setValidators([Validators.required]);
      this.newPersonnelForm.get('lastName')?.setValidators([Validators.required]);
      this.newPersonnelForm.get('dateOfBirth')?.setValidators([Validators.required, this.pastDateValidator]);
      this.newPersonnelForm.get('gender')?.setValidators([Validators.required]);
      this.newPersonnelForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.newPersonnelForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]);
      this.newPersonnelForm.get('address')?.setValidators([Validators.required, Validators.minLength(5)]);

      this.newPersonnelForm.get('firstName')?.updateValueAndValidity();
      this.newPersonnelForm.get('lastName')?.updateValueAndValidity();
      this.newPersonnelForm.get('dateOfBirth')?.updateValueAndValidity();
      this.newPersonnelForm.get('gender')?.updateValueAndValidity();
      this.newPersonnelForm.get('email')?.updateValueAndValidity();
      this.newPersonnelForm.get('phoneNumber')?.updateValueAndValidity();
      this.newPersonnelForm.get('address')?.updateValueAndValidity();
    } else {
      this.newPersonnelForm.get('firstName')?.clearValidators();
      this.newPersonnelForm.get('lastName')?.clearValidators();
      this.newPersonnelForm.get('dateOfBirth')?.clearValidators();
      this.newPersonnelForm.get('gender')?.clearValidators();
      this.newPersonnelForm.get('email')?.clearValidators();
      this.newPersonnelForm.get('phoneNumber')?.clearValidators();
      this.newPersonnelForm.get('address')?.clearValidators();

      this.newPersonnelForm.patchValue({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phoneNumber: '',
        address: ''
      });
      this.newPersonnelForm.updateValueAndValidity();
    }

  }

  private populateCompanyForm(company: Company) {
    this.accountForm.patchValue({
      companyName: company.name,
      registrationNumber: company.registrationNumber,
      taxNumber: company.taxId,
      activityCode: company.activityCode,
      companyAddress: company.address
    });
  }

  private resetCompanyForm() {
    this.accountForm.patchValue({
      companyName: '',
      registrationNumber: '',
      taxNumber: '',
      activityCode: '',
      companyAddress: ''
    });
  }

  getClientName(clientId: number | string): string {
    const id = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
    const client = this.users.find(u => u.id === id);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  }

  async onSubmit() {
    try {
      let companyId: number | undefined;
      let authorizedPersonId: number | undefined;
      const formValue = this.accountForm.getRawValue();

      if (this.isCompanyAccount) {
        if (this.isNewCompany) {
          const createCompanyDto: CreateCompany = {
            name: formValue.companyName,
            registrationNumber: formValue.registrationNumber,
            taxId: formValue.taxNumber,
            activityCode: formValue.activityCode,
            address: formValue.companyAddress,
            majorityOwner: formValue.clientId
          };
          try {
            const newCompany = await this.companyService.createCompany(createCompanyDto).toPromise();
            if (newCompany && 'id' in newCompany) {
              companyId = newCompany.id;
            }
          } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to create company (try different tax number or registration number)';
            this.alertService.showAlert('error', errorMessage);
            return;
          }
        } else {
          companyId = formValue.selectedCompany || undefined;
        }

        if (this.isNewPersonnel && companyId) {
          const createPersonnelDto: CreateAuthorizedPersonnel = {
            ...this.newPersonnelForm.value,
            companyId: companyId
          };
          try {
            const createdPersonnel = await this.authorizedPersonnelService.createAuthorizedPersonnel(createPersonnelDto).toPromise();
            if (createdPersonnel && 'id' in createdPersonnel) {
              authorizedPersonId = createdPersonnel.id;
            }
          } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to create authorized personnel';
            this.alertService.showAlert('error', errorMessage);
            return;
          }
        } else if (formValue.selectedAuthorizedPersonnel) {
          authorizedPersonId = formValue.selectedAuthorizedPersonnel;
        }
      }

      this.newAccount = {
        ...this.newAccount,
        ...formValue,
        companyId: companyId,
        authorizedPersonId: authorizedPersonId
      };

      this.accountService.createForeignAccount(this.newAccount).subscribe({
        next: (createdAccount) => {
          if (this.accountForm.get('createCard')?.value) {
            this.newCard.accountNumber = createdAccount.accountNumber;
            this.showCardModal = true;
          } else {
            this.alertService.showAlert('success', 'Account created successfully!');
            this.router.navigate(['/success'], {
              state: {
                title: 'Account Created!',
                message: 'The account has been successfully created.',
                buttonName: 'Go to Client Portal',
                continuePath: '/client-portal'
              }
            });
          }
        },
        error: (error) => {
          console.error('Failed to create account:', error);
          this.alertService.showAlert('error', 'Failed to create account');
        }
      });
    } catch (error) {
      console.error('Error creating company:', error);
      this.alertService.showAlert('error', 'Failed to create company');
    }
  }
  submitCardForm(): void {
    const request = this.authService.isClient()
      ? this.cardService.requestCard(this.cardForm.getRawValue())
      : this.cardService.createCard(this.cardForm.getRawValue());

    request.subscribe({
      next: () => {
        this.showCardModal = false;
        this.router.navigate(['/success'], {
          state: {
            title: 'Card Created!',
            message: 'The card has been successfully created.',
            buttonName: 'Go to Account',
            continuePath: `/account/${this.newCard.accountNumber}`
          }
        });
      },
      error: (err) => {
        this.alertService.showAlert('error', 'Failed to create card.');
        console.error(err);
      }
    });
  }

  activityCodeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // da required validator hendla empty values
    }
    return this.allowedActivityCodes.includes(control.value)
      ? null
      : { invalidActivityCode: true };
  }

  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // req val da hvata empty val
    }
    const today = new Date();
    const inputDate = new Date(control.value);
    return inputDate < today ? null : { invalidDate: 'Birthdate must be in the past' };
  }

}
