import { Component, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css',
})
export class LoansComponent implements OnInit {
  @Input() clientId: string = '';
  loans: Loan[] = [];
  filterText: string = '';
  selectedLoan: Loan | null = null;
  newCreditPopupVisible: boolean = false;
  newLoanForm: FormGroup;

  constructor(private loanService: LoanService, private fb: FormBuilder) {
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
  }

  loadClientLoans(): void {
    console.log('Client ID: ', this.clientId);
    this.loanService.getClientLoans(this.clientId).subscribe({
      next: (data) => {
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

  showLoanDetails(loan: Loan): void {
    if (loan.id) {
      this.loanService.getLoan(loan.id).subscribe({
        next: (data) => {
          this.selectedLoan = data;
        },
        error: (err) => {
          console.error('Error loading loan details:', err);
          this.selectedLoan = null;
        },
      });
    }
  }

  closeDetailsPopup(): void {
    this.selectedLoan = null;
  }

  openNewCreditPopup(): void {
    // this.newCreditPopupVisible = true;
  }

  closeNewCreditPopup(): void {
    this.newCreditPopupVisible = false;
    this.newLoanForm.reset();
  }

  submitNewCreditApplication(): void {
    // if (this.newLoanForm.invalid) {
    //   alert('Please fill all required fields with valid values');
    //   return;
    // }
    // const loanApplication = {
    //   ...this.newLoanForm.value,
    //   clientId: parseInt(this.clientId)
    // };
    // // Add logic to submit the application through your service
    // console.log('Submitting loan application:', loanApplication);
    // // Close the popup after submission
    // this.closeNewCreditPopup();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
}
