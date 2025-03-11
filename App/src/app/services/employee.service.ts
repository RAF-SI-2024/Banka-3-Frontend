import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/admin/employees';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getEmployees(page: number, size: number, firstName?: string, lastName?: string, email?: string, position?: string) {
    let params = new HttpParams().set('page', page).set('size', size);

    if (firstName && firstName.trim() !== '') params = params.set('firstName', firstName.trim());
    if (lastName && lastName.trim() !== '') params = params.set('lastName', lastName.trim());
    if (email && email.trim() !== '') params = params.set('email', email.trim());
    if (position && position.trim() !== '') params = params.set('position', position.trim());

    return this.http.get<{ content: Employee[], totalElements: number }>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getEmployeeSelf(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() });
  }

  registerEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee, { headers: this.getAuthHeaders() });
  }

  updateEmployee(employeeId: number, updatedEmployee: Partial<Employee>): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/${employeeId}`, updatedEmployee, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  deactivateEmployee(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/deactivate`; // Construct URL with ID
    return this.http.patch<void>(url, null, { headers: this.getAuthHeaders() });
  }

  setEmployeeRole(employeeId: number, role: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${employeeId}/set-role`, { role }, { headers: this.getAuthHeaders() });
  }
}
