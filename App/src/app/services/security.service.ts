import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Security } from '../models/security.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private apiUrl = 'http://localhost:8083/api/listings';
  private authService = inject(AuthService);

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSecurities(securityType: string = 'All'): Observable<Security[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      map(listings => listings.map(listing => this.mapListingToSecurity(listing))),
      map(securities => {
        if (securityType === 'All') {
          return securities;
        } else {
          return securities.filter(security => security.type === securityType);
        }
      })
    );
  }

  getSecurityById(id: number): Observable<Security | undefined> {
    return this.getSecurities().pipe(
      map(securities => securities.find(security => security.id === id))
    );
  }

  private mapListingToSecurity(listing: any): Security {
    let securityType: 'Stock' | 'Future' | 'Forex' = 'Stock';
    if (listing.listingType === 'STOCK') {
      securityType = 'Stock';
    } else if (listing.listingType === 'FUTURES') {
      securityType = 'Future';
    } else if (listing.listingType === 'FOREX') {
      securityType = 'Forex';
    }

    let security: Security = {
      id: listing.id,
      ticker: listing.ticker,
      price: listing.price,
      change: listing.change,
      volume: listing.volume,
      initialMarginCost: listing.initialMarginCost,
      maintenanceMargin: listing.initialMarginCost / 1.1,
      type: securityType,
      settlementDate: listing.settlementDate
    };

    return security;
  }
}