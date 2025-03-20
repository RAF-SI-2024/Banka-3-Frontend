import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan-dto.model';
import { Installment } from '../../models/installment-model';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './loan-details.component.html',
  styleUrl: './loan-details.component.css',
})
export class LoanDetailsComponent implements OnInit {
  loan: Loan | null = null;
  installments: Installment[] = [];
  showInstallments: boolean = false; // To toggle visibility

  private route = inject(ActivatedRoute);
  private loanService = inject(LoanService);
  private router = inject(Router);

  ngOnInit(): void {
    const loanId = this.route.snapshot.paramMap.get('loanId');
    if (loanId) {
      this.loadLoanDetails(parseInt(loanId, 10));
    }
  }

  loadLoanDetails(loanId: number): void {
    this.loanService.getLoan(loanId).subscribe({
      next: (data) => {
        this.loan = data;
      },
      error: (err) => {
        console.error('Error loading loan details:', err);
        this.loan = null;
      },
    });
  }

  loadInstallments(): void {
    if (!this.loan) return;

    this.loanService.getLoanInstallments(this.loan.id).subscribe({
      next: (data) => {
        this.installments =  data;
        this.showInstallments = true;
      },
      error: (err) => {
        console.error('Error loading loan installments:', err);
        this.installments = [];
      },
    });
  }

  toggleInstallments(): void {
    if (!this.showInstallments) {
      this.loadInstallments();
    } else {
      this.showInstallments = false;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getLoanStatusClass(status?: string): string {
    if (!status) return '';

    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'DEFAULTED': return 'status-defaulted';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  goBack(): void {
    this.router.navigate([`/loan-management/${this.loan?.id}`]); //todo treba clientId sad radi slucajno
  }
}
