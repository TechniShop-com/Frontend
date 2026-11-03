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
  stock?: number;
  featured?: boolean;
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
  role?: 'admin' | 'customer';
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number | string;
  customerName: string;
  email: string;
  address: string;
  phone?: string;
  paymentMethod: string;
  totalPrice: number;
  items: CartItem[];
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
  notes?: string;
}

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export interface DiscountCoupon {
  code: string;
  type: CouponDiscountType;
  value: number; // np. 20 (dla 20%) lub 30 (dla 30 zł)
  description: string;
  minOrderValue?: number;
  active?: boolean;
  usageCount?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  isStudent?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recommendationPercentage: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
