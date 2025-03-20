import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { FormsModule } from '@angular/forms';
import { CreatePaymentDto } from '../../models/create-payment-dto';
import { AlertService } from '../../services/alert.service';
import {AccountResponse} from '../../models/account-response.model';
import {AccountService} from '../../services/account.service';
import {NgForOf} from '@angular/common';
import {SelectComponent} from '../shared/select/select.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.component.html',
  standalone: true,
  imports: [FormsModule, NgForOf, SelectComponent, InputTextComponent, ButtonComponent],
  styleUrls: ['./new-payment.component.css']
})
export class NewPaymentComponent {
  payment: CreatePaymentDto = {
    senderAccountNumber: '',
    receiverAccountNumber: '',
    amount: 0,
    paymentCode: '',
    purposeOfPayment: '',
    referenceNumber: ''
  };
  accounts: AccountResponse[] = [];

  constructor(
    private paymentService: PaymentService,
    private accountService: AccountService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getMyAccountsRegular().subscribe({
      next: (response) => {
        this.accounts = response;
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load accounts. Please try again later.');
      }
    });
  }

  onSubmit(): void {
    this.paymentService.createPayment(this.payment).subscribe({
      next: (response) => {
        this.alertService.showAlert('success', 'Payment created!');
        // this.router.navigate(['/payment-details']);
        this.router.navigate(['/success'], {
          state: {
            title: 'Payment Created!',
            message: 'Your payment has been successfully processed.',
            buttonName: 'View Payments',
            continuePath: '/payment-details'
          }
        });

      },
      error: (error) => {
        this.alertService.showAlert('error', 'There has been an error: ' + error.message);
      }
    });
    // this.paymentService.createPayment(this.payment).subscribe({
    //   next: () => {
    //     alert('Plaćanje je kreirano')
    //     this.router.navigate(['/transaction-overview'])
    //   },
    //   error: () => {
    //     alert('Došlo je do greške')
    //   }
    // })
  }
}
