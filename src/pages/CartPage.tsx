import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Koszyk Zakupowy</h1>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-3 shadow-sm">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 stroke-[1.5]" />
          <p className="text-sm font-medium text-gray-600">Koszyk jest obecnie pusty.</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Przejdź do oferty
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="space-y-4 divide-y divide-gray-100">
            {cart.map((item, index) => (
              <div key={index} className="pt-4 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-xl border bg-gray-50"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{item.product.title}</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Kolor: <span className="font-semibold text-gray-800">{item.selectedColor}</span> | Rozmiar:{' '}
                      <span className="font-semibold text-gray-800">{item.selectedSize}</span> | Ilość:{' '}
                      <span className="font-semibold text-gray-800">{item.quantity} szt.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-sm text-gray-900">
                    {(item.product.price * item.quantity).toFixed(2)} zł
                  </span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-700">Razem do zapłaty:</span>
            <span className="text-xl font-extrabold text-emerald-600">{totalPrice.toFixed(2)} zł</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <span>Przejdź do Płatności i Dostawy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
