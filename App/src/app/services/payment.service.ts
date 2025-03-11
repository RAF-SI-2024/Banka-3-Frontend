import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaymentOverviewDto } from '../models/payment-overview-dto';
import { PaymentDetailsDto } from '../models/payment-details-dto';
import { CreatePaymentDto } from '../models/create-payment-dto';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payment';

  constructor(private http: HttpClient) {}

  getTransactions(cardNumber?: string): Observable<PaymentOverviewDto[]> {
    let url = this.baseUrl;
    if (cardNumber) {
      url += `?cardNumber=${cardNumber}`;
    }
    return this.http.get<PaymentOverviewDto[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getTransactionDetails(id: number): Observable<PaymentDetailsDto> {
    return this.http.get<PaymentDetailsDto>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPayment(dto: CreatePaymentDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  confirmPayment(paymentId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/confirm-payment/${paymentId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
