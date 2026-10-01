import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Truck,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const freeShippingThreshold = 200;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const progressPercent = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));
  const deliveryCost = isFreeShipping || totalPrice === 0 ? 0 : 14.99;
  const totalWithShipping = totalPrice + deliveryCost;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pt-8">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E2D8]">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
          <span>Koszyk Zakupowy</span>
          <span className="text-xs px-3 py-1 bg-[#EFECE4] text-purple-700 font-extrabold rounded-full border border-[#DDD8CD]">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} szt.
          </span>
        </h1>
        <Link
          to="/products"
          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1 hover:underline"
        >
          <span>Kontynuuj zakupy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-[#E7E2D8] text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Twój koszyk jest obecnie pusty</h3>
            <p className="text-xs text-slate-500 font-medium">Nie masz jeszcze żadnych produktów w koszyku.</p>
          </div>
          <Link
            to="/products"
            className="inline-block px-8 py-3.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-xs transition-colors"
          >
            Przejdź do kolekcji
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Items Column (7 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Bar */}
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" /> Kwalifikujesz się do DARMOWEJ DOSTAWY do Paczkomatu!
                    </span>
                  ) : (
                    <span>
                      Dodaj produkty za <strong className="text-purple-700 font-black">{remainingForFreeShipping.toFixed(2)} zł</strong>, aby otrzymać darmową dostawę
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAE4D9] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs divide-y divide-[#EAE4D9]">
              {cart.map((item, index) => (
                <div key={index} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                        {item.product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5">
                        {item.product.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1 font-medium">
                        Kolor: <span className="font-bold text-slate-800">{item.selectedColor}</span> &bull; Rozmiar:{' '}
                        <span className="font-bold text-purple-700">{item.selectedSize}</span>
                      </p>
                      <div className="sm:hidden text-sm font-black text-purple-700 mt-2">
                        {(item.product.price * item.quantity).toFixed(2)} zł
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border border-[#DDD8CD] rounded-xl bg-[#FAF8F5] p-1">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#DDD8CD] text-slate-700 font-bold flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        title="Zmniejsz ilość"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#DDD8CD] text-slate-700 font-bold flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        title="Zwiększ ilość"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="hidden sm:block font-black text-base text-purple-700 min-w-20 text-right">
                      {(item.product.price * item.quantity).toFixed(2)} zł
                    </span>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-slate-400 hover:text-rose-500 p-2 transition-colors hover:scale-110 cursor-pointer"
                      title="Usuń pozycję z koszyka"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-[#EAE4D9]">
                Podsumowanie Płatności
              </h3>

              <div className="space-y-2 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Wartość koszyka:</span>
                  <span className="font-bold text-slate-900">{totalPrice.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span>Dostawa do Paczkomatu:</span>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-extrabold">0.00 zł (Darmowa)</span>
                    ) : (
                      '14.99 zł'
                    )}
                  </span>
                </div>

                <div className="border-t border-[#DDD8CD] pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-black text-slate-900">Razem do zapłaty:</span>
                  <span className="text-2xl font-black text-purple-700">
                    {totalWithShipping.toFixed(2)} zł
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-6 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>PRZEJDŹ DO KASY</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#EAE4D9] space-y-2 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block shrink-0" />
                  <span>Dostawa InPost Paczkomat 24/7 w 24h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Płatności BLIK & PayPo (Kup teraz, zapłać za 30 dni)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>14 dni na darmowy zwrot w całej Polsce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
