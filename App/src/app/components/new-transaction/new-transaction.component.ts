import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { CreatePaymentDto } from '../../models/create-payment-dto';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent, ButtonComponent],
})
export class NewTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  cardNumber: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.cardNumber = this.route.snapshot.paramMap.get('cardNumber') || '';

    this.transactionForm = this.fb.group({
      senderAccountNumber: [this.cardNumber, Validators.required],
      receiverAccountNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentCode: ['TRANSFER', Validators.required],
      purposeOfPayment: ['', Validators.required],
      referenceNumber: [''],
    });
  }

  onSubmit() {
    if (this.transactionForm.invalid) {
      return;
    }
    this.isSubmitting = true;

    const dto: CreatePaymentDto = this.transactionForm.value;
    this.paymentService.createPayment(dto).subscribe({
      next: (res) => {
        // const createdId = res.id;//TODO Ne moze ovo jer ne vraca id!
        // this.router.navigate(['/transactions', createdId], {
        //   queryParams: { confirm: 'true' },
        // });
      },
      error: (err) => {
        console.error('Error creating payment:', err);
        this.isSubmitting = false;
      },
    });
  }
}
