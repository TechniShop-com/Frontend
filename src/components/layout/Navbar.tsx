import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShieldCheck, RefreshCw, Sparkles, GraduationCap, Laptop } from 'lucide-react';
import { useBrandTheme } from '../../context/BrandThemeContext';
import { useCart } from '../../context/CartContext';
import { BrandType } from '../../types';

export const Navbar: React.FC = () => {
  const { activeBrand, setActiveBrand, brandStyles } = useBrandTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  const handleBrandClick = (brand: BrandType) => {
    setActiveBrand(brand);
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Banner with Brand Tabs */}
      <div className="bg-slate-950 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1 sm:space-x-4">
            <span className="text-gray-400 font-medium mr-2 hidden sm:inline">Wybierz kolekcję:</span>
            
            <button
              onClick={() => handleBrandClick('TECHNI_SCHOOLS')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                activeBrand === 'TECHNI_SCHOOLS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-gray-300 hover:text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Techni Schools</span>
            </button>

            <button
              onClick={() => handleBrandClick('TECHNI_ZDALNI')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                activeBrand === 'TECHNI_ZDALNI'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : 'text-gray-300 hover:text-cyan-400 hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Techni Zdalni</span>
            </button>

            <button
              onClick={() => handleBrandClick('ALL')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full font-medium transition-all ${
                activeBrand === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wszystkie Produkty</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 text-gray-300">
            <Link to="/status" className="hover:text-emerald-400 flex items-center space-x-1 transition-colors">
              <RefreshCw className="w-3 h-3" />
              <span>Sprawdź Zamówienie</span>
            </Link>
            <Link to="/claims" className="hover:text-cyan-400 transition-colors">
              Zwroty i Reklamacje
            </Link>
            <Link to="/admin" className="hover:text-purple-400 flex items-center space-x-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Admina</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`${brandStyles.navbarBg} transition-colors duration-300 px-4 py-3.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg group-hover:scale-105 transition-transform">
              T
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">Techni<span className={brandStyles.brandColor}>Shop</span></span>
              <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase -mt-1">
                {activeBrand === 'TECHNI_SCHOOLS' && 'Dla Uczniów Techni Schools'}
                {activeBrand === 'TECHNI_ZDALNI' && 'Dla Techni Zdalnych'}
                {activeBrand === 'ALL' && 'Oficjalny Merch Techni'}
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 font-medium text-sm">
            <Link
              to="/"
              className={`transition-colors ${location.pathname === '/' ? brandStyles.brandColor : 'text-gray-300 hover:text-white'}`}
            >
              Strona Główna
            </Link>
            <Link
              to="/catalog"
              className={`transition-colors ${location.pathname === '/catalog' ? brandStyles.brandColor : 'text-gray-300 hover:text-white'}`}
            >
              Katalog Odzieży
            </Link>
            <a
              href="https://technischools.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-colors text-xs"
            >
              technischools.com ↗
            </a>
            <a
              href="https://www.technizdalni.com/"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-xs"
            >
              technizdalni.com ↗
            </a>
          </div>

          {/* Search & Cart Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-all hover:scale-105 shadow-md flex items-center justify-center"
              aria-label="Koszyk"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${brandStyles.buttonBg} text-white font-bold text-xs flex items-center justify-center animate-pulse`}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
