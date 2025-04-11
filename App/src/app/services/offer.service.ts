import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiveOfferDto } from '../models/active-offer.dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getActiveOffers(): Observable<ActiveOfferDto[]> {
    return this.http.get<ActiveOfferDto[]>(`${this.apiUrl}?status=ACTIVE`, {
      headers: this.getAuthHeaders()
    });
  }

  acceptOffer(offerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approve/${offerId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  declineOffer(offerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/decline/${offerId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
