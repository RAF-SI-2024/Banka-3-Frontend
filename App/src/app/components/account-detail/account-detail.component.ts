import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountDetails } from '../../models/account-details.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css']
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);

  accountNumber: string | null = null;
  account: AccountDetails | null = null;
  errorMessage: string | null = null;

  showRenamePopup = false;
  newAccountName = '';

  ngOnInit(): void {
    this.accountNumber = this.route.snapshot.paramMap.get('accountNumber');
    if (!this.accountNumber) {
      this.errorMessage = 'No account number provided.';
      return;
    }

    this.accountService.getAccountDetails(this.accountNumber).subscribe({
      next: (acc) => {
        this.account = acc;
      },
      error: (err) => {
        console.error('Error fetching account details:', err);
        this.errorMessage = 'Failed to load account details.';
      },
    });
  }

  openRenamePopup(): void {
    if (this.account) {
      this.newAccountName = '';
      this.showRenamePopup = true;
      this.errorMessage = null;
    }
  }

  closeRenamePopup(): void {
    this.showRenamePopup = false;
    this.errorMessage = null;
  }

  confirmRename(): void {
    this.errorMessage = 'Rename feature not implemented in backend.';
  }

  newPayment(): void {
    this.router.navigate(['/payments/new'], { queryParams: { account: this.accountNumber } });
  }

  changeLimit(): void {
    this.router.navigate(['/accounts', this.accountNumber, 'change-limit']);
  }
}
