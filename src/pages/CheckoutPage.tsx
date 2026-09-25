import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BLIK / Karta Online');
  const [isOrdered, setIsOrdered] = useState(false);

  if (isOrdered) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-purple-100 rounded-3xl space-y-4 my-10 shadow-2xl shadow-purple-900/10 text-slate-900 animate-float">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto border border-purple-200 shadow-lg shadow-purple-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">✓ Zamówienie Złożone!</h2>
        <p className="text-xs text-slate-600 font-medium">
          Dziękujemy {name}. Zamówienie na kwotę <strong className="text-purple-700 font-mono text-sm">{totalPrice.toFixed(2)} zł</strong> zostało przyjęte do realizacji.
        </p>
        <button
          onClick={() => {
            clearCart();
            window.location.href = '/';
          }}
          className="px-6 py-3 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/25 hover:scale-105 transition-all"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-purple-100 rounded-3xl my-10 text-slate-900 shadow-xl">
        <p className="text-xs font-bold text-slate-600">Koszyk jest pusty.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 pt-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Płatność i Dostawa</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-purple-900/5 text-xs text-slate-900 animate-pulse-glow">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Imię i Nazwisko *</label>
          <input
            type="text"
            required
            placeholder="np. Jan Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 bg-gray-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
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
            className="w-full p-3.5 bg-gray-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
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
            className="w-full p-3.5 bg-gray-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">Forma Płatności *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3.5 bg-gray-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
          >
            <option value="BLIK / Karta Online">Szybka płatność BLIK / Karta Online</option>
            <option value="Przelew">Przelew bankowy</option>
            <option value="Przy odbiorze w szkole">Odbiór osobisty w szkole (0 zł)</option>
          </select>
        </div>

        <div className="border-t border-purple-100 pt-5 space-y-4">
          <div className="flex justify-between font-bold text-sm text-slate-900">
            <span>Suma do zapłaty:</span>
            <span className="text-xl font-black text-purple-700">{totalPrice.toFixed(2)} zł</span>
          </div>
          <button
            type="submit"
            className="w-full py-4 px-6 text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] animate-pulse-glow"
          >
            <span>Zapłać i Zakończ Zamówienie</span>
            <ArrowRight className="w-4 h-4 animate-bounce" />
          </button>
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-purple-600/80 pt-1 font-semibold">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Bezpieczne Płatności z Szyfrowaniem SSL</span>
          </div>
        </div>
      </form>
    </div>
  );
};
