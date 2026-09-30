import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, ChevronDown, Sparkle, User, Users } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  activeBrand?: string;
  setActiveBrand?: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [navSearch, setNavSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category') || 'all';
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch)}`);
    }
  };

  const handleCategorySelect = (category: string) => {
    setIsDropdownOpen(false);
    if (category === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${category}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        {/* Center Navigation Links & Produkty Dropdown */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-extrabold">
          <Link
            to="/"
            className={`transition-all duration-300 hover:scale-105 ${
              location.pathname === '/' && activeCategory === 'all' && !searchParams.get('search')
                ? 'text-purple-600 font-black'
                : 'text-gray-700 hover:text-purple-600'
            }`}
          >
            Strona Główna
          </Link>

          {/* PRODUKTY DROPDOWN (Kobiety / Mężczyźni) */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center space-x-1.5 py-2 px-3 rounded-xl transition-all duration-300 ${
                activeCategory === 'kobiety' || activeCategory === 'mezczyzni'
                  ? 'text-purple-600 bg-purple-50 font-black'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/60'
              }`}
            >
              <span>Produkty</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180 text-purple-600' : 'text-gray-400'
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 backdrop-blur-2xl border border-purple-100 rounded-2xl shadow-2xl shadow-purple-900/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-purple-50">
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === 'all'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>Wszystkie Produkty</span>
                    </div>
                  </button>
                </div>

                <div className="p-1 space-y-1">
                  {/* Kobiety */}
                  <button
                    onClick={() => handleCategorySelect('kobiety')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === 'kobiety'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      <span>Kobiety</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold">
                      Damskie
                    </span>
                  </button>

                  {/* Mężczyźni */}
                  <button
                    onClick={() => handleCategorySelect('mezczyzni')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === 'mezczyzni'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span>Mężczyźni</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">
                      Męskie
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Search Input & Cart Trigger */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
            <input
              type="text"
              placeholder="Szukaj produktów..."
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
