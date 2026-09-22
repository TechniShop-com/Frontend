export type BrandType = 'TECHNI_SCHOOLS' | 'TECHNI_ZDALNI' | 'BOTH' | 'ALL';

export interface ProductVariant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: BrandType;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface SchoolLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
}

export type DeliveryMethod = 'COURIER' | 'PACZKOMAT' | 'SCHOOL_PICKUP';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export interface Claim {
  id: string;
  orderId: string;
  order?: Order;
  type: 'RETURN' | 'COMPLAINT';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  adminNote: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  paczkomatCode: string | null;
  schoolLocationId: string | null;
  schoolLocation?: SchoolLocation | null;
  totalAmount: number;
  discountAmount: number;
  deliveryCost: number;
  finalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  wantsInvoice: boolean;
  invoiceNip: string | null;
  invoiceCompanyName: string | null;
  invoiceAddress: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  claims: Claim[];
}
