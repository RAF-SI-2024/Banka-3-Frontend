import {Component, inject, OnInit} from '@angular/core';
import { AccountService } from '../../services/account.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AccountTransfer} from '../../models/account-transfer';
import {Router} from '@angular/router';
import {AlertService} from '../../services/alert.service';
import {AccountResponse} from '../../models/account-response.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  standalone: true,
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {

  private accountService = inject(AccountService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  accounts: AccountResponse[] = [];
  selectedFromAccountNumber: string | undefined;
  selectedToAccountNumber: string | undefined;
  transferAmount: number | undefined;



  ngOnInit(): void {
    this.accountService.getAccountsForClient("2").subscribe({
      next: (response) => {
        this.accounts = response.content;
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load your account. Please try again later.');
        this.accounts = [];
      }
    });
  }

  get selectedFromAccount(): AccountResponse | undefined {
    return this.accounts.find(acc => acc.accountNumber === this.selectedFromAccountNumber);
  }

  get selectedToAccount(): AccountResponse | undefined {
    return this.accounts.find(acc => acc.accountNumber === this.selectedToAccountNumber);
  }

  onContinue(): void {
    if (!this.selectedFromAccount || !this.selectedToAccount || !this.transferAmount) {
      this.alertService.showAlert('error', 'Please fill in all fields.');
      return;
    }

    if (this.selectedFromAccount.availableBalance < this.transferAmount) {
      this.alertService.showAlert('error', 'You do not have enough funds.');
      return;
    }

    this.alertService.showAlert('success', 'Transfer successful!');

    this.router.navigate(['/employees']);
  }

}
