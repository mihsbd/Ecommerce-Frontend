import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs';
import { ProductModelServer } from '../models/product.model';
import { ServerResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private ServerUrl = environment.SERVER_URL;

  constructor(private http: HttpClient) { }

  /* This is to fetch all products from the backend api server */
  getAllProducts(numberOfResults = 10) : Observable<ServerResponse> {
    return this.http.get<ServerResponse>(this.ServerUrl + '/products', {
      params: { limit: numberOfResults.toString() }
    });
  }

  /* Get Single product from Server */
  getSingleProduct(id: number) : Observable<ProductModelServer> {
    return this.http.get<ProductModelServer>(this.ServerUrl + '/products/' + id);
  }

  /* Get products from One Category */
  getProductsByCategory(catName: string) : Observable<ProductModelServer[]> {
    return this.http.get<ProductModelServer[]>(this.ServerUrl + '/products/category/' + catName);
  }

}
