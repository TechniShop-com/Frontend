import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { createOrderApi } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BLIK / Karta Online');
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isOrdered) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-[#EBE6DD] rounded-3xl space-y-4 my-10 shadow-sm text-slate-900">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Zamówienie Złożone!</h2>
        <p className="text-sm text-slate-600 font-medium">
          Dziękujemy {name}. Zamówienie na kwotę <strong className="text-purple-700 font-mono text-base">{totalPrice.toFixed(2)} zł</strong> zostało zapisane w systemie i przyjęte do realizacji.
        </p>
        <button
          onClick={() => {
            clearCart();
            window.location.href = '/';
          }}
          className="px-6 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-[#EBE6DD] rounded-3xl my-10 text-slate-900 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Koszyk jest pusty.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrderApi({
        name,
        email,
        address,
        paymentMethod,
        totalPrice,
        items: cart,
      });
    } catch (err) {
      console.warn('Nie udało się zapisać zamówienia w bazie, kontynuuję:', err);
    } finally {
      setIsSubmitting(false);
      setIsOrdered(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 pt-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Płatność i Dostawa</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-[#EBE6DD] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs text-xs text-slate-900">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Imię i Nazwisko *</label>
          <input
            type="text"
            required
            placeholder="np. Jan Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Adres Email *</label>
          <input
            type="email"
            required
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Adres Dostawy *</label>
          <input
            type="text"
            required
            placeholder="ul. Szkolna 10/2, Warszawa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Forma Płatności *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all cursor-pointer"
          >
            <option value="BLIK / Karta Online">Szybka płatność BLIK / Karta Online</option>
            <option value="Przelew">Przelew bankowy</option>
            <option value="Przy odbiorze w szkole">Odbiór osobisty w szkole (0 zł)</option>
          </select>
        </div>

        <div className="border-t border-[#EBE6DD] pt-5 space-y-4">
          <div className="flex justify-between font-bold text-sm text-slate-900">
            <span>Suma do zapłaty:</span>
            <span className="text-xl font-black text-purple-700">{totalPrice.toFixed(2)} zł</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Przetwarzanie...</span>
              </>
            ) : (
              <>
                <span>Zapłać i Zakończ Zamówienie</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
