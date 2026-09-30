import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Logo } from './components/Logo';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

export const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
          <div className="flex-1">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Routes>
            </main>
          </div>

          {/* SINGLE UNIFIED CLEAN PURPLE & WHITE FOOTER BAR */}
          <footer className="bg-white/95 backdrop-blur-xl border-t border-purple-100 shadow-xl shadow-purple-900/5 py-10 px-6 relative overflow-hidden mt-12">
            {/* Subtle Purple Background Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-24 bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-xs">
              
              {/* Brand Logo & Name */}
              <Link to="/" className="shrink-0">
                <Logo size="md" showSubtitle />
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8 font-extrabold text-slate-700">
                <Link to="/" className="hover:text-purple-600 transition-colors duration-200 hover:scale-105">
                  Strona Główna
                </Link>
                <Link to="/products" className="hover:text-purple-600 transition-colors duration-200 hover:scale-105">
                  Produkty
                </Link>
                <Link to="/cart" className="hover:text-purple-600 transition-colors duration-200 hover:scale-105">
                  Koszyk
                </Link>
                <Link to="/checkout" className="hover:text-purple-600 transition-colors duration-200 hover:scale-105">
                  Płatność i Dostawa
                </Link>
              </div>

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
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
