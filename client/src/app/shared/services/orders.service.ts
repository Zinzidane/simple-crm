import { Injectable } from "@angular/core";
import { HttpClient } from "selenium-webdriver/http";
import { Order } from "../interfaces";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private http: HttpClient) {}

  create(order: Order): Observable<Order> {
    return this.http.post<Order>('/api/order', order);
  }
}
