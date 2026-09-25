import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pt-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
        <span>Koszyk Zakupowy</span>
        <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 font-extrabold rounded-full border border-purple-200">
          {cart.length} przedmioty
        </span>
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-purple-100 text-center space-y-4 shadow-xl shadow-purple-900/5 animate-float">
          <ShoppingBag className="w-16 h-16 mx-auto text-purple-500 stroke-[1.5] animate-bounce" />
          <p className="text-sm font-semibold text-slate-600">Koszyk jest obecnie pusty.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/25 hover:scale-105 transition-all"
          >
            Przejdź do oferty
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-purple-900/5 text-slate-900 animate-pulse-glow">
          <div className="space-y-4 divide-y divide-purple-100">
            {cart.map((item, index) => (
              <div key={index} className="pt-4 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-xl border border-purple-100 bg-purple-50 hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{item.product.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                      Kolor: <span className="font-bold text-purple-700">{item.selectedColor}</span> | Rozmiar:{' '}
                      <span className="font-bold text-purple-700">{item.selectedSize}</span> | Ilość:{' '}
                      <span className="font-bold text-purple-700">{item.quantity} szt.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-black text-sm text-purple-700">
                    {(item.product.price * item.quantity).toFixed(2)} zł
                  </span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-gray-400 hover:text-red-500 p-1.5 transition-colors hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-100 pt-4 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-600">Razem do zapłaty:</span>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse">
              {totalPrice.toFixed(2)} zł
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 px-6 text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02]"
          >
            <span>Przejdź do Płatności i Dostawy</span>
            <ArrowRight className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
};
