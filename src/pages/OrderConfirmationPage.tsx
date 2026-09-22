import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { CheckCircle2, CreditCard, Clock, FileText, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders/${orderNumber}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching order confirmation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleSimulatePayment = async (status: 'PAID' | 'FAILED') => {
    if (!order) return;
    setIsConfirmingPayment(true);
    setPaymentSuccessMessage(null);

    try {
      await axios.post('/api/payments/confirm', {
        orderId: order.id,
        status,
      });

      if (status === 'PAID') {
        setPaymentSuccessMessage('Płatność Stripe została pomyślnie przetworzona i opłacona!');
      }
      await fetchOrder();
    } catch (err) {
      console.error('Error confirming payment:', err);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Zamówienie nie istnieje</h2>
        <Link to="/" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl inline-block">
          Wróć do sklepu
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Dziękujemy za złożenie zamówienia!
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Numer Twojego zamówienia to: <strong className="text-slate-900 text-sm">{order.orderNumber}</strong>.
          Wysłaliśmy potwierdzenie na adres email: <span className="text-slate-900 font-semibold">{order.customerEmail}</span>.
        </p>

        {/* Live Payment Status Banner */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold border">
          {isPaid ? (
            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Status Płatności: OPŁACONA (Stripe)</span>
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Status Płatności: OCZEKUJE NA PŁATNOŚĆ</span>
            </span>
          )}
        </div>
      </div>

      {/* Stripe Test Sandbox Payment Widget */}
      {!isPaid && (
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="font-bold text-base">Bramka Płatności Stripe Sandbox</h3>
              <p className="text-xs text-gray-400">Symuluj natychmiastową akceptację płatności kartą w środowisku testowym.</p>
            </div>
          </div>

          {paymentSuccessMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
              {paymentSuccessMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => handleSimulatePayment('PAID')}
              disabled={isConfirmingPayment}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isConfirmingPayment ? 'Przetwarzanie...' : 'Zapłać teraz (Symulacja Stripe)'}</span>
            </button>

            <button
              onClick={() => handleSimulatePayment('FAILED')}
              disabled={isConfirmingPayment}
              className="px-4 py-3 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 font-semibold text-xs border border-red-800 transition-all flex items-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Symuluj Odrzucenie Płatności</span>
            </button>
          </div>
        </div>
      )}

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Shipping & Billing Details */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Szczegóły Dostawy i Odbioru</h3>

          <div className="text-xs space-y-2 text-gray-600">
            <div>
              <span className="text-gray-400 block font-medium">Odbiorca:</span>
              <span className="font-semibold text-gray-900">{order.customerFirstName} {order.customerLastName}</span>
            </div>

            <div>
              <span className="text-gray-400 block font-medium">Telefon:</span>
              <span className="font-semibold text-gray-900">{order.customerPhone}</span>
            </div>

            <div>
              <span className="text-gray-400 block font-medium">Metoda Dostawy:</span>
              <span className="font-bold text-slate-900">
                {order.deliveryMethod === 'SCHOOL_PICKUP' && 'Odbiór osobisty w szkole (0 zł)'}
                {order.deliveryMethod === 'PACZKOMAT' && `Paczkomat InPost: ${order.paczkomatCode}`}
                {order.deliveryMethod === 'COURIER' && `Kurier na adres: ${order.deliveryAddress}`}
              </span>
            </div>

            {order.schoolLocation && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <span className="font-bold block text-xs">Punkt odbioru w szkole:</span>
                <span>{order.schoolLocation.name} ({order.schoolLocation.address}, {order.schoolLocation.city})</span>
              </div>
            )}

            {order.wantsInvoice && (
              <div className="pt-3 border-t border-gray-100">
                <span className="text-gray-400 block font-medium flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-gray-600" />
                  <span>Dane do Faktury VAT:</span>
                </span>
                <p className="font-semibold text-gray-900 mt-1">
                  {order.invoiceCompanyName} (NIP: {order.invoiceNip})<br />
                  {order.invoiceAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Items & Totals */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Zamówione Produkty</h3>

          <div className="space-y-3 divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-900 block">{item.productName}</span>
                  <span className="text-gray-500 text-[11px]">{item.quantity}x ({item.variantInfo})</span>
                </div>
                <span className="font-bold text-gray-900">{item.totalPrice.toFixed(2)} zł</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Suma produktów:</span>
              <span className="font-semibold text-gray-900">{order.totalAmount.toFixed(2)} zł</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Rabat:</span>
                <span>-{order.discountAmount.toFixed(2)} zł</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Dostawa:</span>
              <span className="font-semibold text-gray-900">{order.deliveryCost.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
              <span>Łączna Kwota:</span>
              <span className="text-emerald-600">{order.finalAmount.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track status footer */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-2xl text-xs">
        <span className="text-gray-600 font-medium">Chcesz sprawdzić etapy realizacji swojego zamówienia?</span>
        <Link
          to={`/status?orderNumber=${order.orderNumber}`}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center space-x-1.5 transition-colors"
        >
          <span>Śledź Status Zamówienia</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
