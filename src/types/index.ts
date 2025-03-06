export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  customer: Customer;
  products: Product[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
}