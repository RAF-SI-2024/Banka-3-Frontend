import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Payee } from '../models/payee.model';

@Injectable({
  providedIn: 'root'
})
export class PayeeService {
  private apiURL = "http://localhost:8082/api/payees";

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPayeesByClientId(): Observable<Payee[]> {
    return this.http.get<Payee[]>(`${this.apiURL}/client`, {
      headers: this.getAuthHeaders()
    });
  }

  createPayee(payee: Payee): Observable<string> {
    return this.http.post<string>(this.apiURL, payee, {
      headers: this.getAuthHeaders()
    });
  }

  updatePayee(id: number, payee: Payee): Observable<string> {
    return this.http.put<string>(`${this.apiURL}/${id}`, payee, {
      headers: this.getAuthHeaders()
    });
  }

  deletePayee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
