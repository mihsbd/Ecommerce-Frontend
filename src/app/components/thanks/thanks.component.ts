import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductResponseModel } from 'src/app/models/product.model';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.component.html',
  styleUrls: ['./thanks.component.scss']
})
export class ThanksComponent implements OnInit {

  message: string;
  orderId: number;
  products: ProductResponseModel[] = [];
  cartTotal: number;

  constructor(private router: Router,
              private orderService: OrderService) {
    
    const navigation = this.router.getCurrentNavigation();
    
    const state = navigation?.extras.state as {
      message: string,
      orderId: number,
      products: ProductResponseModel[],      
      total: number
    };

    this.message = state.message;
    this.orderId = state.orderId;
    console.log(this.orderId);
    this.products = state.products;
    console.log(this.products)
    this.cartTotal = state.total;    
  }

  ngOnInit(): void {
  }

}
