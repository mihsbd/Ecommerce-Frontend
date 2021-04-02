export interface ProductModelServer {
    id : number;
    name : string;
    category : string;
    description : string;
    price : number;
    quantity : number;
    image : string;
    images : string;
}

export interface ServerResponse {
    count: number;
    products: ProductModelServer[];
}

/* Used in Order Service */
export interface ProductResponseModel {
    id : number;
    name : string;
    description : string;
    price : number;
    quantityOrdered : number;
    image : string;
}

