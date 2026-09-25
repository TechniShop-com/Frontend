import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-white tracking-tight">Koszyk Zakupowy</h1>

      {cart.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-2xl p-12 rounded-3xl border border-cyan-500/20 text-center space-y-3 shadow-2xl">
          <ShoppingBag className="w-12 h-12 mx-auto text-cyan-400 stroke-[1.5]" />
          <p className="text-sm font-medium text-cyan-100/70">Koszyk jest obecnie pusty.</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
          >
            Przejdź do oferty
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
          <div className="space-y-4 divide-y divide-cyan-500/10">
            {cart.map((item, index) => (
              <div key={index} className="pt-4 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-xl border border-white/10 bg-slate-950"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{item.product.title}</h4>
                    <p className="text-cyan-200/70 text-[11px] mt-0.5">
                      Kolor: <span className="font-bold text-white">{item.selectedColor}</span> | Rozmiar:{' '}
                      <span className="font-bold text-white">{item.selectedSize}</span> | Ilość:{' '}
                      <span className="font-bold text-white">{item.quantity} szt.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-black text-sm text-cyan-300">
                    {(item.product.price * item.quantity).toFixed(2)} zł
                  </span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-gray-400 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-cyan-500/20 pt-4 flex justify-between items-center text-sm">
            <span className="font-semibold text-cyan-200/80">Razem do zapłaty:</span>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-sky-400">
              {totalPrice.toFixed(2)} zł
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.01]"
          >
            <span>Przejdź do Płatności i Dostawy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
