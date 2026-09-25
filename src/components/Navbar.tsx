import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, GraduationCap, Laptop } from 'lucide-react';

interface NavbarProps {
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeBrand, setActiveBrand }) => {
  const { cart } = useCart();
  const location = useLocation();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg group-hover:scale-105 transition-transform">
            T
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">
              Techni<span className={activeBrand === 'TECHNI_ZDALNI' ? 'text-cyan-400' : 'text-emerald-400'}>Shop</span>
            </span>
            <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase -mt-0.5">
              {activeBrand === 'TECHNI_ZDALNI' ? 'Dla Techni Zdalnych' : 'Dla Uczniów Techni Schools'}
            </div>
          </div>
        </Link>

        {/* Brand Selector Tabs */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveBrand('TECHNI_SCHOOLS')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeBrand === 'TECHNI_SCHOOLS'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Techni Schools</span>
          </button>

          <button
            onClick={() => setActiveBrand('TECHNI_ZDALNI')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeBrand === 'TECHNI_ZDALNI'
                ? 'bg-purple-600 text-white shadow-md font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Techni Zdalni</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6 text-sm font-semibold">
          <Link
            to="/"
            className={`transition-colors ${
              location.pathname === '/'
                ? activeBrand === 'TECHNI_ZDALNI'
                  ? 'text-cyan-400 font-bold'
                  : 'text-emerald-400 font-bold'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Oferta
          </Link>

          <Link
            to="/cart"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>Koszyk</span>
            {totalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-500 text-slate-950 font-bold rounded-full animate-pulse">
                {totalCount}
              </span>
            )}
          </Link>

          <Link
            to="/checkout"
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
              activeBrand === 'TECHNI_ZDALNI'
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            Kasa / Płatność
          </Link>
        </nav>
      </div>
    </header>
  );
};
