import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountPageDto } from '../models/account-page-dto.model';
import { CardDto } from '../models/card-dto.model';


@Injectable({
  providedIn: 'root'
})
export class AccountManagementService {

  private baseUrl = 'http://localhost:8080/api/account'; 

  constructor(private http: HttpClient) {}

  getAccounts(accountNumber?: string, ownerName?: string): Observable<AccountPageDto> {
    let params = new HttpParams();
    if (accountNumber) {
      params = params.set('accountNumber', accountNumber);
    }
    if (ownerName) {
      params = params.set('lastName', ownerName);
    }
    return this.http.get<AccountPageDto>(this.baseUrl, { params });
  }

  getCards(accountNumber: string): Observable<CardDto[]> {
    return this.http.get<CardDto[]>(`${this.baseUrl}/${accountNumber}/cards`);
  }

  postCardAction(accountNumber: string, cardNumber: string, action: 'block' | 'unblock' | 'deactivate'): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${accountNumber}/cards/${cardNumber}/${action}`, {});
  }
}
