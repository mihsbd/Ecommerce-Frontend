export interface OrderResponse {
    orderId: number;
    success: boolean;
    message: string;
    products: { id: number, numInCart: number};    
}