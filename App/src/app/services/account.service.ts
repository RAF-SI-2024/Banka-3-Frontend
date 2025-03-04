// src/app/services/account.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { Account } from '../models/account.model';
import { NewBankAccount } from '../models/new-bank-account.model';
import { AccountDetails } from '../models/account-details.model';


interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8082/api/account';

  constructor(private httpClient: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Existing methods for creating accounts
  createForeignAccount(accountData: Account): Observable<any> {
    return this.httpClient.post(this.apiUrl, accountData, { headers: this.getAuthHeaders() });
  }

  createCurrentAccount(newAccount: NewBankAccount): Observable<void> {
    return this.httpClient.post<void>(this.apiUrl, newAccount, {
      headers: this.getAuthHeaders(),
    });
  }

  getAccountDetails(accountNumber: string): Observable<AccountDetails> {
    const url = `${this.apiUrl}?accountNumber=${accountNumber}&page=0&size=1`;
    return this.httpClient.get<PaginatedResponse<AccountDetails>>(url, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        if (response.content && response.content.length > 0) {
          return response.content[0];
        }
        throw new Error('Account not found.');
      })
    );
  }
}
