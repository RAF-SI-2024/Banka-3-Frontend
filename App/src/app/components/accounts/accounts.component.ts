import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { AccountService } from '../../services/account.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];

  // Polje za sortiranje transakcija
  transactionSortBy: 'date' | 'type' = 'date';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
    this.accountService.getUserAccounts().subscribe({
      next: (accs) => {
        this.accounts = accs;
        if (this.accounts.length > 0) {
          this.onSelectAccount(this.accounts[0]);
        }
      },
      error: (err) => {
        console.error('Error fetching accounts:', err);
      }
    });
  }

  onSelectAccount(account: Account): void {
    this.selectedAccount = account;
    this.accountService.getAccountTransactions(account.id).subscribe({
      next: (trans) => {
        this.transactions = trans;
        this.sortTransactions();
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  onDetailsClick(account: Account): void {
    console.log('DETALJNI PRIKAZ za račun:', account);
  }

  onChangeSort(field: 'date' | 'type'): void {
    this.transactionSortBy = field;
    this.sortTransactions();
  }

  sortTransactions(): void {
    if (this.transactionSortBy === 'date') {
      this.transactions.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    } else {
      this.transactions.sort((a, b) => a.type.localeCompare(b.type));
    }
  }
}
