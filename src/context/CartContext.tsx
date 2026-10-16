import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { getCart, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number) => Promise<void>;
  removeFromCart: (indexOrId: number) => Promise<void>;
  updateQuantity: (indexOrId: number, newQty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: number;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('technishop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  // Synchronizacja z Supabase po zalogowaniu.
  useEffect(() => {
    const syncCart = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const data = await getCart();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setCart(data.items);
        }
      } catch (err) {
        console.warn('Backend cart not reachable, using local storage cart.');
      } finally {
        setIsLoading(false);
      }
    };
    syncCart();
  }, [isAuthenticated]);

  // Zapis do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('technishop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: Product, color: string, size: string, quantity: number = 1) => {
    // Aktualizacja optymistyczna stanu lokalnego
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, selectedColor: color, selectedSize: size, quantity }];
    });

    // Automatycznie otwieramy boczny drawer koszyka dla płynnego UX
    setIsCartDrawerOpen(true);

    // Zapis koszyka przypisanego do zalogowanego użytkownika.
    try {
      if (isAuthenticated) await addToCartApi(product.id, color, size, quantity);
    } catch (err) {
      console.warn('Nie udało się zapisać do bazy backendu (działa w trybie lokalnym):', err);
    }
  };

  const updateQuantity = async (indexOrId: number, delta: number) => {
    const current = cart[indexOrId] || cart.find((item) => item.id === indexOrId);
    const nextQuantity = current ? current.quantity + delta : 0;
    setCart((prev) => {
      return prev
        .map((item, idx) => {
          if (idx === indexOrId || item.id === indexOrId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
    if (current?.id && isAuthenticated) {
      try { await updateCartItemApi(current.id, nextQuantity); } catch (err) { console.warn('Błąd aktualizacji koszyka:', err); }
    }
  };

  const removeFromCart = async (indexOrId: number) => {
    const itemToRemove = cart[indexOrId] || cart.find((item) => item.id === indexOrId);

    setCart((prev) => prev.filter((item, i) => i !== indexOrId && item.id !== indexOrId));

    if (itemToRemove && itemToRemove.id && isAuthenticated) {
      try {
        await removeCartItemApi(itemToRemove.id);
      } catch (err) {
        console.warn('Błąd usuwania pozycji z bazy backendu:', err);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      if (isAuthenticated) await clearCartApi();
    } catch (err) {
      console.warn('Błąd czyszczenia koszyka w backendzie:', err);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        isLoading,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
