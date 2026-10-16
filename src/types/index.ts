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

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export interface DiscountCoupon {
  code: string;
  type: CouponDiscountType;
  value: number; // np. 20 (dla 20%) lub 30 (dla 30 zł)
  description: string;
  minOrderValue?: number;
}


