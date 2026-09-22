import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useBrandTheme } from '../../context/BrandThemeContext';
import axios from 'axios';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    discountCode,
    discountAmount,
    setAppliedDiscount,
    finalTotal,
  } = useCart();
  const { brandStyles } = useBrandTheme();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsValidating(true);
    setDiscountError(null);
    setDiscountSuccess(null);

    try {
      const res = await axios.post('/api/products/validate-discount', {
        code: inputCode,
        cartTotal: subtotal,
      });

      setAppliedDiscount(res.data.code, res.data.discountAmount);
      setDiscountSuccess(`Zastosowano kod ${res.data.code} (-${res.data.discountAmount.toFixed(2)} zł)`);
      setInputCode('');
    } catch (err: any) {
      setDiscountError(err.response?.data?.error || 'Nieprawidłowy kod rabatowy');
      setAppliedDiscount(null, 0);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-gray-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Twój Koszyk</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-gray-400 space-y-3">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 stroke-[1.5]" />
                <p className="text-base font-medium">Twój koszyk jest pusty</p>
                <p className="text-xs">Wybierz coś z naszej oferty marek Techni!</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variant.id} className="pt-4 first:pt-0 flex space-x-4">
                  <img
                    src={item.product.imageUrl || item.variant.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.product.title}</h4>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {[item.variant.size && `Rozmiar: ${item.variant.size}`, item.variant.color && `Kolor: ${item.variant.color}`]
                        .filter(Boolean)
                        .join(' | ')}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      {item.variant.price.toFixed(2)} zł
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variant.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Usuń z koszyka"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 space-y-4">
              {/* Discount form */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Kod rabatowy (np. TECHNI10)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isValidating ? '...' : 'Użyj'}
                </button>
              </form>

              {discountError && <p className="text-xs text-red-600 font-medium">{discountError}</p>}
              {discountSuccess && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{discountSuccess}</span>
                </p>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Wartość koszyka:</span>
                  <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} zł</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Rabat ({discountCode}):</span>
                    <span>-{discountAmount.toFixed(2)} zł</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Razem:</span>
                  <span className="text-emerald-600">{finalTotal.toFixed(2)} zł</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckoutClick}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${brandStyles.buttonBg}`}
              >
                <span>Przejdź do kasy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
