import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { ServerResponse } from '../../models/product.model';
import { ProductModelServer } from '../../models/product.model'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: ProductModelServer[] = [];
  
  constructor(private productService: ProductService,
              private cartService: CartService,
              private router: Router) { }

  ngOnInit(): void {
    this.productService.getAllProducts(15).subscribe((prods: ServerResponse) => {
      this.products = prods.products;    
    });
  }

  productDetails(id: number) {
    this.router.navigate(['/products/', id]).then();
  }
  
  AddToCart(id: number) {
    this.cartService.AddProductToCart(id);
  }
  
}
