import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, GraduationCap, Laptop, Sparkles, Zap } from 'lucide-react';

interface NavbarProps {
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeBrand, setActiveBrand }) => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState('');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(navSearch)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin-slow" />
            T
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Techni<span className="text-purple-600">Shop</span>
            </span>
            <div className="text-[10px] text-purple-600 font-bold tracking-widest uppercase -mt-0.5 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-500 animate-bounce" />
              <span>{activeBrand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}</span>
            </div>
          </div>
        </Link>

        {/* Center Navigation Links & Brand Switcher */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-extrabold">
          <Link
            to="/"
            className={`transition-all duration-300 hover:scale-105 ${
              location.pathname === '/' ? 'text-purple-600 font-black border-b-2 border-purple-600 pb-1' : 'text-gray-700 hover:text-purple-600'
            }`}
          >
            Oferta
          </Link>

          {/* Brand Switcher Pills */}
          <div className="flex items-center space-x-1 bg-purple-50 p-1 rounded-full border border-purple-100 text-xs font-bold shadow-inner">
            <button
              onClick={() => setActiveBrand('TECHNI_SCHOOLS')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                activeBrand === 'TECHNI_SCHOOLS'
                  ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 scale-105'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 animate-bounce" />
              <span>Techni Schools</span>
            </button>

            <button
              onClick={() => setActiveBrand('TECHNI_ZDALNI')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                activeBrand === 'TECHNI_ZDALNI'
                  ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 scale-105'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 animate-bounce" />
              <span>Techni Zdalni</span>
            </button>
          </div>
        </div>

        {/* Right Search Input & Cart Trigger (Matching Reference Image) */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
            <input
              type="text"
              placeholder="Szukaj..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-purple-50/70 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-gray-800 font-medium transition-all"
            />
          </form>

          <Link
            to="/cart"
            className="flex items-center space-x-2 p-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all duration-300 relative group hover:scale-110 shadow-sm border border-purple-100"
          >
            <ShoppingBag className="w-5 h-5 text-purple-600 group-hover:rotate-12 group-hover:scale-125 transition-transform animate-bounce" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white font-black text-xs rounded-full flex items-center justify-center shadow-md shadow-purple-600/40 animate-bounce">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
