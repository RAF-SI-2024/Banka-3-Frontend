import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Account } from '../models/account.model';
import { NewBankAccount } from '../models/new-bank-account.model';
import { Employee } from '../models/employee.model';
import { AccountResponse } from '../models/account-response.model';
import {AccountTransfer} from '../models/account-transfer';
import {
  ChangeAccountLimitDto,
  ChangeAccountNameDto
} from '../components/account-management/account-management.component';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8082/api/account';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // admin or employee
  getAccountsForClient(clientId: string | number | null, page: number = 0, size: number = 10): Observable<{
    content: AccountResponse[]
  }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ content: AccountResponse[] }>(
      `${this.apiUrl}/${clientId}?page=${page}&size=${size}`,
      { headers }
    );
  }

  // client - getMyAccounts
  getMyAccountsRegular(): Observable<AccountResponse[]> {
    const headers = this.getAuthHeaders().set('Accept', '*/*');
    return this.http.get<AccountResponse[]>(`${this.apiUrl}`, { headers });
  }

  getAccountDetails(accountNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details/${accountNumber}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createForeignAccount(accountData: Account): Observable<any> {
    return this.http.post(this.apiUrl, accountData, {
      headers: this.getAuthHeaders(),
    });
  }

  createCurrentAccount(newAccount: NewBankAccount): Observable<void> {
    return this.http.post<void>(this.apiUrl, newAccount, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllAccounts(
    page: number = 0,
    size: number = 100
  ): Observable<{ content: AccountResponse[]; totalElements: number }> {
    let params = new HttpParams().set('page', page).set('size', size);
    const headers = this.getAuthHeaders();

    return this.http.get<{ content: AccountResponse[]; totalElements: number }>(
      this.apiUrl,
      {
        headers,
        params,
      }
    );
  }

  changeAccountName(accountNumber: string, newName: string): Observable<void> {
    const payload: ChangeAccountNameDto = { newName };
    return this.http.put<void>(`${this.apiUrl}/${accountNumber}/change-name`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  changeAccountLimit(accountNumber: string, newLimit: number): Observable<void> {
    const payload: ChangeAccountLimitDto = { newLimit };
    return this.http.put<void>(`${this.apiUrl}/${accountNumber}/request-change-limit`, payload, {
      headers: this.getAuthHeaders(),
    });
  }
}
