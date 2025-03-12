import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Exchange} from '../models/exchange';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiURL = "http://localhost:8082/api/exchange-rates";
  private apiURL2 = "http://localhost:8082/api/exchange-rates/convert";

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getExchageRateList(): Observable<Exchange[]> {
    return this.http.get<Exchange[]>(this.apiURL, {
      headers: this.getAuthHeaders()
    });
  }

  getExchageFromToAmount(fromCurrencyCode: string, toCurrencyCode: string, amount: number): Observable<number> {
    return this.http.post<number>(this.apiURL2,
      { fromCurrencyCode: fromCurrencyCode,  toCurrencyCode: toCurrencyCode , amount: amount},
      { headers: this.getAuthHeaders() }
    );
  }


}
