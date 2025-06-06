import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map, Observable, take} from 'rxjs';
import {Order, PageResponse} from '../models/order.model';
import { AuthService } from './auth.service';
import {CreateOrderDto} from '../models/create-order.dto';
import {OrderDto} from '../models/order.dto';
import {environment} from '../environments/environment';
import {OrderRealDto} from '../models/order-real-dto';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  // Ako koristiš environment varijablu, ovde se može postaviti npr. environment.apiUrl + '/api/orders'
  private baseUrl = `${environment.stockUrl}/api/orders`;

  //
 // private testUrl = "localhost:8083/api/orders";

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Metoda koja vraća potrebne HTTP zaglavlja sa JWT tokenom
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // pretpostavljamo da AuthService ima metodu getToken()
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getOrders(status: string, currentPage: number = 0, pageSize: number = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(`${this.baseUrl}?page=${currentPage}&size=${pageSize}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      take(1),
      map((response) => {
        if (status && status !== 'ALL') {
          return {
            ...response,
            content: response.content.filter(order => order.status === status)
          };
        }
        return response;
      })
    );
  }

  createOrder(orderData: CreateOrderDto): Observable<OrderDto> {
    const headers = this.getAuthHeaders().set('Content-Type', 'application/json');

    const payload: any = {
      ...orderData,
      limitPrice: orderData.limitValue !== undefined && orderData.limitValue !== null ? orderData.limitValue : null,
      stopPrice: orderData.stopValue !== undefined && orderData.stopValue !== null ? orderData.stopValue : null
    };

    delete payload.limitValue;
    delete payload.stopValue;

    return this.http.post<OrderDto>(`${this.baseUrl}`, payload, { headers });
  }

  approveOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/approve/${orderId}`, {}, { headers: this.getAuthHeaders() });
  }

  declineOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/decline/${orderId}`, {}, { headers: this.getAuthHeaders() });
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/cancel/${orderId}`,{}, { headers: this.getAuthHeaders() });
  }

  getOrdersByUser(id: number): Observable<OrderRealDto[]> {
    return this.http.get<OrderRealDto[]>(`${this.baseUrl}/${id}`, {headers: this.getAuthHeaders()})
  }

}
