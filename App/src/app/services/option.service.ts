import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Option,
  OptionType,
  Stock,
  Exchange,
  OptionChain,
  OptionPair,
} from '../models/option.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OptionService {
  private apiUrl = 'http://localhost:8083/api/listings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getStockOptionsByDate(stockId: number, date: Date): Observable<Option[]> {
    const formattedDate = this.formatDateToYYYYMMDD(date);
    return this.http
      .get<Option[]>(`${this.apiUrl}/${stockId}/options/${formattedDate}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching options for date ${formattedDate}:`,
            error
          );
          return of([]);
        })
      );
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
