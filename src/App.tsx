import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

export const App: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState('TECHNI_SCHOOLS');

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
          <div className="flex-1">
            <Navbar activeBrand={activeBrand} setActiveBrand={setActiveBrand} />
            <main>
              <Routes>
                <Route path="/" element={<HomePage activeBrand={activeBrand} />} />
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
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all duration-300">
                  T
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 block">
                    Techni<span className="text-purple-600">Shop</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold tracking-wide">
                    Techni Schools & Techni Zdalni
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8 font-extrabold text-slate-700">
                <Link to="/" className="hover:text-purple-600 transition-colors duration-200 hover:scale-105">
                  Strona Główna
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
