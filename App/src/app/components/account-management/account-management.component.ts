import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountResponse } from '../../models/account-response.model';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ButtonComponent} from '../shared/button/button.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {PaginationComponent} from '../shared/pagination/pagination.component';
import {ModalComponent} from '../shared/modal/modal.component';

export interface ChangeAccountNameDto {
  newName: string;
}

export interface ChangeAccountLimitDto {
  newLimit: number;
}

@Component({
  selector: 'app-account-management',
  imports: [CommonModule, FormsModule, ButtonComponent, InputTextComponent, PaginationComponent, ModalComponent],
  standalone: true,
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css',
})
export class AccountManagementComponent implements OnInit {
  accounts: AccountResponse[] = [];
  filteredAccounts: AccountResponse[] = [];
  selectedAccountNumber: string | undefined;
  clientId: string | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  totalUsers: number = 0;

  isNameModalOpen: boolean = false;
  isLimitModalOpen: boolean = false;
  newAccountName: string = '';
  newAccountLimit: number = 0;
  editingAccountNumber: string | null = null;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.queryParamMap.get('id');
    if ((this.isEmployee() || this.isAdmin()) && this.clientId) {
      this.fetchAccountsForEmployee(this.clientId);
    } else if ((this.isEmployee() || this.isAdmin()) && !this.clientId) {
      this.router.navigate(['/client-portal']);
    } else if (this.isClient()) {
      this.fetchAccountsForClient();
    } else {
      this.alertService.showAlert('error', 'Invalid access. Redirecting...');
      this.router.navigate(['/client-portal']);
    }
  }

  fetchAccountsForClient(): void {
    this.accountService.getMyAccountsRegular().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.filteredAccounts = accounts;
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load your accounts.');
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
        this.alertService.showAlert('error', 'Invalid client ID. Redirecting.');
        this.router.navigate(['/client-portal']);
      },
    });
  }

  isEmployee() {
    return this.authService.isEmployee();
  }
  isClient() {
    return this.authService.isClient();
  }
  isAdmin() {
    return this.authService.isAdmin();
  }

  viewCards(accountNumber: string): void {
    this.selectedAccountNumber = accountNumber;
    this.router.navigate([`/account/${accountNumber}`]);
  }

  openNameModal(accountNumber: string, currentName: string) {
    this.editingAccountNumber = accountNumber;
    this.newAccountName = currentName;
    this.isNameModalOpen = true;
  }

  closeNameModal() {
    this.isNameModalOpen = false;
    this.editingAccountNumber = null;
  }

  openLimitModal(accountNumber: string, currentLimit: number) {
    this.editingAccountNumber = accountNumber;
    this.newAccountLimit = currentLimit;
    this.isLimitModalOpen = true;
  }

  closeLimitModal() {
    this.isLimitModalOpen = false;
    this.editingAccountNumber = null;
  }

  changeAccountName() {
    if (!this.editingAccountNumber || !this.newAccountName.trim()) return;

    this.accountService
      .changeAccountName(this.editingAccountNumber, this.newAccountName.trim())
      .subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Account name updated successfully.');
          this.closeNameModal();
          this.refreshAccounts();
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to update account name.');
        },
      });
  }

  changeAccountLimit() {
    if (!this.editingAccountNumber || this.newAccountLimit <= 0) return;

    this.accountService
      .changeAccountLimit(this.editingAccountNumber, this.newAccountLimit)
      .subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Account limit change requested.');
          this.closeLimitModal();
          this.refreshAccounts();
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to request account limit change.');
        },
      });
  }

  refreshAccounts() {
    if (this.isClient()) {
      this.fetchAccountsForClient();
    } else if (this.clientId) {
      this.fetchAccountsForEmployee(this.clientId);
    }
  }
}
