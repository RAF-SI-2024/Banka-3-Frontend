import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountResponse } from '../../models/account-response.model';
import { FormsModule } from '@angular/forms';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {ModalComponent} from '../modal/modal.component';

@Component({
  selector: 'app-account-management',
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  standalone: true,
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css',
})
export class AccountManagementComponent implements OnInit {
  selectedAccountNumber: string | undefined;

  ngOnInit(): void {
    this.loadAccounts();
  }

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  allAccounts: AccountResponse[] = [];
  accounts: AccountResponse[] = [];

  currentPage: number = 0;
  pageSize: number = 10;
  totalUsers: number = 0;

  ownerNameFilter: string = '';
  accountNumberFilter: string = '';

  applyFilters(): void {
    let filteredAccounts = [...this.allAccounts];

    if (this.ownerNameFilter.trim()) {
      const searchTerm = this.ownerNameFilter.toLowerCase().trim();
      filteredAccounts = filteredAccounts.filter((account) => {
        const firstName = (account.owner?.firstName || '').trim().toLowerCase();
        const lastName = (account.owner?.lastName || '').trim().toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName.includes(searchTerm);
      });
    }

    if (this.accountNumberFilter.trim()) {
      const searchTerm = this.accountNumberFilter.toLowerCase().trim();
      filteredAccounts = filteredAccounts.filter((account) =>
        account.accountNumber.trim().toLowerCase().includes(searchTerm)
      );
    }

    this.accounts = filteredAccounts;
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
  isEmployee(){
    return this.authService.isEmployee()
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
