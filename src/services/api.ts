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
