import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          <div>
            <Navbar activeBrand={activeBrand} setActiveBrand={setActiveBrand} />
            <main className="pb-16">
              <Routes>
                <Route path="/" element={<HomePage activeBrand={activeBrand} />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Routes>
            </main>
          </div>

          <footer className="bg-slate-950 text-purple-200/80 text-xs py-8 px-6 border-t border-purple-900/30 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-24 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 font-medium">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="font-extrabold text-white tracking-wide">TechniShop</span>
                <span className="text-purple-400">|</span>
                <span>Techni Schools & Techni Zdalni</span>
              </div>
              <p className="text-[11px] text-purple-300/60">
                © 2026 TechniShop — Design Expert Purple & White Animated Edition
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
