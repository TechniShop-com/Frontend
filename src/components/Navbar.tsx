import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  activeBrand: string;
  setActiveBrand: (brand: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeBrand, setActiveBrand }) => {
  const { cart } = useCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          Techni<span className={activeBrand === 'TECHNI_ZDALNI' ? 'text-cyan-400' : 'text-emerald-400'}>Shop</span>
          <span className="text-xs ml-2 text-gray-400 font-normal">(Etap 1 - Frontend MVP)</span>
        </Link>

        {/* Brand Selector Buttons */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveBrand('TECHNI_SCHOOLS')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeBrand === 'TECHNI_SCHOOLS' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Techni Schools
          </button>
          <button
            onClick={() => setActiveBrand('TECHNI_ZDALNI')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeBrand === 'TECHNI_ZDALNI' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Techni Zdalni
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-emerald-400 transition-colors">
            Sklep
          </Link>
          <Link to="/cart" className="hover:text-emerald-400 transition-colors relative">
            Koszyk
            {totalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-500 text-slate-950 font-bold rounded-full">
                {totalCount}
              </span>
            )}
          </Link>
          <Link to="/checkout" className="hover:text-emerald-400 transition-colors">
            Kasa / Płatność
          </Link>
        </nav>
      </div>
    </header>
  );
};
