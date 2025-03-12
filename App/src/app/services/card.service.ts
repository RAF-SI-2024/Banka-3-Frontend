import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthService } from './auth.service'

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
    return this.http.get<Card[]>(`${this.apiUrl}/${accountNumber}/cards`, { headers: this.getAuthHeaders() })
  }
  blockCard(accountNumber: string, cardNumber: string): Observable<any> {
    const url = `${this.apiUrl}/${accountNumber}/cards/${cardNumber}/block`
    return this.http.post(url, {}, { headers: this.getAuthHeaders() })
  }
  createCard(dto: CreateCardDto): Observable<any> {
    const url = `${this.apiUrl}/${dto.accountNumber}/cards/create`
    return this.http.post(url, dto, { headers: this.getAuthHeaders() })
  }
}
