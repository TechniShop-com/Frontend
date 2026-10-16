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

// ==========================================
// SYSTEM RECENZJI I OCEN (PRODUCT REVIEWS)
// ==========================================

import { ProductReview, ReviewStats } from '../types';

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'hoodie-1',
    authorName: 'Kacper M. (Techni Lublin)',
    rating: 5,
    comment: 'Jakość materiału jest rewelacyjna. Bardzo wygodna, krój idealnie leży i świetnie wygląda na korytarzach szkoły!',
    date: '2 dni temu',
    verifiedPurchase: true,
    helpfulCount: 14,
    isStudent: true,
  },
  {
    id: 'rev-2',
    productId: 'hoodie-1',
    authorName: 'Weronika K.',
    rating: 5,
    comment: 'Szybka dostawa paczkomatem i genialny fioletowy odcień. Rozmiar M pasuje idealnie zgodnie z tabelą.',
    date: 'W zeszłym tygodniu',
    verifiedPurchase: true,
    helpfulCount: 8,
    isStudent: false,
  },
  {
    id: 'rev-3',
    productId: 'hoodie-1',
    authorName: 'Michał Z. (Techni Zdalni)',
    rating: 4,
    comment: 'Ciepła i miła w dotyku bawełna. Dobrze znosi pranie, nadruk nie pęka. Polecam każdemu z platformy zdalnej.',
    date: '2 tygodnie temu',
    verifiedPurchase: true,
    helpfulCount: 5,
    isStudent: true,
  },
  {
    id: 'rev-4',
    productId: 'tshirt-1',
    authorName: 'Bartek P.',
    rating: 5,
    comment: 'Świetny minimalistyczny t-shirt z logiem. Materiał oddychający, idealny na codzienne zajęcia.',
    date: '3 dni temu',
    verifiedPurchase: true,
    helpfulCount: 6,
    isStudent: true,
  },
  {
    id: 'rev-5',
    productId: 'backpack-1',
    authorName: 'Oliwia S.',
    rating: 5,
    comment: 'Pojemny plecak, bez problemu mieści laptopa 15.6 cala i wszystkie zeszyty. Dużo wygodnych przegródek.',
    date: 'Wczoraj',
    verifiedPurchase: true,
    helpfulCount: 11,
    isStudent: true,
  },
];

function getLocalStoredReviews(): ProductReview[] {
  try {
    const saved = localStorage.getItem('technishop_reviews');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_REVIEWS;
}

function saveLocalReviews(reviews: ProductReview[]) {
  try {
    localStorage.setItem('technishop_reviews', JSON.stringify(reviews));
  } catch {}
}

export function computeReviewStats(reviews: ProductReview[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      recommendationPercentage: 100,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  let sum = 0;
  let recommended = 0;

  for (const r of reviews) {
    const star = (Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5);
    distribution[star] = (distribution[star] || 0) + 1;
    sum += r.rating;
    if (r.rating >= 4) recommended++;
  }

  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    recommendationPercentage: Math.round((recommended / reviews.length) * 100),
    ratingDistribution: distribution,
  };
}

export const getProductReviewsApi = async (
  productId: string
): Promise<{ reviews: ProductReview[]; stats: ReviewStats }> => {
  try {
    const res = await api.get<{ reviews: ProductReview[]; stats: ReviewStats }>(`/reviews/${productId}`);
    if (res.data?.reviews) {
      return res.data;
    }
  } catch {}

  const allLocal = getLocalStoredReviews();
  const productReviews = allLocal.filter((r) => r.productId === productId);
  return {
    reviews: productReviews,
    stats: computeReviewStats(productReviews),
  };
};

export const addProductReviewApi = async (
  productId: string,
  data: { authorName: string; rating: number; comment: string; isStudent?: boolean }
): Promise<{ review: ProductReview; stats: ReviewStats; message: string }> => {
  try {
    const res = await api.post(`/reviews/${productId}`, data);
    if (res.data?.review) {
      return res.data;
    }
  } catch {}

  const allLocal = getLocalStoredReviews();
  const newRev: ProductReview = {
    id: `rev-${Date.now()}`,
    productId,
    authorName: data.authorName.trim(),
    rating: data.rating,
    comment: data.comment.trim(),
    date: 'Dzisiaj',
    verifiedPurchase: true,
    helpfulCount: 0,
    isStudent: Boolean(data.isStudent),
  };
  const updatedAll = [newRev, ...allLocal];
  saveLocalReviews(updatedAll);

  const productReviews = updatedAll.filter((r) => r.productId === productId);
  return {
    review: newRev,
    stats: computeReviewStats(productReviews),
    message: 'Opinia została pomyślnie dodana!',
  };
};

export const likeReviewApi = async (reviewId: string): Promise<number> => {
  try {
    const res = await api.post<{ helpfulCount: number }>(`/reviews/${reviewId}/helpful`);
    if (typeof res.data?.helpfulCount === 'number') {
      return res.data.helpfulCount;
    }
  } catch {}

  const allLocal = getLocalStoredReviews();
  const rev = allLocal.find((r) => r.id === reviewId);
  if (rev) {
    rev.helpfulCount += 1;
    saveLocalReviews(allLocal);
    return rev.helpfulCount;
  }
  return 1;
};


