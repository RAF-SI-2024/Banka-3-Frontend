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
import { CompanyService } from '../../services/company.service';
import { Company, CreateCompany } from '../../models/company.model';
import {CreateAuthorizedPersonnel} from '../../models/authorized-personnel.model';
import {AuthorizedPersonnelService} from '../../services/authorized-personnel.service';
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
  isCurrAdmin: boolean = false;

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
  //za kompaniju novo
  companies: Company[] = [];
  selectedCompanyId: number | null = null;
  isNewCompany = false;
  loadingCompanies = false;

  //za onog dodatnog
  selectedAuthorizedPersonnelId: number | null = null;
  availablePersonnel: User[] = [];
  constructor(
    private userService: ClientService,
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private authorizedPersonnelService: AuthorizedPersonnelService
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.isAdmin();
    const isEmployee = this.authService.isEmployee();
    this.isCurrAdmin = isAdmin;
    if (!(isAdmin || isEmployee)) {
      alert("Access denied. Only employees and admins can create accounts.");
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
    this.loadAvailablePersonnel();
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
        if (this.isCompanyAccount) this.loadCompaniesForClient(); //preload i za kompanije ako treba
      }
    });
    // this.loadUsers();
    // this.onAccountTypeChange();
  }

  navigateToRegisterUser() {
    this.router.navigate(['/register-user'], { queryParams: { redirect: 'current-account' } });
  }

  loadUsers() {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content;
      },
      error: (error) => console.error('Failed to load users:', error)
    });
  }
  private loadAvailablePersonnel() {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.availablePersonnel = response.content;
      },
      error: (error) => console.error('Failed to load personnel:', error)
    });
  }

  onAccountOwnerTypeChange() {
    this.isCompanyAccount = this.newAccount.accountOwnerType === 'COMPANY';
    if (this.isCompanyAccount && this.newAccount.clientId) {
      this.loadCompaniesForClient();
    }
    if (!this.isCompanyAccount) {
      this.newAccount.companyId = undefined;
      this.selectedCompanyId = null;
      this.isNewCompany = false;
    }
  }

  toggleIsActive() {
    this.newAccount.isActive = this.newAccount.isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }

  isCompanyFormValid(): boolean {
    if (!this.isCompanyAccount) return true;
    if (this.isNewCompany) {
      // validiraj sve osim majority ownera za sad
      return this.companyInfo.name.trim() !== '' &&
        this.companyInfo.registrationNumber.trim() !== '' &&
        this.companyInfo.taxNumber.trim() !== '' &&
        this.companyInfo.activityCode.trim() !== '' &&
        this.companyInfo.address.trim() !== '';
    }
    return !!this.selectedCompanyId; // just sel comp
  }

  //todo novo za kompanije

  onClientChange() {
    if (this.newAccount.clientId && this.isCompanyAccount) {
      this.loadCompaniesForClient();
    }
  }

  private loadCompaniesForClient() {
    this.loadingCompanies = true;
    this.companyService.getCompaniesByClientId(this.newAccount.clientId!).subscribe({
      next: (companies) => {
        this.companies = companies;
        this.loadingCompanies = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.loadingCompanies = false;
      }
    });
  }

  onCompanySelect() {
    // alert(this.selectedCompanyId);
    // alert(`Value: ${this.selectedCompanyId}, Type: ${typeof this.selectedCompanyId}`);
    if (this.selectedCompanyId === -1) { // Create new company selektovano
      // alert("dakle jes -1, sto onda nisu slobodna polja");
      this.isNewCompany = true;
      this.resetCompanyForm();
    } else {
      // alert("ne registruje da je isto?");
      this.isNewCompany = false;
      const selectedCompany = this.companies.find(c => c.id === Number(this.selectedCompanyId));
      if (selectedCompany) {
        this.populateCompanyForm(selectedCompany);
      } else {
        // alert("NITI OVDE");
        this.resetCompanyForm();
      }
    }
  }

  private populateCompanyForm(company: Company) {
    this.companyInfo = {
      name: company.name,
      registrationNumber: company.registrationNumber,
      taxNumber: company.taxId,
      activityCode: company.activityCode,
      address: company.address,
      // majorityOwner: company.majorityOwner.toString()
      majorityOwner: this.newAccount.clientId.toString()
    };
  }

  private resetCompanyForm() {
    this.companyInfo = {
      name: '',
      registrationNumber: '',
      taxNumber: '',
      activityCode: '',
      address: '',
      majorityOwner: ''
    };
  }

  private formatDate(date: Date): string {
    const isoString = new Date(date).toISOString();
    return isoString.split('T')[0];
  }

  getClientName(clientId: number): string {
    const client = this.users.find(u => u.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  }

  async onSubmit() {
    //nov
    try {
      let companyId: number | undefined;

      if (this.isCompanyAccount) {
        // create if new
        if (this.isNewCompany) {
          const createCompanyDto: CreateCompany = {
            name: this.companyInfo.name,
            registrationNumber: this.companyInfo.registrationNumber,
            taxId: this.companyInfo.taxNumber,
            activityCode: this.companyInfo.activityCode,
            address: this.companyInfo.address,
            majorityOwner: this.newAccount.clientId
          };
          //za err hendl
          try {
            const newCompany = await this.companyService.createCompany(createCompanyDto).toPromise();
            if (newCompany && 'id' in newCompany) {
              companyId = newCompany.id;
            }
          } catch (error: any) {

            const errorMessage = error?.error?.message || 'Failed to create company (try different tax number or registration number';
            this.alertService.showAlert('error', errorMessage);
            return;
          }

        } else {
          companyId = this.selectedCompanyId || undefined;
        }
        //za personelu
        if (this.selectedAuthorizedPersonnelId) {
          const selectedUser = this.availablePersonnel.find(u => u.id === this.selectedAuthorizedPersonnelId);

          if (!selectedUser) {
            throw new Error('Selected authorized personnel not found');
          }
          const formattedDate = this.formatDate(selectedUser.birthDate);

          try {
            const createPersonnelDto: CreateAuthorizedPersonnel = {
              firstName: selectedUser.firstName,
              lastName: selectedUser.lastName,
              dateOfBirth: formattedDate,
              gender: selectedUser.gender,
              email: selectedUser.email,
              phoneNumber: selectedUser.phone || '',
              address: selectedUser.address || '',
              companyId: companyId!
            };

            await this.authorizedPersonnelService.createAuthorizedPersonnel(createPersonnelDto).toPromise();
          } catch (error: any) {
            const errorMessage = error?.error?.message || 'Failed to create authorized personnel';
            this.alertService.showAlert('error', errorMessage);
            return;
          }

        }

      }

      this.newAccount.companyId = companyId;

      this.accountService.createCurrentAccount(this.newAccount).subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Account created successfully!');
          // this.router.navigate(['/client-portal']);
          this.router.navigate(['/success'], {
            state: {
              title: 'Account Created!',
              message: 'The account has been successfully created.',
              buttonName: 'Go to Client Portal',
              continuePath: '/client-portal'
            }
          });
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
}
