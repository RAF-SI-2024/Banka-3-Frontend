import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private mockAccounts: Account[] = [
    { id: 1, name: 'Dinarski račun', number: '123456789012345678', availableBalance: 120000, active: true },
    { id: 2, name: 'Devizni račun (EUR)', number: '987654321098765432', availableBalance: 800, active: true },
    { id: 3, name: 'Neaktivan račun', number: '111111111111111111', availableBalance: 99999, active: false },
  ];

  private mockTransactions: Transaction[] = [
    { id: 101, date: new Date('2023-03-01'), amount: 50000, type: 'inflow', description: 'Plata' },
    { id: 102, date: new Date('2023-03-02'), amount: -1200, type: 'outflow', description: 'Kupovina namirnica' },
    { id: 103, date: new Date('2023-03-04'), amount: -2000, type: 'outflow', description: 'Račun za struju' },
    { id: 104, date: new Date('2023-03-05'), amount: -300, type: 'outflow', description: 'Kupovina goriva' },
  ];

  constructor() { }

  getUserAccounts(): Observable<Account[]> {
    
    const activeAccounts = this.mockAccounts
      .filter(acc => acc.active)
      .sort((a, b) => b.availableBalance - a.availableBalance);
    return of(activeAccounts);
  }

  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    
    return of(this.mockTransactions);
  }
}
