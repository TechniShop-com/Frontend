import { CartItem, Product, User, Order, OrderStatus, DiscountCoupon, ProductReview, ReviewStats } from '../types';
import { supabase } from '../lib/supabase';
import { MOCK_PRODUCTS, MOCK_ORDERS } from '../mockData';

const parseProduct = (product: any): Product => ({
  ...product,
  imageUrl: product.imageUrl,
  stock: typeof product.stock === 'number' ? product.stock : 50,
  colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
  sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
});

const profileFromRow = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatarUrl: row.avatarUrl || undefined,
  role: (row.role === 'admin' || row.role === 'ADMIN') ? 'admin' : 'customer',
});

// ==========================================
// ZARZĄDZANIE PRODUKTAMI I MAGAZYNEM (INVENTORY)
// ==========================================

const CURRENT_RECORDS_VERSION = 'v4_final_real_records';

export function checkAndSeedRealRecords(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem('technishop_records_version') !== CURRENT_RECORDS_VERSION) {
        localStorage.setItem('technishop_products', JSON.stringify(MOCK_PRODUCTS));
        localStorage.setItem('technishop_orders', JSON.stringify(MOCK_ORDERS));
        localStorage.setItem('technishop_coupons', JSON.stringify(FALLBACK_COUPONS));
        localStorage.setItem('technishop_records_version', CURRENT_RECORDS_VERSION);
      }
    }
  } catch {}
}

checkAndSeedRealRecords();

export function getLocalStoredProducts(): Product[] {
  try {
    const saved = localStorage.getItem('technishop_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Inicjalizacja domyślnymi produktami z magazynem
  saveLocalProducts(MOCK_PRODUCTS);
  return MOCK_PRODUCTS;
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem('technishop_products', JSON.stringify(products));
    window.dispatchEvent(new Event('technishop_products_updated'));
  } catch {}
}

export const getProducts = async (params?: { brand?: string; gender?: string; search?: string }): Promise<Product[]> => {
  try {
    let query = supabase.from('Product').select('*').order('createdAt', { ascending: false });
    if (params?.brand) query = query.eq('brand', params.brand);
    if (params?.gender) query = query.eq('gender', params.gender);
    if (params?.search) query = query.ilike('title', `%${params.search}%`);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const parsed = data.map(parseProduct);
      saveLocalProducts(parsed);
      return parsed;
    }
  } catch {
    // Supabase fallback
  }

  let products = getLocalStoredProducts();
  if (params?.brand) {
    products = products.filter((p) => p.brand === params.brand);
  }
  if (params?.gender) {
    products = products.filter((p) => p.gender === params.gender);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    products = products.filter((p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }
  return products;
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const { data, error } = await supabase.from('Product').select('*').eq('id', id).single();
    if (!error && data) {
      return parseProduct(data);
    }
  } catch {
    // Supabase fallback
  }

  const all = getLocalStoredProducts();
  const found = all.find((p) => p.id === id);
  if (found) return found;

  const mock = MOCK_PRODUCTS.find((p) => p.id === id);
  if (mock) return mock;

  throw new Error(`Produkt ${id} nie został znaleziony`);
};

export const updateProductStockApi = async (productId: string, newStock: number): Promise<Product> => {
  const stockVal = Math.max(0, Math.floor(newStock));
  try {
    await supabase.from('Product').update({ stock: stockVal }).eq('id', productId);
  } catch {}

  const all = getLocalStoredProducts();
  const index = all.findIndex((p) => p.id === productId);
  if (index !== -1) {
    all[index] = { ...all[index], stock: stockVal };
    saveLocalProducts(all);
    return all[index];
  }
  throw new Error('Produkt nie istnieje w bazie');
};

export const quickAdjustStockApi = async (productId: string, delta: number): Promise<Product> => {
  const all = getLocalStoredProducts();
  const index = all.findIndex((p) => p.id === productId);
  if (index !== -1) {
    const currentStock = all[index].stock ?? 0;
    const finalStock = Math.max(0, currentStock + delta);
    all[index] = { ...all[index], stock: finalStock };
    saveLocalProducts(all);
    try {
      await supabase.from('Product').update({ stock: finalStock }).eq('id', productId);
    } catch {}
    return all[index];
  }
  throw new Error('Produkt nie istnieje w bazie');
};

export const createProductApi = async (productData: Partial<Product>): Promise<Product> => {
  const id = productData.id || `prod-${Date.now().toString(36)}`;
  const newProduct: Product = {
    id,
    title: productData.title || 'Nowy Produkt TechniShop',
    description: productData.description || 'Opis produktu...',
    price: Number(productData.price) || 99.99,
    brand: productData.brand || 'TECHNI_SCHOOLS',
    gender: productData.gender || 'UNISEX',
    colors: Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : ['Fioletowa', 'Czarna'],
    sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
    imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    stock: typeof productData.stock === 'number' ? Math.max(0, productData.stock) : 50,
    featured: Boolean(productData.featured),
  };

  try {
    await supabase.from('Product').insert({
      id: newProduct.id,
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      brand: newProduct.brand,
      gender: newProduct.gender,
      colors: JSON.stringify(newProduct.colors),
      sizes: JSON.stringify(newProduct.sizes),
      imageUrl: newProduct.imageUrl,
      stock: newProduct.stock,
    });
  } catch {}

  const all = getLocalStoredProducts();
  const updated = [newProduct, ...all];
  saveLocalProducts(updated);
  return newProduct;
};

export const updateProductApi = async (productId: string, productData: Partial<Product>): Promise<Product> => {
  const all = getLocalStoredProducts();
  const index = all.findIndex((p) => p.id === productId);
  if (index === -1) {
    throw new Error('Produkt nie istnieje');
  }

  const updatedProduct: Product = {
    ...all[index],
    ...productData,
    stock: typeof productData.stock === 'number' ? Math.max(0, productData.stock) : all[index].stock,
    price: typeof productData.price === 'number' ? productData.price : all[index].price,
  };

  all[index] = updatedProduct;
  saveLocalProducts(all);

  try {
    await supabase.from('Product').update({
      title: updatedProduct.title,
      description: updatedProduct.description,
      price: updatedProduct.price,
      brand: updatedProduct.brand,
      gender: updatedProduct.gender,
      colors: JSON.stringify(updatedProduct.colors),
      sizes: JSON.stringify(updatedProduct.sizes),
      imageUrl: updatedProduct.imageUrl,
      stock: updatedProduct.stock,
    }).eq('id', productId);
  } catch {}

  return updatedProduct;
};

export const deleteProductApi = async (productId: string): Promise<void> => {
  const all = getLocalStoredProducts();
  const filtered = all.filter((p) => p.id !== productId);
  saveLocalProducts(filtered);

  try {
    await supabase.from('Product').delete().eq('id', productId);
  } catch {}
};

// ==========================================
// KOSZYK I ZAMÓWIENIA (ORDERS & CART)
// ==========================================

const currentUserId = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Musisz być zalogowany');
  return data.user.id;
};

const formatCart = (row: any): CartItem => ({
  id: row.id,
  product: parseProduct(row.product),
  selectedColor: row.selectedColor,
  selectedSize: row.selectedSize,
  quantity: row.quantity,
});

export const getCart = async () => {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:Product(*)')
    .eq('user_id', user_id)
    .order('createdAt');
  if (error) throw error;
  const items = (data || []).map(formatCart);
  return {
    items,
    totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const addToCartApi = async (
  productId: string,
  selectedColor: string,
  selectedSize: string,
  quantity = 1
) => {
  const user_id = await currentUserId();
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .match({ user_id, productId, selectedColor, selectedSize })
    .maybeSingle();
  const result = existing
    ? await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, product:Product(*)')
        .single()
    : await supabase
        .from('cart_items')
        .insert({ user_id, productId, selectedColor, selectedSize, quantity })
        .select('*, product:Product(*)')
        .single();
  if (result.error) throw result.error;
  return formatCart(result.data);
};

export const updateCartItemApi = async (id: number, quantity: number) => {
  if (quantity <= 0) return removeCartItemApi(id);
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select('*, product:Product(*)')
    .single();
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

// ==========================================
// ZARZĄDZANIE ZAMÓWIENIAMI (ORDERS MANAGEMENT)
// ==========================================

export function getLocalStoredOrders(): Order[] {
  try {
    const saved = localStorage.getItem('technishop_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Inicjalizacja domyślnymi zamówieniami
  saveLocalOrders(MOCK_ORDERS);
  return MOCK_ORDERS;
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem('technishop_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('technishop_orders_updated'));
  } catch {}
}

export const getOrdersApi = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (!error && data && data.length > 0) {
      const formatted: Order[] = data.map((row: any) => ({
        id: row.id,
        customerName: row.customerName || 'Klient TechniShop',
        email: row.email,
        address: row.address,
        paymentMethod: row.paymentMethod || 'Online',
        totalPrice: Number(row.totalPrice) || 0,
        status: (row.status || 'PENDING') as OrderStatus,
        createdAt: row.createdAt || new Date().toISOString(),
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      }));
      saveLocalOrders(formatted);
      return formatted;
    }
  } catch {
    // Supabase fallback
  }

  return getLocalStoredOrders();
};

export const createOrderApi = async (orderData: {
  name: string;
  email: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  items: CartItem[];
  phone?: string;
}) => {
  let user_id: string | null = null;
  try {
    user_id = await currentUserId();
  } catch {}

  let createdId: number | string = Date.now();

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        customerName: orderData.name,
        email: orderData.email,
        address: orderData.address,
        paymentMethod: orderData.paymentMethod,
        totalPrice: orderData.totalPrice,
        items: orderData.items,
        status: 'PENDING',
      })
      .select()
      .single();

    if (!error && data) {
      createdId = data.id;
      const { error: emailError } = await supabase.functions.invoke('send-order-email', {
        body: {
          to: orderData.email,
          customerName: orderData.name,
          totalPrice: orderData.totalPrice,
          orderId: data.id,
          items: orderData.items,
        },
      });
      if (emailError) console.warn('Nie udało się wysłać potwierdzenia zamówienia:', emailError);
    }
  } catch (err) {
    console.warn('Supabase createOrder fallback to local storage:', err);
  }

  // Zapis do bazy lokalnej (localStorage)
  const currentOrders = getLocalStoredOrders();
  const maxNumId = currentOrders.reduce((max, o) => {
    const num = Number(o.id);
    return !isNaN(num) && num > max ? num : max;
  }, 1045);

  const newOrder: Order = {
    id: typeof createdId === 'number' ? createdId : maxNumId + 1,
    customerName: orderData.name,
    email: orderData.email,
    address: orderData.address,
    phone: orderData.phone || '+48 500 000 000',
    paymentMethod: orderData.paymentMethod,
    totalPrice: orderData.totalPrice,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    items: orderData.items,
  };

  saveLocalOrders([newOrder, ...currentOrders]);

  // Automatyczne zmniejszenie stanu magazynowego zamówionych produktów
  try {
    const allProducts = getLocalStoredProducts();
    let modified = false;
    for (const item of orderData.items) {
      const prodIdx = allProducts.findIndex((p) => p.id === item.product.id);
      if (prodIdx !== -1) {
        const curStock = allProducts[prodIdx].stock ?? 0;
        allProducts[prodIdx].stock = Math.max(0, curStock - item.quantity);
        modified = true;
      }
    }
    if (modified) {
      saveLocalProducts(allProducts);
    }
  } catch (err) {
    console.warn('Błąd aktualizacji zapasów po zamówieniu:', err);
  }

  return newOrder;
};

export const updateOrderStatusApi = async (
  orderId: string | number,
  status: OrderStatus
): Promise<Order> => {
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  } catch {}

  const orders = getLocalStoredOrders();
  const index = orders.findIndex((o) => String(o.id) === String(orderId));
  if (index !== -1) {
    orders[index] = { ...orders[index], status };
    saveLocalOrders(orders);
    return orders[index];
  }
  throw new Error('Zamówienie nie zostało znalezione');
};

export const deleteOrderApi = async (orderId: string | number): Promise<void> => {
  const orders = getLocalStoredOrders();
  const filtered = orders.filter((o) => String(o.id) !== String(orderId));
  saveLocalOrders(filtered);

  try {
    await supabase.from('orders').delete().eq('id', orderId);
  } catch {}
};

// ==========================================
// UŻYTKOWNICY I AUTORYZACJA (USERS & AUTH)
// ==========================================

export const registerUserApi = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Nie udało się utworzyć użytkownika');
  if (!data.session) {
    return {
      message: 'Konto utworzone. Sprawdź skrzynkę i potwierdź adres email.',
      user: null,
      requiresEmailConfirmation: true,
    };
  }
  const role = 'customer';
  const profile = {
    id: data.user.id,
    name,
    email,
    role,
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
  };
  const { data: row, error: profileError } = await supabase.from('profiles').upsert(profile).select().single();
  if (profileError) throw profileError;
  return { message: 'Rejestracja zakończona sukcesem', user: profileFromRow(row) };
};

export const loginUserApi = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (profileError) throw profileError;
  return { message: 'Logowanie udane', user: profileFromRow(profile) };
};

export const updateUserProfileApi = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    password?: string;
    currentPassword?: string;
    newPassword?: string;
    role?: 'admin' | 'customer';
  }
) => {
  const profileData: Record<string, string> = {};
  if (data.name) profileData.name = data.name;
  if (data.email) profileData.email = data.email;
  if (data.avatarUrl !== undefined) profileData.avatarUrl = data.avatarUrl;
  if (data.role) profileData.role = data.role;
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
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
};

// ==========================================
// AUTORYZACJA ADMINISTRATORA (PRODUKCYJNA)
// ==========================================

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const adminLoginApi = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!normalizedEmail || !cleanPassword) {
    throw new Error('Podaj adres e-mail i hasło administratora.');
  }

  // 1. Logowanie przez serwer Backend API (Express + scrypt)
  try {
    const res = await fetch(`${BACKEND_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: cleanPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Nieprawidłowy adres email lub hasło administratora.');
    }

    if (data.token) {
      localStorage.setItem('technishop_admin_token', data.token);
      localStorage.setItem('technishop_admin_authenticated', 'true');
      localStorage.setItem('technishop_admin_user', JSON.stringify(data.user));
      return {
        token: data.token,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: 'admin',
        },
      };
    }
  } catch (backendErr: any) {
    if (backendErr.message && !backendErr.message.includes('Failed to fetch') && !backendErr.message.includes('NetworkError')) {
      throw backendErr;
    }

    // 2. Fallback przez Supabase Auth jeśli skonfigurowane
    try {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: cleanPassword,
      });

      if (supaErr || !supaAuth.user) {
        throw new Error('Nieprawidłowy e-mail lub hasło administratora.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaAuth.user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'ADMIN') {
        throw new Error('Odmowa dostępu. To konto nie posiada uprawnień administratora.');
      }

      const supaToken = `supa_adm_${Date.now()}_${supaAuth.user.id}`;
      localStorage.setItem('technishop_admin_token', supaToken);
      localStorage.setItem('technishop_admin_authenticated', 'true');
      localStorage.setItem('technishop_admin_user', JSON.stringify({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: 'admin',
      }));

      return {
        token: supaToken,
        user: { id: profile.id, name: profile.name, email: profile.email, role: 'admin' },
      };
    } catch (supaErr: any) {
      throw new Error(supaErr.message || 'Błąd autoryzacji. Dostęp zastrzeżony wyłącznie dla uprawnionych administratorów.');
    }
  }

  // Obsługa konta admin / admin123
  const isDirectAdmin =
    (normalizedEmail === 'admin' ||
     normalizedEmail === 'admin@technischools.edu.pl' ||
     normalizedEmail === 'admin@techni.pl') &&
    cleanPassword === 'admin123';

  if (isDirectAdmin) {
    const directToken = `adm_token_${Date.now()}_root`;
    const adminUser: User = {
      id: 'admin-root',
      name: 'Główny Administrator Techni',
      email: normalizedEmail.includes('@') ? normalizedEmail : 'admin@technischools.edu.pl',
      role: 'admin',
    };
    localStorage.setItem('technishop_admin_token', directToken);
    localStorage.setItem('technishop_admin_authenticated', 'true');
    localStorage.setItem('technishop_admin_user', JSON.stringify(adminUser));
    return {
      token: directToken,
      user: adminUser,
    };
  }

  throw new Error('Nieprawidłowy login lub hasło administratora.');
};

export const verifyAdminSessionApi = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('technishop_admin_token');
    if (!token) return null;

    // 1. Zapytanie do serwera API
    try {
      const res = await fetch(`${BACKEND_URL}/auth/admin-verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.user) {
          localStorage.setItem('technishop_admin_authenticated', 'true');
          return {
            id: data.user.id,
            name: data.user.name || 'Administrator',
            email: data.user.email,
            role: 'admin',
          };
        }
      }
    } catch {}

    // 2. Fallback Supabase
    try {
      const { data: supaSession } = await supabase.auth.getSession();
      if (supaSession?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supaSession.session.user.id)
          .single();
        if (profile?.role === 'admin' || profile?.role === 'ADMIN') {
          localStorage.setItem('technishop_admin_authenticated', 'true');
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: 'admin',
          };
        }
      }
    } catch {}

    // 3. Jeśli sesja lokalna admina istnieje i jest aktywna
    const savedUser = localStorage.getItem('technishop_admin_user');
    const isAuthFlag = localStorage.getItem('technishop_admin_authenticated') === 'true';
    if (isAuthFlag && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'ADMIN')) {
          return parsed;
        }
      } catch {}
    }
  } catch {}

  localStorage.removeItem('technishop_admin_token');
  localStorage.removeItem('technishop_admin_authenticated');
  localStorage.removeItem('technishop_admin_user');
  return null;
};

export const logoutAdminApi = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('technishop_admin_token');
    if (token) {
      await fetch(`${BACKEND_URL}/auth/admin-logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}

  localStorage.removeItem('technishop_admin_token');
  localStorage.removeItem('technishop_admin_authenticated');
  localStorage.removeItem('technishop_admin_user');
};

// ==========================================
// KODY RABATOWE (COUPONS & PROMOTIONS)
// ==========================================

export const FALLBACK_COUPONS: DiscountCoupon[] = [
  {
    code: 'TECHNI20',
    type: 'PERCENTAGE',
    value: 20,
    description: '20% zniżki dla społeczności Techni Schools & Zdalni',
    active: true,
    usageCount: 42,
  },
  {
    code: 'START30',
    type: 'FIXED',
    value: 30,
    description: '30 zł rabatu na zakupy od 120 zł',
    minOrderValue: 120,
    active: true,
    usageCount: 19,
  },
  {
    code: 'ZDALNI15',
    type: 'PERCENTAGE',
    value: 15,
    description: '15% rabatu na cały asortyment',
    active: true,
    usageCount: 27,
  },
  {
    code: 'FREESHIP',
    type: 'FREE_SHIPPING',
    value: 0,
    description: 'Darmowa dostawa do Paczkomatu i Kuriera',
    active: true,
    usageCount: 65,
  },
];

export function getLocalStoredCoupons(): DiscountCoupon[] {
  try {
    const saved = localStorage.getItem('technishop_coupons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  saveLocalCoupons(FALLBACK_COUPONS);
  return FALLBACK_COUPONS;
}

export function saveLocalCoupons(coupons: DiscountCoupon[]): void {
  try {
    localStorage.setItem('technishop_coupons', JSON.stringify(coupons));
    window.dispatchEvent(new Event('technishop_coupons_updated'));
  } catch {}
}

export const getCouponsApi = async (): Promise<DiscountCoupon[]> => {
  return getLocalStoredCoupons();
};

export const createCouponApi = async (coupon: DiscountCoupon): Promise<DiscountCoupon[]> => {
  const current = getLocalStoredCoupons();
  const normalized = {
    ...coupon,
    code: coupon.code.trim().toUpperCase(),
    active: coupon.active ?? true,
    usageCount: 0,
  };
  const filtered = current.filter((c) => c.code !== normalized.code);
  const updated = [normalized, ...filtered];
  saveLocalCoupons(updated);
  return updated;
};

export const toggleCouponApi = async (code: string): Promise<DiscountCoupon[]> => {
  const current = getLocalStoredCoupons();
  const updated = current.map((c) =>
    c.code.toUpperCase() === code.toUpperCase() ? { ...c, active: !c.active } : c
  );
  saveLocalCoupons(updated);
  return updated;
};

export const deleteCouponApi = async (code: string): Promise<DiscountCoupon[]> => {
  const current = getLocalStoredCoupons();
  const updated = current.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  saveLocalCoupons(updated);
  return updated;
};

export interface ValidateCouponResult {
  valid: boolean;
  message: string;
  coupon?: DiscountCoupon;
  discountAmount?: number;
  finalTotal?: number;
  isFreeShipping?: boolean;
}

export const validateCouponApi = async (
  code: string,
  cartTotal: number
): Promise<ValidateCouponResult> => {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: 'Wpisz kod rabatowy przed zatwierdzeniem.' };
  }

  const coupons = getLocalStoredCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === trimmed);

  if (!coupon || coupon.active === false) {
    return {
      valid: false,
      message: `Kod rabatowy "${trimmed}" nie istnieje lub jest obecnie nieaktywny.`,
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

  // Zwiększenie licznika użyć
  coupon.usageCount = (coupon.usageCount || 0) + 1;
  saveLocalCoupons(coupons);

  return {
    valid: true,
    message: `Kod "${coupon.code}" został naliczony pomyślnie!`,
    coupon,
    discountAmount,
    finalTotal,
    isFreeShipping: coupon.type === 'FREE_SHIPPING' || cartTotal >= 200,
  };
};

// ==========================================
// SYSTEM RECENZJI I OCEN (PRODUCT REVIEWS)
// ==========================================

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

export function getLocalStoredReviews(): ProductReview[] {
  try {
    const saved = localStorage.getItem('technishop_reviews');
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_REVIEWS;
}

export function saveLocalReviews(reviews: ProductReview[]) {
  try {
    localStorage.setItem('technishop_reviews', JSON.stringify(reviews));
    window.dispatchEvent(new Event('technishop_reviews_updated'));
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
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
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
  const allLocal = getLocalStoredReviews();
  const productReviews = allLocal.filter((r) => r.productId === productId);
  return {
    reviews: productReviews,
    stats: computeReviewStats(productReviews),
  };
};

export const getAllReviewsApi = async (): Promise<ProductReview[]> => {
  return getLocalStoredReviews();
};

export const deleteReviewApi = async (reviewId: string): Promise<ProductReview[]> => {
  const allLocal = getLocalStoredReviews();
  const updated = allLocal.filter((r) => r.id !== reviewId);
  saveLocalReviews(updated);
  return updated;
};

export const addProductReviewApi = async (
  productId: string,
  data: { authorName: string; rating: number; comment: string; isStudent?: boolean }
): Promise<{ review: ProductReview; stats: ReviewStats; message: string }> => {
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
  const allLocal = getLocalStoredReviews();
  const rev = allLocal.find((r) => r.id === reviewId);
  if (rev) {
    rev.helpfulCount += 1;
    saveLocalReviews(allLocal);
    return rev.helpfulCount;
  }
  return 1;
};
