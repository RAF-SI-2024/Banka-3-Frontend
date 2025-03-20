import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthService } from './auth.service'
import { PaymentOverviewDto } from '../models/payment-overview-dto';

export interface Card {
  cardNumber: string
  status: string
  owner: {
    firstName: string
    lastName: string
    email: string
  }
}

export interface CreateCardDto {
  accountNumber: string
  type: string
  name: string
  cardLimit: number
  authorizedPersonId?: number
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:8082/api/account'
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken()
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  }

  getCardsByAccount(accountNumber: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/${accountNumber}/cards`, {headers: this.getAuthHeaders()})
  }

  getTransactions(cardNumber?: string): Observable<PaymentOverviewDto[]> {
    let url = this.apiUrl;
    if (cardNumber) {
      url += `?cardNumber=${cardNumber}`;
    }
    return this.http.get<PaymentOverviewDto[]>(url)
  }

  getMyCardsForAccount(accountNumber: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/${accountNumber}/cards/my-cards`, { headers: this.getAuthHeaders() })
  }
  //pravilno za karte po acc
  getUserCardsForAccount(accountNumber: string): Observable<Card[]> {
    const url = `${this.apiUrl}/${accountNumber}/cards/my-account-cards`;
    return this.http.get<Card[]>(url, { headers: this.getAuthHeaders() });
  }


  blockCard(accountNumber: string, cardNumber: string): Observable<any> {
    const url = `${this.apiUrl}/${accountNumber}/cards/${cardNumber}/block-by-user` //ako je juzer, a samo /block je ako je admin todo
    return this.http.post(url, {}, { headers: this.getAuthHeaders() })
  }

  createCard(dto: CreateCardDto): Observable<any> {
    const url = `${this.apiUrl}/${dto.accountNumber}/cards/create`
    return this.http.post(url, dto, { headers: this.getAuthHeaders() })
  }

  requestCard(dto: CreateCardDto): Observable<any> {
    const url = `${this.apiUrl}/${dto.accountNumber}/cards/request`
    return this.http.post(url, dto, { headers: this.getAuthHeaders() })
  }
}
