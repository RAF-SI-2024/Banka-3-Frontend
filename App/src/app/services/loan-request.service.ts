import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanRequest, LoanRequestStatus } from '../models/loan-request.model';
import { AuthService } from './auth.service';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class LoanRequestService {
  private apiUrl = 'http://localhost:8080/loan-requests';
  private accountsUrl = 'http://localhost:8080/api/account';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  submitLoanRequest(request: LoanRequest): Observable<LoanRequest> {
    return this.http.post<LoanRequest>(this.apiUrl, request, {
      headers: this.getAuthHeaders(),
    });
  }

  getLoanRequestsByStatus(status: LoanRequestStatus): Observable<LoanRequest[]> {
    return this.http.get<LoanRequest[]>(`${this.apiUrl}/status/${status}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getUserAccounts(): Observable<{ accountNumber: string; currencyCode: string }[]> {
    return this.http.get<{ accountNumber: string; currencyCode: string }[]>(this.accountsUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  getAvailableCurrencies(): Currency[] {
    return [
      { code: 'RSD', name: 'Serbian Dinar', symbol: 'RSD', country: ['Serbia'], description: 'Serbian Dinar', isActive: true },
      { code: 'EUR', name: 'Euro', symbol: '€', country: ['Germany', 'Slovenia', 'Other EU'], description: 'Euro', isActive: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', country: ['USA'], description: 'US Dollar', isActive: true },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: ['Switzerland'], description: 'Swiss Franc', isActive: true },
    ];
  }
}
