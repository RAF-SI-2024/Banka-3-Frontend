import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {AlertService} from '../../services/alert.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {PortfolioService} from '../../services/portfolio.service';
import {SecuritiesTransaction} from '../../models/securities-transaction';

@Component({
  selector: 'app-tax-calculation',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './tax-calculation.component.html',
  standalone: true,
  styleUrl: './tax-calculation.component.css'
})
export class TaxCalculationComponent implements OnInit {

  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private portfolioService = inject(PortfolioService);

  securitiesTransactions: SecuritiesTransaction[] = [];
  filteredTransactions: SecuritiesTransaction[] = [];
  unpaidTaxes: SecuritiesTransaction[] = [];
  role: string = '';
  filterName: string = '';
  filterLastname: string = ''
  taxValue: number = 0;
  currentDate: Date = new Date();

  ngOnInit(): void {
    this.securitiesTransactions = this.portfolioService.getAllSecuritiesTransactions();
    this.filteredTransactions = this.securitiesTransactions;

    this.unpaidTaxes = this.securitiesTransactions.filter(transaction =>
      transaction.paidFlag.includes("No")
    );

    this.calculateTotalTax();
  }

  filterTransactions(): void {
    this.filteredTransactions = this.securitiesTransactions.filter(transaction =>
      transaction.name.toLowerCase().includes(this.filterName.toLowerCase()) &&
      transaction.role.toLowerCase().includes(this.role.toLowerCase()) &&
      transaction.lastname.toLowerCase().includes(this.filterLastname.toLowerCase())
    );
    this.unpaidTaxes = this.filteredTransactions.filter(transaction =>
      transaction.paidFlag.includes("No")
    );

    this.calculateTotalTax();
  }

  calculateTotalTax(): void {
    this.taxValue = this.unpaidTaxes.reduce((acc, transaction) => acc + transaction.tax, 0);
  }


  selectedPeriod: string = '';

  periods = [
    { label: 'Januar 2025', start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) },
    { label: 'FebruarY 2025', start: new Date(2025, 1, 1), end: new Date(2025, 1, 28) },
    { label: 'March 2025', start: new Date(2025, 2, 1), end: new Date(2025, 2, 31) },
    { label: 'April 2025', start: new Date(2025, 3, 1), end: new Date(2025, 3, 30) },
    { label: 'May 2025', start: new Date(2025, 4, 1), end: new Date(2025, 4, 31) }
  ];

  filterByPeriod(): void {
    if (!this.selectedPeriod) {
      this.unpaidTaxes = this.filteredTransactions;
      return;
    }

    const selected = this.periods.find(period => period.label === this.selectedPeriod);
    if (selected) {
      this.unpaidTaxes = this.filteredTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= selected.start && transactionDate <= selected.end;
      });
      this.calculateTotalTax();
    }
  }

  calculateTax(): void {
    alert('Sent to everyone: Tax calculated, value at ' + this.taxValue + ' RSD');
  }


}
