import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { Search, PackageCheck, Clock, CheckCircle2, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const OrderStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inputOrderNumber, setInputOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/orders/${num.trim()}`);
      setOrder(res.data);
    } catch (err: any) {
      setError('Nie znaleziono zamówienia o podanym numerze. Sprawdź i spróbuj ponownie.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramNum = searchParams.get('orderNumber');
    if (paramNum) {
      setInputOrderNumber(paramNum);
      fetchOrderDetails(paramNum);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(inputOrderNumber);
  };

  const getFulfillmentLabel = (status: string) => {
    switch (status) {
      case 'NEW':
        return { label: 'Nowe (Oczekuje na realizację)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'IN_REALIZATION':
        return { label: 'W realizacji (Kompletowanie produktów)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'READY_FOR_PICKUP':
        return { label: 'Gotowe do odbioru w szkole!', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
      case 'SHIPPED':
        return { label: 'Wysłane przewoźnikiem', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'COMPLETED':
        return { label: 'Zakończone (Odebrane)', color: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'CANCELLED':
        return { label: 'Anulowane', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sprawdź Status Zamówienia</h1>
        <p className="text-xs text-gray-400">
          Wpisz unikalny numer zamówienia (np. TS-2026-1234), aby zobaczyć jego status płatności oraz etap realizacji.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              required
              placeholder="Wpisz numer zamówienia (np. TS-2026-4581)"
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {loading ? '...' : 'Szukaj'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Zamówienie #</span>
                <span className="text-xl font-mono font-extrabold text-gray-900">{order.orderNumber}</span>
                <span className="text-xs text-gray-500 block mt-0.5">Złożone: {new Date(order.createdAt).toLocaleString('pl-PL')}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Fulfillment Badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs border ${getFulfillmentLabel(order.fulfillmentStatus).color}`}>
                  {getFulfillmentLabel(order.fulfillmentStatus).label}
                </span>

                {/* Payment Badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Płatność: {order.paymentStatus === 'PAID' ? 'Opłacona' : 'Oczekuje'}
                </span>
              </div>
            </div>

            {/* Timeline of Status History */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Historia zmian statusu:</h3>
              <div className="space-y-3 relative pl-6 border-l-2 border-emerald-500/30">
                {order.statusHistory.map((hist) => (
                  <div key={hist.id} className="relative group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/30"></div>
                    <div className="text-xs">
                      <span className="font-bold text-gray-900">
                        {getFulfillmentLabel(hist.newStatus).label}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-2 font-mono">
                        {new Date(hist.createdAt).toLocaleString('pl-PL')} ({hist.changedBy})
                      </span>
                      {hist.note && <p className="text-xs text-gray-600 mt-0.5 bg-gray-50 p-2 rounded-lg">{hist.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items & Shipping Summary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Zawartość Przesyłki</h3>

            <div className="space-y-3 divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{item.productName}</span>
                    <span className="text-gray-500 text-[11px]">{item.quantity} szt. ({item.variantInfo})</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.totalPrice.toFixed(2)} zł</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">Kwota całkowita z dostawą:</span>
              <span className="text-base font-extrabold text-emerald-600">{order.finalAmount.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
