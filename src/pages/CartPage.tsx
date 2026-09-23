import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Koszyk Zakupowy</h1>

      {cart.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center space-y-3">
          <p className="text-sm font-medium text-gray-600">Koszyk jest obecnie pusty.</p>
          <Link to="/" className="inline-block px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg">
            Przejdź do oferty
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="space-y-3 divide-y">
            {cart.map((item, index) => (
              <div key={index} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{item.product.title}</h4>
                  <p className="text-gray-500">
                    Kolor: <span className="font-semibold text-gray-800">{item.selectedColor}</span> | Rozmiar:{' '}
                    <span className="font-semibold text-gray-800">{item.selectedSize}</span> | Ilość:{' '}
                    <span className="font-semibold text-gray-800">{item.quantity}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-sm text-gray-900">
                    {(item.product.price * item.quantity).toFixed(2)} zł
                  </span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">Razem do zapłaty:</span>
            <span className="text-xl font-extrabold text-emerald-600">{totalPrice.toFixed(2)} zł</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Przejdź do Płatności i Dostawy →
          </button>
        </div>
      )}
    </div>
  );
};
