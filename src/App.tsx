import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Logo } from './components/Logo';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { useLocation } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
          </Routes>
        </main>
      </div>

      {/* SINGLE UNIFIED CLEAN PURPLE & WHITE FOOTER BAR (Hidden on /login for pure full-screen layout) */}
      {!isAuthPage && (
        <footer className="bg-white/95 backdrop-blur-xl border-t border-purple-100 shadow-xl shadow-purple-900/5 py-6 sm:py-8 px-6 relative overflow-hidden mt-12">
          {/* Subtle Purple Background Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-24 bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-xs">
            {/* Brand Logo & Name */}
            <Link to="/" className="shrink-0">
              <Logo size="md" showSubtitle />
            </Link>

            {/* Copyright & Info */}
            <div className="text-center md:text-right space-y-1">
              <p className="text-[11px] text-slate-500 font-semibold">
                © {new Date().getFullYear()} TechniShop. Wszystkie prawa zastrzeżone.
              </p>
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                Oficjalny Sklep Szkoły i Edukacji Zdalnej
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

