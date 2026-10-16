import { CartItem, Product, User } from '../types';
import { supabase } from '../lib/supabase';

const parseProduct = (product: any): Product => ({ ...product, imageUrl: product.imageUrl, colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors, sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes });
const profileFromRow = (row: any): User => ({ id: row.id, name: row.name, email: row.email, avatarUrl: row.avatarUrl || undefined });

export const getProducts = async (params?: { brand?: string; gender?: string; search?: string }): Promise<Product[]> => {
  let query = supabase.from('Product').select('*').order('createdAt', { ascending: false });
  if (params?.brand) query = query.eq('brand', params.brand);
  if (params?.gender) query = query.eq('gender', params.gender);
  if (params?.search) query = query.ilike('title', `%${params.search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(parseProduct);
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase.from('Product').select('*').eq('id', id).single();
  if (error) throw error;
  return parseProduct(data);
};

const currentUserId = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Musisz być zalogowany');
  return data.user.id;
};

const formatCart = (row: any): CartItem => ({ id: row.id, product: parseProduct(row.product), selectedColor: row.selectedColor, selectedSize: row.selectedSize, quantity: row.quantity });

export const getCart = async () => {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from('cart_items').select('*, product:Product(*)').eq('user_id', user_id).order('createdAt');
  if (error) throw error;
  const items = (data || []).map(formatCart);
  return { items, totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), totalItems: items.reduce((sum, item) => sum + item.quantity, 0) };
};

export const addToCartApi = async (productId: string, selectedColor: string, selectedSize: string, quantity = 1) => {
  const user_id = await currentUserId();
  const { data: existing } = await supabase.from('cart_items').select('id, quantity').match({ user_id, productId, selectedColor, selectedSize }).maybeSingle();
  const result = existing ? await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select('*, product:Product(*)').single() : await supabase.from('cart_items').insert({ user_id, productId, selectedColor, selectedSize, quantity }).select('*, product:Product(*)').single();
  if (result.error) throw result.error;
  return formatCart(result.data);
};

export const updateCartItemApi = async (id: number, quantity: number) => {
  if (quantity <= 0) return removeCartItemApi(id);
  const { data, error } = await supabase.from('cart_items').update({ quantity }).eq('id', id).select('*, product:Product(*)').single();
  if (error) throw error;
  return formatCart(data);
};

export const removeCartItemApi = async (id: number) => {
  const { error } = await supabase.from('cart_items').delete().eq('id', id);
  if (error) throw error;
};

export const clearCartApi = async () => {
  const user_id = await currentUserId();
  const { error } = await supabase.from('cart_items').delete().eq('user_id', user_id);
  if (error) throw error;
};

export const createOrderApi = async (orderData: { name: string; email: string; address: string; paymentMethod: string; totalPrice: number; items: CartItem[] }) => {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from('orders').insert({ user_id, customerName: orderData.name, email: orderData.email, address: orderData.address, paymentMethod: orderData.paymentMethod, totalPrice: orderData.totalPrice, items: orderData.items, status: 'PENDING' }).select().single();
  if (error) throw error;
  const { error: emailError } = await supabase.functions.invoke('send-order-email', {
    body: { to: orderData.email, customerName: orderData.name, totalPrice: orderData.totalPrice, orderId: data.id, items: orderData.items },
  });
  if (emailError) console.warn('Nie udało się wysłać potwierdzenia zamówienia:', emailError);
  return data;
};

export const registerUserApi = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  if (!data.user) throw new Error('Nie udało się utworzyć użytkownika');
  if (!data.session) {
    return { message: 'Konto utworzone. Sprawdź skrzynkę i potwierdź adres email.', user: null, requiresEmailConfirmation: true };
  }
  const profile = { id: data.user.id, name, email, avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}` };
  const { data: row, error: profileError } = await supabase.from('profiles').upsert(profile).select().single();
  if (profileError) throw profileError;
  return { message: 'Rejestracja zakończona sukcesem', user: profileFromRow(row) };
};

export const loginUserApi = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  if (profileError) throw profileError;
  return { message: 'Logowanie udane', user: profileFromRow(profile) };
};

export const updateUserProfileApi = async (userId: string, data: { name?: string; email?: string; avatarUrl?: string; password?: string; currentPassword?: string; newPassword?: string }) => {
  const profileData: Record<string, string> = {};
  if (data.name) profileData.name = data.name;
  if (data.email) profileData.email = data.email;
  if (data.avatarUrl !== undefined) profileData.avatarUrl = data.avatarUrl;
  if (Object.keys(profileData).length) {
    const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);
    if (error) throw error;
  }
  const newPassword = data.newPassword || data.password;
  if (newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
  const { data: row, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return { message: 'Profil został pomyślnie zaktualizowany', user: profileFromRow(row) };
};

export const googleAuthApi = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/login` } });
  if (error) throw error;
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

