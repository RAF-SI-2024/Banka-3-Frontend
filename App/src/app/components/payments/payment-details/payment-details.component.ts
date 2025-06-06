import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentOverviewDto } from '../../../models/payment-overview-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import {PaginationComponent} from '../../shared/pagination/pagination.component';
import {InputTextComponent} from '../../shared/input-text/input-text.component';
import {ButtonComponent} from '../../shared/button/button.component';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, InputTextComponent, ButtonComponent],
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  payments: PaymentOverviewDto[] = [];
  pagedPayments: PaymentOverviewDto[] = [];
  filteredPayments: PaymentOverviewDto[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // Filter
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentStatus?: string;
  accountNumber?: string;
  cardNumber?: string;

  showAdditionalFilters: boolean = false;
  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getTransactions(
      this.currentPage - 1, // Page is 0-based in the backend
      this.pageSize,
      this.startDate,
      this.endDate,
      this.minAmount,
      this.maxAmount,
      this.paymentStatus,
      this.accountNumber,
      this.cardNumber
    ).subscribe({
      next: (response) => {
        // this.payments = response.content;
        // this.payments = response.content.filter(payment => !!payment.senderName); //Ovako je bilo bez prikazivanja trans
        this.payments = response.content;
        this.filteredPayments = [...this.payments];
        this.totalItems = response.totalElements;
        // this.updatePagedPayments();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load payments. Please try again later.');
        this.payments = [];
      }
    });
  }

  // updatePagedPayments(): void {
  //   const startIndex = (this.currentPage - 1) * this.pageSize;
  //   this.pagedPayments = this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
  // }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPayments();
  }

  // viewPaymentDetails(id: number) {
  //   alert(id);
  // }

  toggleFilters(): void {
    this.showAdditionalFilters = !this.showAdditionalFilters;
  }
}
