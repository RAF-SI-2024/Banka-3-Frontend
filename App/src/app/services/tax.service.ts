import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaxData {
  totalTax: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getTaxData(userId: number): Observable<TaxData> {
    return this.http.get<TaxData>(`${this.baseUrl}/portfolio/tax/${userId}`);
  }

  calculateTax(taxCalculation: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment/tax`, taxCalculation);
  }
}
