import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { PaymentOverviewDto } from '../../models/payment-overview-dto';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TransactionListComponent implements OnInit {
  cardNumber: string = '';
  transactions: PaymentOverviewDto[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.cardNumber = this.route.snapshot.paramMap.get('cardNumber') || '';
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.isLoading = true;
    this.paymentService.getTransactions(this.cardNumber).subscribe({
      next: (data) => {
        this.transactions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoading = false;
      },
    });
  }

  viewDetails(transactionId: number) {
    this.router.navigate(['/transactions', transactionId]);
  }

  createNewTransaction() {
    this.router.navigate(['/card', this.cardNumber, 'transactions', 'new']);
  }
}
