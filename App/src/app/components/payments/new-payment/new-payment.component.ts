import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreatePaymentDto } from '../../../models/create-payment-dto';
import { AlertService } from '../../../services/alert.service';
import { AccountResponse } from '../../../models/account-response.model';
import { AccountService } from '../../../services/account.service';
import {NgForOf, NgIf} from '@angular/common';
import { InputTextComponent } from '../../shared/input-text/input-text.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, InputTextComponent, ButtonComponent, NgIf]
})
export class NewPaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  accounts: AccountResponse[] = [];

  constructor(
    private paymentService: PaymentService,
    private accountService: AccountService,
    private router: Router,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
  }

  private initForm(): void {
    this.paymentForm = this.fb.group({
      senderAccountNumber: ['', Validators.required],
      receiverAccountNumber: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentCode: ['', Validators.required],
      purposeOfPayment: ['', Validators.required],
      referenceNumber: ['']
    });
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
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const payment: CreatePaymentDto = this.paymentForm.getRawValue();
    this.paymentService.createPayment(payment).subscribe({
      next: (response) => {
        this.alertService.showAlert('success', 'Payment created!');
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
        if (
          error.status === 400 &&
          error.error &&
          typeof error.error.message === 'string' &&
          error.error.message.includes('Cannot find receiver account')
        ) {
          // ako nije nasao acc
          this.alertService.showAlert('error', error.error.message);
        } else {
          this.alertService.showAlert('error', 'There has been an error: ' + error.message);
        }
      }
    });
  }
}
