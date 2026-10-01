import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Search,
  ChevronDown,
  Check,
  User,
  LogOut,
  Sparkles,
  Heart,
  Zap,
  ArrowRight,
  Flame,
  Package,
  Settings,
} from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  activeBrand?: string;
  setActiveBrand?: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { cart, openCartDrawer } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [navSearch, setNavSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category') || 'all';
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleDropdownOpen = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

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
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
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
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
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

          {/* PRODUKTY DROPDOWN (Nowy, luksusowy Mega-Dropdown) */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleDropdownOpen}
            onMouseLeave={handleDropdownClose}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onMouseEnter={handleDropdownOpen}
              className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                isDropdownOpen
                  ? 'bg-[#E4DFD5] text-purple-700 shadow-xs'
                  : location.pathname.startsWith('/product') ||
                    activeCategory === 'kobiety' ||
                    activeCategory === 'mezczyzni' ||
                    activeCategory === 'akcesoria'
                  ? 'text-purple-700 font-black'
                  : 'text-slate-700 hover:text-purple-600 hover:bg-[#E4DFD5]/50'
              }`}
            >
              <span>Produkty</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-purple-600' : 'text-slate-500'
                }`}
              />
            </button>

            {/* Rich Mega-Dropdown Menu Popup with Safe Invisible Padding Bridge */}
            {isDropdownOpen && (
              <div
                className="absolute top-full -left-10 lg:-left-20 pt-2 w-[540px] sm:w-[590px] z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                onMouseEnter={handleDropdownOpen}
                onMouseLeave={handleDropdownClose}
              >
                <div className="bg-[#FAF8F5] border border-[#E3DDD2] rounded-3xl shadow-2xl shadow-purple-950/15 overflow-hidden">
                  <div className="grid grid-cols-12 divide-x divide-[#EAE4D9]">
                  {/* Left Column: Categories List */}
                  <div className="col-span-7 p-4 space-y-1.5">
                    <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-[#EAE4D9]">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Kolekcje & Asortyment</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-[#EFECE4] px-2 py-0.5 rounded-full">Techni 2026</span>
                    </div>

                    {/* Wszystkie produkty */}
                    <button
                      onClick={() => handleCategorySelect('all')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left group cursor-pointer ${
                        activeCategory === 'all' && location.pathname === '/products'
                          ? 'bg-white shadow-xs ring-1 ring-purple-500/20'
                          : 'hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700 transition-colors">
                            Wszystkie Produkty
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Pełny katalog i nowości</div>
                        </div>
                      </div>
                      {activeCategory === 'all' && location.pathname === '/products' ? (
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>

                    {/* Dla Kobiet */}
                    <button
                      onClick={() => handleCategorySelect('kobiety')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left group cursor-pointer ${
                        activeCategory === 'kobiety'
                          ? 'bg-white shadow-xs ring-1 ring-purple-500/20'
                          : 'hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all duration-200">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700 transition-colors">
                            Dla Kobiet
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Dopasowane polo, t-shirty</div>
                        </div>
                      </div>
                      {activeCategory === 'kobiety' ? (
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>

                    {/* Dla Mężczyzn */}
                    <button
                      onClick={() => handleCategorySelect('mezczyzni')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left group cursor-pointer ${
                        activeCategory === 'mezczyzni'
                          ? 'bg-white shadow-xs ring-1 ring-purple-500/20'
                          : 'hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700 transition-colors">
                            Dla Mężczyzn
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Klasyczne bluzy, t-shirty dev</div>
                        </div>
                      </div>
                      {activeCategory === 'mezczyzni' ? (
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>

                    {/* Akcesoria & Gadżety */}
                    <button
                      onClick={() => handleCategorySelect('akcesoria')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left group cursor-pointer ${
                        activeCategory === 'akcesoria'
                          ? 'bg-white shadow-xs ring-1 ring-purple-500/20'
                          : 'hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700 transition-colors">
                            Akcesoria & Tech
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Plecaki 24L, butelki, czapki</div>
                        </div>
                      </div>
                      {activeCategory === 'akcesoria' ? (
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>

                  {/* Right Column: Featured Spotlight Card */}
                  <div className="col-span-5 p-4 flex flex-col justify-between bg-gradient-to-b from-[#F3EFE7] to-[#EAE4D9]/50">
                    <div
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/product/hoodie-1');
                      }}
                      className="relative h-full w-full rounded-2xl overflow-hidden cursor-pointer group/card flex flex-col justify-between p-3.5 bg-slate-900 border border-purple-500/20 shadow-md min-h-[220px]"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"
                        alt="Bluza Hoodie Techni Signature"
                        className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover/card:scale-105 group-hover/card:opacity-55 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3 text-yellow-300" /> Bestseller
                        </span>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">Wybór Sezonu</span>
                        <h4 className="text-xs font-black text-white group-hover/card:text-purple-200 transition-colors leading-snug">
                          Bluza Hoodie Signature
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-extrabold text-white">159.99 zł</span>
                          <span className="inline-flex items-center text-[10px] font-black text-purple-300 group-hover/card:text-white transition-colors">
                            Sprawdź <ArrowRight className="w-3 h-3 ml-1 group-hover/card:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
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
          <button
            onClick={openCartDrawer}
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E4DFD5] hover:bg-[#DDD8CD] text-slate-700 hover:text-purple-600 border border-[#DDD8CD] hover:border-purple-300 shadow-xs hover:shadow transition-all duration-200 group active:scale-95 cursor-pointer"
            title="Otwórz koszyk"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-purple-600 group-hover:scale-105 transition-all" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#EFECE4]">
                {totalCount}
              </span>
            )}
          </button>

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
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50/70 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-600" />
                      <span>Ustawienia konta</span>
                    </Link>
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
