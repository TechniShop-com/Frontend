import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    totalPrice,
    removeFromCart,
    updateQuantity,
    isCartDrawerOpen,
    closeCartDrawer,
  } = useCart();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 200;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const progressPercent = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const deliveryCost = isFreeShipping || totalPrice === 0 ? 0 : 14.99;
  const totalWithShipping = totalPrice + deliveryCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E3DDD2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E3DDD2] bg-[#EFECE4] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">Twój Koszyk</h2>
              <span className="text-xs px-2.5 py-0.5 bg-white text-purple-700 font-extrabold rounded-full border border-[#DDD8CD] shadow-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCartDrawer}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-[#DDD8CD] text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Free Shipping Progress Bar (Zalando / Reserved standard) */}
          <div className="px-5 py-3.5 bg-[#F2EDE2] border-b border-[#E3DDD2]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Masz DARMOWĄ dostawę!
                  </span>
                ) : (
                  <span>
                    Brakuje Ci <strong className="text-purple-700 font-black">{remainingForFreeShipping.toFixed(2)} zł</strong> do darmowej dostawy
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#DDD8CD] overflow-hidden">
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

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#EAE4D9]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shadow-xs">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Twój koszyk jest pusty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Odkryj najnowszą kolekcję odzieży i akcesoriów Techni.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/products');
                  }}
                  className="px-5 py-2.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Przeglądaj produkty
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="py-3.5 first:pt-0 flex items-start space-x-3.5">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-20 object-cover rounded-xl border border-[#E3DDD2] bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Kolor: <span className="font-bold text-slate-700">{item.selectedColor}</span> | Rozmiar:{' '}
                      <span className="font-bold text-purple-700">{item.selectedSize}</span>
                    </p>
                    <div className="text-xs font-black text-purple-700 mt-1">
                      {(item.product.price * item.quantity).toFixed(2)} zł
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#DDD8CD] rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          title="Zmniejsz ilość"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          title="Zwiększ ilość"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Usuń pozycję"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#F2EDE2] border-t border-[#E3DDD2] space-y-3">
              {/* Financial summary breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Wartość produktów:</span>
                  <span className="font-bold text-slate-800">{totalPrice.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Dostawa do Paczkomatu:</span>
                  </span>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-extrabold">0.00 zł (Darmowa)</span>
                    ) : (
                      <span>14.99 zł</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-[#DDD8CD] pt-2 flex justify-between items-baseline text-sm">
                  <span className="font-black text-slate-900">Do zapłaty:</span>
                  <span className="text-xl font-black text-purple-700">
                    {totalWithShipping.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-xs text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>PRZEJDŹ DO KASY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 hover:text-purple-700 bg-white hover:bg-slate-50 border border-[#DDD8CD] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>Zobacz pełny koszyk</span>
                </button>
              </div>

              {/* Polish Trust Bar */}
              <div className="pt-2 border-t border-[#E0DACD] flex items-center justify-center space-x-4 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  InPost Paczkomat 24/7
                </span>
                <span>&bull;</span>
                <span className="text-purple-700 font-extrabold">BLIK</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Szybki zwrot 14 dni
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
