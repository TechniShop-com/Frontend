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

          {/* SINGLE UNIFIED FOOTER BAR */}
          <footer className="bg-slate-950 text-slate-300 py-10 px-6 border-t border-purple-900/30 relative overflow-hidden mt-12">
            <div className="absolute top-0 left-1/4 w-96 h-24 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-xs">
              
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-500/30 animate-pulse">
                  T
                </div>
                <div>
                  <span className="font-extrabold text-white text-sm tracking-wide block">TechniShop</span>
                  <span className="text-[11px] text-purple-300/70 font-medium">Techni Schools & Techni Zdalni</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8 font-extrabold text-slate-300">
                <Link to="/" className="hover:text-purple-400 transition-colors duration-200 hover:scale-105">
                  Strona Główna
                </Link>
                <Link to="/cart" className="hover:text-purple-400 transition-colors duration-200 hover:scale-105">
                  Koszyk
                </Link>
                <Link to="/checkout" className="hover:text-purple-400 transition-colors duration-200 hover:scale-105">
                  Płatność i Dostawa
                </Link>
              </div>

              {/* Copyright */}
              <p className="text-[11px] text-slate-400 font-medium text-center md:text-right">
                © {new Date().getFullYear()} TechniShop — Oficjalny sklep Techni Schools & Techni Zdalni.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
