import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentOverviewDto } from '../models/payment-overview-dto';
import { PaymentDetailsDto } from '../models/payment-details-dto';
import { CreatePaymentDto } from '../models/create-payment-dto';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  getTransactions(cardNumber?: string): Observable<PaymentOverviewDto[]> {
    let url = this.baseUrl;
    if (cardNumber) {
      url += `?cardNumber=${cardNumber}`;
    }
    return this.http.get<PaymentOverviewDto[]>(url);
  }

  getTransactionDetails(id: number): Observable<PaymentDetailsDto> {
    return this.http.get<PaymentDetailsDto>(`${this.baseUrl}/${id}`);
  }

  createPayment(dto: CreatePaymentDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}`, dto);
  }

  confirmPayment(paymentId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/confirm-payment/${paymentId}`, {});
  }
}
