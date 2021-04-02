import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductResponseModel } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private ServerUrl = environment.SERVER_URL;
  private products: ProductResponseModel[] = [];  

  constructor(private http: HttpClient) { }

  getSingleOrder(orderId: number) {
    return this.http.get<ProductResponseModel[]>(this.ServerUrl + '/orders/' + orderId).toPromise();
  }
}


