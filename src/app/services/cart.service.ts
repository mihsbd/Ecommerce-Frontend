import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../models/cart.model';
//***import { OrderResponse } from '../models/order.model';
import { ProductModelServer } from '../models/product.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';


@Injectable({
  providedIn: 'root'
})

export class CartService {

  private ServerUrl = environment.SERVER_URL;

  /* Data variables to store the cart information on the client's local storage */
  private cartDataClient: CartModelPublic = {
    total: 0, 
    prodData: [{
        id: 0,
        incart: 0
    }]
  };

  /* Data variables to store the cart information on the frontend server */
  private cartDataServer: CartModelServer = {
    total: 0,
    data: [{
        product: undefined,   // Error gone after changing in cart.model.ts
        numInCart: 0
    }]
  };

  /* OBSERVABLES FOR THE COMPONENTS TO SUBSCRIBE */
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);

  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrderService,
              private router: Router,
              private toast: ToastrService,
              private spinner: NgxSpinnerService) 
  {
    
    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    /* Get the information from local storage (if any) */
    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart')!);
    
    /* Check if the info variable is not null or has some data in it */
    if (info !== null && info !== undefined && info.prodData[0].incart !== 0) {
      // Local storage is not empty and has some information
      this.cartDataClient = info;

      // Loop through each entry and put it in the cartDataServer object
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProductInfo: ProductModelServer) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = p.incart;
            this.cartDataServer.data[0].product = actualProductInfo;
            
            // Calling calculateTotal function
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            // CartDataServer already has some entry in it
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProductInfo
            });
            
            // Calling calculateTotal function
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({...this.cartDataServer});
        });
      });
    }
  }

  /* ADD METHOD */
  AddProductToCart(id: number, quantity?: number) {
    this.productService.getSingleProduct(id).subscribe(prod => {
      // 1. If the cart is empty
      if (this.cartDataServer.data[0].product === undefined)
      {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
        
        // Calling calculateTotal function
        this.calculateTotal();
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({...this.cartDataServer});
        
        // Displaying a Toast Notification
        this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      } else {
        // 2. If the cart has some items
        let index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id);  // -1 or a positive value
        
        // 2.a. If that item is already in the cart
        if (index !== -1) {
          if (quantity !== undefined && quantity <= prod.quantity) {
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          } else {
            this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
          }
          this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
          this.calculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          
          // Displaying a Toast Notification
          this.toast.info(`${prod.name} quantity updated in the cart`, 'Product Updated', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });
        } else {
          // 2.b. If that item is not in the cart array
          this.cartDataServer.data.push({ numInCart: 1, product: prod });
          this.cartDataClient.prodData.push({ incart: 1, id: prod.id });
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          
          // Displaying a Toast Notification
          
          this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });
          
          // Calling calculateTotal function
          this.calculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({...this.cartDataServer});
        }
      }
    }); 
  }

  /* UPDATE METHOD */
  UpdateCartItems(index: number, increase: boolean)
  {
    let data = this.cartDataServer.data[index];

    if (increase) {
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataClient.prodData[index].incart = data.numInCart;
      
      // Calling calculateTotal function
      this.calculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({...this.cartDataServer});
    } else {
      data.numInCart--;

      if (data.numInCart < 1) {
        // Calling Delete Method
        this.DeleteProductFromCart(index);
        this.cartData$.next({...this.cartDataServer});
      } else {
        this.cartData$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].incart = data.numInCart;
        
        // Calling calculateTotal function
        this.calculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
  }


  /* DELETE METHOD */
  DeleteProductFromCart(index: number) {
    if (window.confirm('Are you sure you want to remove the item?')) 
    {
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      
      // Calling calculateTotal function
      this.calculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = { total: 0, prodData: [{ id: 0, incart: 0 }] };
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {
        this.cartDataServer = { total: 0, data: [{ product: undefined, numInCart: 0 }] };
        this.cartData$.next({...this.cartDataServer});
      } else {
        this.cartData$.next({...this.cartDataServer});
      }
    } else {
      // If the user clicks the Cancel Button
      return;
    }
  }

  /* CHECKOUT METHOD */  
  CheckoutFromCart(userId: number) {
    //****this.http.post(`${this.ServerUrl}/orders/payment`, null).subscribe((res: {success: boolean}) => {
    this.http.post(`${this.ServerUrl}/orders/payment`, null).subscribe((res: any) => {
      if (res.success) {
        this.resetServerData();
        this.http.post(`${this.ServerUrl}/orders/new`, {
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: any) => {         //***subscribe((data: OrderResponse)
          this.orderService.getSingleOrder(data.orderId).then(prods => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.orderId,                  
                  total: this.cartDataClient.total                   
                }                
              };
              console.log(navigationExtras);

              // Hiding Spinner
              this.spinner.hide();
              this.router.navigate(['/thanks'], navigationExtras).then(p => {
                this.cartDataClient = { total: 0, prodData: [{ id: 0, incart: 0 }] };
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              });
            }
          });          
        });
      } else {
        // Hiding Spinner
        this.spinner.hide();
        this.toast.error(`Sorry, failed to book the order`, 'Order Status', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });        
      }
    });
  }


  /* CALCULATE TOTAL FUNCTION */
  private calculateTotal() {
    let Total = 0;

    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p;
      const {price} = p.product;

      Total += numInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  /* CALCULATE SUB TOTAL FUNCTION */
  CalculateSubTotal(index: number): number {
    let subTotal = 0;

    const p = this.cartDataServer.data[index];
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }

  /* RESETTING SERVER DATA */
  private resetServerData() {
    this.cartDataServer = { total: 0, data: [{ product: undefined, numInCart: 0 }] };
    this.cartData$.next({...this.cartDataServer});
  }
}