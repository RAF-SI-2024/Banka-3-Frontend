import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Loan } from '../models/loan-dto.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private apiUrl = 'http://localhost:8082/api/loans';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Get all loans for a specific client
  getClientLoans(
    clientId: string
  ): Observable<{ content: Loan[]; totalElements: number }> {
    return this.http.get<{ content: Loan[]; totalElements: number }>(
      `${this.apiUrl}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Get a specific loan by ID
  getLoan(loanId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${loanId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Apply for a new loan
  applyForLoan(loanApplication: any): Observable<any> {
    return this.http.post(this.apiUrl, loanApplication, {
      headers: this.getAuthHeaders(),
    });
  }

  // Approve a loan application (for employees/admins)
  approveLoan(loanId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${loanId}/approve`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Reject a loan application (for employees/admins)
  rejectLoan(loanId: string, reason: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${loanId}/reject`,
      { reason },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Get loan payment history
  getLoanPayments(loanId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${loanId}/payments`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Make a payment for a loan
  makePayment(loanId: string, paymentDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${loanId}/payments`, paymentDetails, {
      headers: this.getAuthHeaders(),
    });
  }

  // Calculate loan details (interest, monthly payments, etc.)
  calculateLoan(
    amount: number,
    term: number,
    interestRate: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('term', term.toString())
      .set('interestRate', interestRate.toString());

    return this.http.get(`${this.apiUrl}/calculate`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }
}
