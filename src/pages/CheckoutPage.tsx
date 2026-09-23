import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BLIK / Karta Online');
  const [isOrdered, setIsOrdered] = useState(false);

  if (isOrdered) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border rounded-2xl space-y-4 my-10 shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-600">✓ Zamówienie Złożone!</h2>
        <p className="text-xs text-gray-600">
          Dziękujemy {name}. Zamówienie na kwotę <strong>{totalPrice.toFixed(2)} zł</strong> zostało opłacone i przyjęte do realizacji.
        </p>
        <button
          onClick={() => {
            clearCart();
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
        >
          Wróć do sklepu
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border rounded-2xl my-10">
        <p className="text-xs font-bold text-gray-700">Koszyk jest pusty.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Płatność i Dostawa (Mock Frontend)</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-gray-700 mb-1">Imię i Nazwisko *</label>
          <input
            type="text"
            required
            placeholder="np. Jan Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Adres Email *</label>
          <input
            type="email"
            required
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Adres Dostawy *</label>
          <input
            type="text"
            required
            placeholder="ul. Szkolna 10/2, Warszawa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Forma Płatności *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-white"
          >
            <option value="BLIK / Karta Online">Szybka płatność BLIK / Karta</option>
            <option value="Przelew">Przelew bankowy</option>
            <option value="Przy odbiorze w szkole">Odbiór osobisty w szkole (0 zł)</option>
          </select>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-bold text-sm text-gray-900">
            <span>Suma do zapłaty:</span>
            <span className="text-emerald-600">{totalPrice.toFixed(2)} zł</span>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Zapłać i Zakończ Zamówienie
          </button>
        </div>
      </form>
    </div>
  );
};
