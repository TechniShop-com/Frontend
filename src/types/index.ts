export type BrandType = 'TECHNI_SCHOOLS' | 'TECHNI_ZDALNI';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: BrandType;
  colors: string[];
  sizes: string[];
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}
