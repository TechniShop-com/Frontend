export type BrandType = 'TECHNI_SCHOOLS' | 'TECHNI_ZDALNI';
export type GenderType = 'WOMEN' | 'MEN' | 'UNISEX';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: BrandType;
  gender: GenderType;
  colors: string[];
  sizes: string[];
  imageUrl: string;
}

export interface CartItem {
  id?: number;
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}
