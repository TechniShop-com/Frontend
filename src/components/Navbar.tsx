import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Search, ChevronDown, Check, User, LogOut } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  activeBrand?: string;
  setActiveBrand?: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [navSearch, setNavSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category') || 'all';
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Scroll detection: become 75% translucent on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#EFECE4]/75 backdrop-blur-md border-[#E2DDD3]/80 shadow-xs'
          : 'bg-[#EFECE4] border-[#E2DDD3]'
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        {/* Center Navigation Links & Produkty Dropdown */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-extrabold">
          <Link
            to="/"
            className={`transition-all duration-200 hover:scale-105 ${
              location.pathname === '/' && activeCategory === 'all' && !searchParams.get('search')
                ? 'text-purple-700 font-black'
                : 'text-slate-700 hover:text-purple-600'
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
              className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-xl text-sm font-extrabold transition-all duration-200 hover:scale-105 cursor-pointer ${
                location.pathname.startsWith('/product') || activeCategory === 'kobiety' || activeCategory === 'mezczyzni'
                  ? 'text-purple-700 font-black'
                  : 'text-slate-700 hover:text-purple-600'
              }`}
            >
              <span>Produkty</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-purple-600' : 'text-slate-500'
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#E2DDD3] rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    activeCategory === 'all'
                      ? 'text-purple-600 font-bold bg-purple-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>Wszystkie produkty</span>
                  {activeCategory === 'all' && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => handleCategorySelect('kobiety')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    activeCategory === 'kobiety'
                      ? 'text-purple-600 font-bold bg-purple-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>Kobiety</span>
                  {activeCategory === 'kobiety' && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </button>

                <button
                  onClick={() => handleCategorySelect('mezczyzni')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    activeCategory === 'mezczyzni'
                      ? 'text-purple-600 font-bold bg-purple-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>Mężczyźni</span>
                  {activeCategory === 'mezczyzni' && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Search Input, Cart Trigger & User Auth Avatar */}
        <div className="flex items-center space-x-3.5 sm:space-x-5 lg:space-x-6">
          {/* Modern Sleek Search */}
          <div className="relative hidden sm:block w-44 lg:w-60 group">
            <form onSubmit={handleSearchSubmit}>
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj produktów..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#E4DFD5] hover:bg-[#DDD8CD] focus:bg-white text-slate-800 placeholder:text-slate-500 font-medium rounded-full border border-[#DDD8CD] focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 shadow-xs transition-all duration-200"
              />
            </form>
          </div>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E4DFD5] hover:bg-[#DDD8CD] text-slate-700 hover:text-purple-600 border border-[#DDD8CD] hover:border-purple-300 shadow-xs hover:shadow transition-all duration-200 group active:scale-95 cursor-pointer"
            title="Koszyk"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-purple-600 group-hover:scale-105 transition-all" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#EFECE4]">
                {totalCount}
              </span>
            )}
          </Link>

          {/* User Auth: Avatar if logged in, "Zaloguj się" if not logged in */}
          {!user ? (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-xs transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-purple-200" />
              <span>Zaloguj się</span>
            </Link>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[2px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 shadow-md hover:shadow-purple-600/30 hover:scale-105 transition-all flex items-center justify-center focus:outline-none"
                title={`Konto: ${user.name}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=TechniHuman&backgroundColor=b6e3f4,c0aede,d1d4f9'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E2DDD3] rounded-2xl shadow-2xl shadow-slate-900/10 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-100">
                  <div className="pb-3 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-100 ring-2 ring-purple-200 flex-shrink-0">
                      <img
                        src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=TechniHuman'}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden text-left">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Wyloguj się</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
