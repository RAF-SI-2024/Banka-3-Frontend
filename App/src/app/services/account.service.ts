import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NewBankAccount } from '../models/new-bank-account.model';
import { AccountResponse } from '../models/account-response.model';
import {
  ChangeAccountLimitDto,
  ChangeAccountNameDto
} from '../components/account/account-management/account-management.component';

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

  createForeignAccount(newAccount: NewBankAccount): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.apiUrl, newAccount, {
      headers: this.getAuthHeaders(),
    });
  }

  createCurrentAccount(newAccount: NewBankAccount): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.apiUrl, newAccount, {
      headers: this.getAuthHeaders(),
    });
  }

  getBankAccounts(page: number, size: number): Observable<{ content: AccountResponse[], totalElements: number }> {
    return this.http.get<{ content: AccountResponse[], totalElements: number }>(
      `${this.apiUrl}/bank`,
      {
        params: {
          page: page.toString(),
          size: size.toString()
        },
        headers: this.getAuthHeaders()
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
