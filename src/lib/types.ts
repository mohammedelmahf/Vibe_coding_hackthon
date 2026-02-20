export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  url: string;
  stock: string;
  category?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  url: string;
  icon: string;
}

export type DeliveryMethod = 'delivery' | 'pickup';

export interface OrderDetails {
  method: DeliveryMethod;
  boatName?: string;
  marina?: string;
  berth?: string;
  contactName: string;
  phone: string;
  notes?: string;
  pickupTime?: string;
}
