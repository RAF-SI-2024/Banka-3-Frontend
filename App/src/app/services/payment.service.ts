import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Payment } from '../models/payment.model'

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payment'

  constructor(private http: HttpClient) {}

  createPayment(payment: Payment): Observable<any> {
    return this.http.post<any>(this.apiUrl, payment)
  }
}
