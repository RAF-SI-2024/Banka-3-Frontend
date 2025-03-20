import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthorizedPersonnel, CreateAuthorizedPersonnel } from '../models/authorized-personnel.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorizedPersonnelService {
  private apiUrl = 'http://localhost:8080/api/authorized-personnel';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createAuthorizedPersonnel(personnelData: CreateAuthorizedPersonnel): Observable<AuthorizedPersonnel> {
    return this.http.post<AuthorizedPersonnel>(this.apiUrl, personnelData, {
      headers: this.getAuthHeaders()
    });
  }

  getByCompany(companyId: number): Observable<AuthorizedPersonnel[]> {
    return this.http.get<AuthorizedPersonnel[]>(`${this.apiUrl}/company/${companyId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<AuthorizedPersonnel> {
    return this.http.get<AuthorizedPersonnel>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateAuthorizedPersonnel(id: number, updateData: CreateAuthorizedPersonnel): Observable<AuthorizedPersonnel> {
    return this.http.put<AuthorizedPersonnel>(`${this.apiUrl}/${id}`, updateData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAuthorizedPersonnel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
