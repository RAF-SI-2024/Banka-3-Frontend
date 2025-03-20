import {Component, Input, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan-dto.model';
import { Router } from '@angular/router';
import { LoanRequestService } from '../../services/loan-request.service';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputTextComponent, ButtonComponent],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css',
})
export class LoansComponent implements OnInit {
  @Input() clientId: string = '';
  loans: Loan[] = [];
  loanRequests: Loan[] = [];
  filterText: string = '';
  selectedLoan: Loan | null = null;
  newLoanForm: FormGroup;

  constructor(private loanService: LoanService, private loanRequestService: LoanRequestService, private fb: FormBuilder, private router: Router) {
    this.newLoanForm = this.fb.group({
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      repaymentPeriod: [0, [Validators.required, Validators.min(1)]],
      currencyCode: ['', Validators.required],
      purpose: [''],
    });
  }

  ngOnInit(): void {
    if (this.clientId) {
      this.loadClientLoans();
    }
    this.loadLoanRequests();
  }

  loadClientLoans(): void {
    this.loanService.getClientLoans(this.clientId).subscribe({
      next: (data) => {
        this.loans = data.content.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        if (data.content.length > 0) {
            this.loans = data.content.sort((a, b) =>
            (b.amount || 0) - (a.amount || 0)
            );
        }
        console.log('Loans: ', this.loans);
      },
      error: (err) => {
        console.error('Error loading client loans:', err);
        this.loans = [];
      },
    });
  }

  loadLoanRequests(): void {
    this.loanRequestService.getClientLoanRequests().subscribe({
      next: (data) => {
        this.loanRequests = data.content;
      },
      error: (err) => {
        console.error('Error loading loan requests:', err);
        this.loanRequests = [];
      },
    });
  }

  get filteredLoans(): Loan[] {
    if (!this.filterText) return this.loans;

    const searchTerm = this.filterText.toLowerCase();
    return this.loans.filter(
      (loan) =>
        loan.loanNumber?.toLowerCase().includes(searchTerm) ||
        loan.type?.toString().toLowerCase().includes(searchTerm) ||
        loan.status?.toString().toLowerCase().includes(searchTerm) ||
        loan.amount?.toString().includes(searchTerm)
    );
  }

  get filteredLoanRequests(): Loan[] {
    if (!this.filterText) return this.loanRequests;

    const searchTerm = this.filterText.toLowerCase();
    return this.loanRequests.filter(
      (request) =>
        request.type?.toString().toLowerCase().includes(searchTerm) ||
        request.status?.toString().toLowerCase().includes(searchTerm) ||
        request.amount?.toString().includes(searchTerm)
    );
  }


  getLoanStatusClass(status?: string): string {
    if (!status) return '';

    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'PAID':
        return 'status-paid';
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'DEFAULTED':
        return 'status-defaulted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  openNewCredit(): void {
    this.router.navigate(['/loan-request']);
  }

  showLoanDetails(loan: Loan): void {
    if (loan.id) {
      this.router.navigate(['/loan-details', loan.id]);
    }
  }

}
