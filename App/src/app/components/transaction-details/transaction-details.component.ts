import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { PaymentDetailsDto } from '../../models/payment-details-dto';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonComponent],
})
export class TransactionDetailsComponent implements OnInit {
  transactionId!: number;
  transaction: PaymentDetailsDto | null = null;
  isConfirmMode: boolean = false;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.transactionId = +(
      this.route.snapshot.paramMap.get('transactionId') || '0'
    );
    // confirm=true?
    this.isConfirmMode =
      this.route.snapshot.queryParamMap.get('confirm') === 'true';

    this.fetchTransactionDetails();
  }

  fetchTransactionDetails() {
    this.isLoading = true;
    this.paymentService.getTransactionDetails(this.transactionId).subscribe({
      next: (data) => {
        this.transaction = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transaction details:', err);
        this.isLoading = false;
      },
    });
  }

  onConfirm() {
    // Poziv confirmPayment
    this.paymentService.confirmPayment(this.transactionId).subscribe({
      next: () => {
        this.router.navigate(['/success']);
      },
      error: (err) => {
        console.error('Error confirming payment:', err);
      },
    });
  }

  onCancel() {
    if (this.transaction?.cardNumber) {
      this.router.navigate([
        '/card',
        this.transaction.cardNumber,
        'transactions',
      ]);
    } else {
      this.router.navigate(['/']);
    }
  }

  onOk() {
    if (this.transaction?.cardNumber) {
      this.router.navigate([
        '/card',
        this.transaction.cardNumber,
        'transactions',
      ]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
