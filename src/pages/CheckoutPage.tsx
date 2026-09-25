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
      <div className="max-w-xl mx-auto p-8 text-center bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl space-y-4 my-10 shadow-2xl text-white">
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">✓ Zamówienie Złożone!</h2>
        <p className="text-xs text-cyan-100/70">
          Dziękujemy {name}. Zamówienie na kwotę <strong className="text-cyan-300 font-mono">{totalPrice.toFixed(2)} zł</strong> zostało przyjęte do realizacji.
        </p>
        <button
          onClick={() => {
            clearCart();
            window.location.href = '/';
          }}
          className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg shadow-cyan-500/20"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl my-10 text-white">
        <p className="text-xs font-bold text-cyan-200">Koszyk jest pusty.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-white tracking-tight">Płatność i Dostawa</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-xs text-white">
        <div>
          <label className="block font-bold text-cyan-200 mb-1">Imię i Nazwisko *</label>
          <input
            type="text"
            required
            placeholder="np. Jan Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-cyan-200 mb-1">Adres Email *</label>
          <input
            type="email"
            required
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-cyan-200 mb-1">Adres Dostawy *</label>
          <input
            type="text"
            required
            placeholder="ul. Szkolna 10/2, Warszawa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-cyan-200 mb-1">Forma Płatności *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option value="BLIK / Karta Online">Szybka płatność BLIK / Karta Online</option>
            <option value="Przelew">Przelew bankowy</option>
            <option value="Przy odbiorze w szkole">Odbiór osobisty w szkole (0 zł)</option>
          </select>
        </div>

        <div className="border-t border-cyan-500/20 pt-4 space-y-3">
          <div className="flex justify-between font-bold text-sm text-white">
            <span>Suma do zapłaty:</span>
            <span className="text-xl font-black text-cyan-300">{totalPrice.toFixed(2)} zł</span>
          </div>
          <button
            type="submit"
            className="w-full py-4 px-6 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.01]"
          >
            <span>Zapłać i Zakończ Zamówienie</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-cyan-300/70 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bezpieczne Płatności z Szyfrowaniem SSL</span>
          </div>
        </div>
      </form>
    </div>
  );
};
