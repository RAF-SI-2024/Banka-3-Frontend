import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountResponse } from '../../models/account-response.model';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {ModalComponent} from '../modal/modal.component';
import {RouterLink, ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-account-management',
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  standalone: true,
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css',
})
export class AccountManagementComponent implements OnInit {
  selectedAccountNumber: string | undefined;

  // private authService = inject(AuthService);
  // private accountService = inject(AccountService);
  // private alertService = inject(AlertService);
  allAccounts: AccountResponse[] = [];
  accounts: AccountResponse[] = [];
  filteredAccounts: AccountResponse[] = [];

  currentPage: number = 0;
  pageSize: number = 10;
  totalUsers: number = 0;

  ownerNameFilter: string = '';
  accountNumberFilter: string = '';

  clientId: string | null = null;
  filterText: string = '';

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.clientId = this.route.snapshot.paramMap.get('id');
    this.clientId = this.route.snapshot.queryParamMap.get('id');
    if (this.isEmployee() && this.clientId) {
      this.fetchAccountsForEmployee(this.clientId);
    } else if(this.isEmployee() && !this.clientId){
      this.router.navigate(['/client-portal']);
    } else if (this.isClient()) {
      this.fetchAccountsForClient();
    } else {
      // alert('Invalid access. Redirecting...');
      this.alertService.showAlert(
        'error',
        'Invalid access. Redirecting...'
      );
      this.router.navigate(['/client-portal']);
    }
  }

  fetchAccountsForClient(): void {
    this.accountService.getMyAccountsRegular().subscribe({
      next: (accounts) => {
        this.accounts = accounts; //.content
        this.filteredAccounts = accounts; //.content
      },
      error: () => {
        // alert('Failed to load your accounts.');
        this.alertService.showAlert(
          'error',
          'Failed to load your accounts.'
        );
      },
    });
  }

  fetchAccountsForEmployee(clientId: string): void {
    this.accountService.getAccountsForClient(clientId, 0, 100).subscribe({
      next: (response) => {
        this.accounts = response.content;
        this.filteredAccounts = response.content;
      },
      error: () => {
        // alert('Invalid client ID. Redirecting   :(...');
        this.alertService.showAlert(
          'error',
          'Invalid client ID. Redirecting.'
        );
        this.router.navigate(['/client-portal']);
      },
    });
  }


  // applyFilters(): void {
  //   let filteredAccounts = [...this.allAccounts];
  //
  //   if (this.ownerNameFilter.trim()) {
  //     const searchTerm = this.ownerNameFilter.toLowerCase().trim();
  //     filteredAccounts = filteredAccounts.filter((account) => {
  //       const firstName = (account.owner?.firstName || '').trim().toLowerCase();
  //       const lastName = (account.owner?.lastName || '').trim().toLowerCase();
  //       const fullName = `${firstName} ${lastName}`.trim();
  //       return fullName.includes(searchTerm);
  //     });
  //   }
  //
  //   if (this.accountNumberFilter.trim()) {
  //     const searchTerm = this.accountNumberFilter.toLowerCase().trim();
  //     filteredAccounts = filteredAccounts.filter((account) =>
  //       account.accountNumber.trim().toLowerCase().includes(searchTerm)
  //     );
  //   }
  //
  //   this.accounts = filteredAccounts;
  // }

  isEmployee(){
    return this.authService.isEmployee();
  }
  isClient(){
    return this.authService.isClient();
  }

  loadAccounts() {
    this.accountService
      .getAllAccounts(this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.allAccounts = data.content.sort((a, b) => {
            const nameA = `${a.owner?.firstName || ''} ${
              a.owner?.lastName || ''
            }`
              .trim()
              .toLowerCase();
            const nameB = `${b.owner?.firstName || ''} ${
              b.owner?.lastName || ''
            }`
              .trim()
              .toLowerCase();
            return nameA.localeCompare(nameB);
          });
          this.accounts = [...this.allAccounts];
          this.totalUsers = data.totalElements;
        },
        error: () => {
          this.alertService.showAlert(
            'error',
            'Failed to create account. Please try again.'
          );
        },
      });
  }

  viewCards(accountNumber: string): void {
    this.selectedAccountNumber = accountNumber;
    window.location.href = `/account/${accountNumber}`;
  }

  isModalOpen: boolean = false;

  // Function to open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Function to close the modal
  closeModal() {
    this.isModalOpen = false;
  }


}
