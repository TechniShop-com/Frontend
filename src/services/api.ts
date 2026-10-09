import axios from 'axios';
import { Product, CartItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pobieranie listy produktów (z opcjonalnymi filtrami)
export const getProducts = async (params?: { brand?: string; gender?: string; search?: string }): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products', { params });
  return response.data;
};

// Pobieranie pojedynczego produktu po ID
export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

// Pobieranie koszyka
export const getCart = async () => {
  const response = await api.get<{ items: any[]; totalPrice: number; totalItems: number }>('/cart');
  return response.data;
};

// Dodawanie do koszyka w bazie
export const addToCartApi = async (productId: string, selectedColor: string, selectedSize: string, quantity: number = 1) => {
  const response = await api.post('/cart', {
    productId,
    selectedColor,
    selectedSize,
    quantity,
  });
  return response.data;
};

// Aktualizacja ilości w koszyku w bazie
export const updateCartItemApi = async (id: number, quantity: number) => {
  const response = await api.put(`/cart/${id}`, { quantity });
  return response.data;
};

// Usuwanie z koszyka w bazie
export const removeCartItemApi = async (id: number) => {
  const response = await api.delete(`/cart/${id}`);
  return response.data;
};

// Czyszczenie koszyka w bazie
export const clearCartApi = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// Składanie zamówienia
export const createOrderApi = async (orderData: {
  name: string;
  email: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  items: CartItem[];
}) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Rejestracja użytkownika w backendzie
export const registerUserApi = async (name: string, email: string, password: string) => {
  const response = await api.post<{ message: string; user: any }>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

// Logowanie użytkownika w backendzie
export const loginUserApi = async (email: string, password: string) => {
  const response = await api.post<{ message: string; user: any }>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// Aktualizacja profilu użytkownika
export const updateUserProfileApi = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    password?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) => {
  const response = await api.put<{ message: string; user: any }>(`/auth/user/${userId}`, data);
  return response.data;
};

// Logowanie / Rejestracja przez Google
export const googleAuthApi = async (data: {
  email: string;
  name: string;
  avatarUrl?: string;
}) => {
  const response = await api.post<{ message: string; user: any }>('/auth/google', data);
  return response.data;
};

// ==========================================
// SYSTEM KODÓW RABATOWYCH (PROMO CODES)
// ==========================================

import { DiscountCoupon } from '../types';

export const FALLBACK_COUPONS: DiscountCoupon[] = [
  {
    code: 'TECHNI20',
    type: 'PERCENTAGE',
    value: 20,
    description: '20% zniżki dla społeczności Techni Schools & Zdalni',
  },
  {
    code: 'START30',
    type: 'FIXED',
    value: 30,
    description: '30 zł rabatu na zakupy od 120 zł',
    minOrderValue: 120,
  },
  {
    code: 'ZDALNI15',
    type: 'PERCENTAGE',
    value: 15,
    description: '15% rabatu na cały asortyment',
  },
  {
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 0,
    description: 'Darmowa dostawa do Paczkomatu i Kuriera',
  },
];

export interface ValidateCouponResult {
  valid: boolean;
  message: string;
  coupon?: DiscountCoupon;
  discountAmount?: number;
  finalTotal?: number;
  isFreeShipping?: boolean;
}

// Pobieranie aktywnych kodów rabatowych
export const getCouponsApi = async (): Promise<DiscountCoupon[]> => {
  try {
    const res = await api.get<{ coupons: DiscountCoupon[] }>('/coupons');
    if (res.data?.coupons && Array.isArray(res.data.coupons)) {
      return res.data.coupons;
    }
  } catch {
    // Używamy fallbacku jeśli backend jest offline
  }
  return FALLBACK_COUPONS;
};

// Walidacja kodu rabatowego z automatycznym fallbackiem
export const validateCouponApi = async (
  code: string,
  cartTotal: number
): Promise<ValidateCouponResult> => {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: 'Wpisz kod rabatowy przed zatwierdzeniem.' };
  }

  try {
    const res = await api.post<ValidateCouponResult>('/coupons/validate', {
      code: trimmed,
      cartTotal,
    });
    return res.data;
  } catch (err: any) {
    // Jeżeli backend zgłosił błąd biznesowy z odpowiedzią z serwera
    if (err.response?.data?.message) {
      return {
        valid: false,
        message: err.response.data.message,
      };
    }

    // Niezawodny fallback lokalny, gdy serwer API jest wyłączony
    const coupon = FALLBACK_COUPONS.find((c) => c.code.toUpperCase() === trimmed);
    if (!coupon) {
      return {
        valid: false,
        message: `Kod rabatowy "${trimmed}" nie istnieje lub wygasł.`,
      };
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Kod "${coupon.code}" wymaga minimalnej kwoty zamówienia ${coupon.minOrderValue.toFixed(2)} zł (brakuje Ci ${(coupon.minOrderValue - cartTotal).toFixed(2)} zł).`,
      };
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round(cartTotal * (coupon.value / 100) * 100) / 100;
    } else if (coupon.type === 'FIXED') {
      discountAmount = Math.min(coupon.value, cartTotal);
    } else if (coupon.type === 'FREE_SHIPPING') {
      discountAmount = 0;
    }

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    return {
      valid: true,
      message: `Kod "${coupon.code}" został naliczony pomyślnie!`,
      coupon,
      discountAmount,
      finalTotal,
      isFreeShipping: coupon.type === 'FREE_SHIPPING' || cartTotal >= 200,
    };
  }
};

