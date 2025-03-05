import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Payee } from '../models/payee.model';

@Injectable({
  providedIn: 'root'
})
export class PayeeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiURL = "http://localhost:8082/api/payees/client";
  private apiURL2 = "http://localhost:8082/api/payees";

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPayeesByClientId(): Observable<Payee[]> {
    return this.http.get<Payee[]>(this.apiURL, {
      headers: this.getAuthHeaders()
    });
  }


  createPayee(payee: Payee): Observable<any> {
    return this.http.post(this.apiURL2,
      { name: payee.name, accountNumber: payee.accountNumber },
      { headers: this.getAuthHeaders() }
    );
  }


  updatePayee(id: number, payee: Payee): Observable<string> {
    return this.http.put<string>(`${this.apiURL2}/${id}`,
      { name: payee.name, accountNumber: payee.accountNumber },
      { headers: this.getAuthHeaders() }
    );
  }

  deletePayee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL2}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

}
