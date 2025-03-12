import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Account } from '../models/account.model';
import { NewBankAccount } from '../models/new-bank-account.model';
import { Employee } from '../models/employee.model';
import { AccountResponse } from '../models/account-response.model';
import {AccountTransfer} from '../models/account-transfer';

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

  getAccountsForClient(clientId: string, page: number = 0, size: number = 10): Observable<{ content: AccountResponse[] }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ content: AccountResponse[] }>(
      `${this.apiUrl}/${clientId}?page=${page}&size=${size}`,
      { headers }
    );
  }

  // jer postoji getmyacc samo sa acctransf
  // getMyAccountsRegular(){
  //   const headers = this.getAuthHeaders().set('Accept', '*/*');
  //   return this.http.get<{ content: AccountResponse[]}>(`${this.apiUrl}`, {headers});
  // }

  // jer postoji getmyacc samo sa acctransf
  getMyAccountsRegular(): Observable<AccountResponse[]> {
    const headers = this.getAuthHeaders().set('Accept', '*/*');
    return this.http.get<AccountResponse[]>(`${this.apiUrl}`, { headers });
  }

  getAccount(accountNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${accountNumber}`, {
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
    page: number,
    size: number
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
}
