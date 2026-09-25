import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, GraduationCap, Laptop, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeBrand, setActiveBrand }) => {
  const { cart } = useCart();
  const location = useLocation();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 text-white shadow-xl shadow-cyan-950/20 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Spatial Floating Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            T
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-200 to-cyan-400">
              Techni<span className="text-cyan-400">Shop</span>
            </span>
            <div className="text-[10px] text-cyan-300/70 font-semibold tracking-widest uppercase -mt-0.5">
              {activeBrand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
            </div>
          </div>
        </Link>

        {/* Glassmorphic Brand Selector Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-cyan-500/20 text-xs font-semibold backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveBrand('TECHNI_SCHOOLS')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
              activeBrand === 'TECHNI_SCHOOLS'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 scale-105'
                : 'text-gray-300 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Techni Schools</span>
          </button>

          <button
            onClick={() => setActiveBrand('TECHNI_ZDALNI')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
              activeBrand === 'TECHNI_ZDALNI'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25 scale-105'
                : 'text-gray-300 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Techni Zdalni</span>
          </button>
        </div>

        {/* Nav Links with Glass Accent */}
        <nav className="flex items-center space-x-6 text-sm font-semibold">
          <Link
            to="/"
            className={`transition-all duration-300 ${
              location.pathname === '/' ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-gray-300 hover:text-cyan-300'
            }`}
          >
            Oferta
          </Link>

          <Link
            to="/cart"
            className="flex items-center space-x-2 text-gray-300 hover:text-cyan-300 transition-all duration-300 relative group"
          >
            <ShoppingBag className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Koszyk</span>
            {totalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-cyan-400 text-slate-950 font-black rounded-full shadow-lg shadow-cyan-400/40 animate-pulse">
                {totalCount}
              </span>
            )}
          </Link>

          <Link
            to="/checkout"
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all duration-300"
          >
            Kasa / Płatność
          </Link>
        </nav>
      </div>
    </header>
  );
};
