import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi, registerUserApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/adventurer/svg?seed=TechniHero&backgroundColor=b6e3f4,c0aede,d1d4f9';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('techni_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('techni_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('techni_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    // Basic validation
    if (!email || !password) {
      return { success: false, message: 'Wypełnij wszystkie pola' };
    }

    try {
      const result = await loginUserApi(email, password);
      if (result && result.user) {
        const loggedUser: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl || DEFAULT_AVATAR,
        };
        setUser(loggedUser);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'Nieprawidłowe dane logowania' };
    } catch (err: any) {
      console.error('Błąd logowania w API:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      return {
        success: false,
        message: serverMsg || 'Błąd połączenia z serwerem. Upewnij się, że backend jest uruchomiony.',
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!name || !email || !password) {
      return { success: false, message: 'Wypełnij wszystkie wymagane pola' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Hasło musi mieć co najmniej 6 znaków' };
    }

    try {
      const result = await registerUserApi(name, email, password);
      if (result && result.user) {
        const loggedUser: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl || DEFAULT_AVATAR,
        };
        setUser(loggedUser);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'Nie udało się zarejestrować konta' };
    } catch (err: any) {
      console.error('Błąd rejestracji w API:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      return {
        success: false,
        message: serverMsg || 'Błąd połączenia z serwerem. Upewnij się, że backend jest uruchomiony.',
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
