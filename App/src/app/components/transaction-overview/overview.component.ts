import { Component, OnInit } from '@angular/core';
import {AccountService} from '../../services/account.service';
import {Transactions} from '../../models/transactions';

@Component({
  selector: 'app-transaction-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  transaction: Transactions | null = null;
  accountNo: string = '123456789'; // Primer, može se menjati dinamički

  constructor(private transactionService: AccountService) {}

  ngOnInit(): void {
    this.loadTransaction();
  }

  loadTransaction(): void {
    this.transactionService.getTransactions(this.accountNo).subscribe({
      next: (data) => (this.transaction = data),
      error: (err) => console.error('Error loading transaction:', err)
    });
  }

  openDetails(): void {
    document.getElementById('transactionDetails')!.style.display = 'block';
  }

  closeDetails(): void {
    document.getElementById('transactionDetails')!.style.display = 'none';
  }
}

