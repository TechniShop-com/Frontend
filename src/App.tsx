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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
          <div>
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

          <footer className="bg-slate-900 text-gray-400 text-xs text-center p-4 border-t border-slate-800">
            TechniShop | Techni Schools & Techni Zdalni
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
