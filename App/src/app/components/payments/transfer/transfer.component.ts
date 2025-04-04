import {Component, inject, OnInit} from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {AlertService} from '../../../services/alert.service';
import {AccountResponse} from '../../../models/account-response.model';
import {PaymentService} from '../../../services/payment.service';
import {TransferDto} from '../../../models/transfer.model';
import {InputTextComponent} from '../../shared/input-text/input-text.component';
import {ButtonComponent} from '../../shared/button/button.component';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    ButtonComponent,
    InputTextComponent,
  ],
  standalone: true,
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {

  private accountService = inject(AccountService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  accounts: AccountResponse[] = [];
  selectedFromAccountNumber: string | null = null;
  selectedToAccountNumber: string | null = null;
  transferAmount: number | null = null;
  isLoading = false;


  ngOnInit(): void {
    this.accountService.getMyAccountsRegular().subscribe({
      next: (response) => {
        this.accounts = response;
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

  private validateForm(): boolean {
    if (!this.selectedFromAccountNumber || !this.selectedToAccountNumber || !this.transferAmount) {
      this.showErrorAlert('Please fill in all fields');
      return false;
    }

    if (this.selectedFromAccountNumber === this.selectedToAccountNumber) {
      this.showErrorAlert('Sender and receiver accounts must be different');
      return false;
    }

    if (this.transferAmount <= 0) {
      this.showErrorAlert('Amount must be greater than zero');
      return false;
    }

    if (this.selectedFromAccount?.availableBalance! < this.transferAmount) {
      this.showErrorAlert('Insufficient funds');
      return false;
    }

    return true;
  }
  private showErrorAlert(message: string): void {
    this.alertService.showAlert('error', message);
  }
  private handleTransferSuccess(): void {
    this.router.navigate(['/success'], {
      state: {
        title: 'Transfer Initiated!',
        message: 'Your transfer is pending confirmation. You\'ll receive a notification once it\'s completed.',
        buttonName: 'View Payment Details',
        continuePath: '/payment-details'
      }
    }).then(_=> {});
  }

  private handleTransferError(err: Error): void {
    const serverMessage = err.message;
    let userMessage = serverMessage;

    // spec erori spec pisanje
    const errorMappings: { [key: string]: string } = {
      'Currency mismatch': 'Accounts must have the same currency',
      'Insufficient funds': 'Not enough balance in sender account',
      'Account not found': 'One of the accounts does not exist'
    };

    Object.keys(errorMappings).forEach(key => {
      if (serverMessage.includes(key)) {
        userMessage = errorMappings[key];
      }
    });

    this.showErrorAlert(userMessage);
    this.isLoading = false;
  }
  onContinue(): void {
    if (!this.validateForm()) return;

    const transferDto: TransferDto = {
      senderAccountNumber: this.selectedFromAccountNumber!,
      receiverAccountNumber: this.selectedToAccountNumber!,
      amount: this.transferAmount!
    };

    this.isLoading = true;

    this.paymentService.transfer(transferDto).subscribe({
      next: () => this.handleTransferSuccess(),
      error: (err) => this.handleTransferError(err),
      complete: () => this.isLoading = false
    });
  }

}
