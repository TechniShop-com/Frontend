import React, { useState } from 'react';
import { RotateCcw, ShieldAlert, CheckCircle2, Send } from 'lucide-react';
import axios from 'axios';

export const ClaimsPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'RETURN' | 'COMPLAINT'>('RETURN');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await axios.post('/api/orders/claim', {
        orderNumber,
        email,
        type,
        reason,
      });

      setSuccessMessage(res.data.message || 'Zgłoszenie zostało pomyślnie przyjęte.');
      setOrderNumber('');
      setEmail('');
      setReason('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Wystąpił błąd podczas wysyłania zgłoszenia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Zwroty i Reklamacje Online</h1>
        <p className="text-xs text-gray-500 mt-1">
          Masz niewłaściwy rozmiar lub chcesz zgłosić reklamację? Wypełnij poniższy formularz.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Numer Zamówienia *</label>
              <input
                type="text"
                required
                placeholder="np. TS-2026-4581"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Adres Email z Zamówienia *</label>
              <input
                type="email"
                required
                placeholder="jan.kowalski@technischools.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Typ Zgłoszenia *</label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-800">
                <input
                  type="radio"
                  name="claimType"
                  checked={type === 'RETURN'}
                  onChange={() => setType('RETURN')}
                  className="accent-emerald-600"
                />
                <span>Zwrot Towaru (14 dni)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-800">
                <input
                  type="radio"
                  name="claimType"
                  checked={type === 'COMPLAINT'}
                  onChange={() => setType('COMPLAINT')}
                  className="accent-purple-600"
                />
                <span>Reklamacja (Uszkodzenie / Wada)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Przyczyna i Szczegóły Zgłoszenia *</label>
            <textarea
              required
              rows={4}
              placeholder="Opisz dokładnie powód zwrotu lub wadę fizyczną produktu..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Wysyłanie...' : 'Wyślij Zgłoszenie'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
