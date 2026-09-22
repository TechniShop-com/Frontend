import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SchoolLocation, DeliveryMethod } from '../types';
import { Truck, MapPin, Building, CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from 'axios';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discountCode, discountAmount, finalTotal, clearCart } = useCart();

  const [locations, setLocations] = useState<SchoolLocation[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('SCHOOL_PICKUP');

  // Form Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paczkomatCode, setPaczkomatCode] = useState('');
  const [schoolLocationId, setSchoolLocationId] = useState('');
  const [notes, setNotes] = useState('');

  // Invoice
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceNip, setInvoiceNip] = useState('');
  const [invoiceCompanyName, setInvoiceCompanyName] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/api/products/locations');
        setLocations(res.data);
        if (res.data.length > 0) {
          setSchoolLocationId(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Koszyk jest pusty</h2>
        <p className="text-xs text-gray-500">Dodaj produkty do koszyka przed przejściem do kasy.</p>
        <button
          onClick={() => navigate('/catalog')}
          className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
        >
          Przejdź do katalogu
        </button>
      </div>
    );
  }

  const deliveryCost =
    deliveryMethod === 'COURIER' ? 14.99 : deliveryMethod === 'PACZKOMAT' ? 11.99 : 0;
  const grandTotal = finalTotal + deliveryCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        customerEmail: email,
        customerPhone: phone,
        customerFirstName: firstName,
        customerLastName: lastName,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'COURIER' ? deliveryAddress : null,
        paczkomatCode: deliveryMethod === 'PACZKOMAT' ? paczkomatCode : null,
        schoolLocationId: deliveryMethod === 'SCHOOL_PICKUP' ? schoolLocationId : null,
        items: cart.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        discountCode,
        wantsInvoice,
        invoiceNip: wantsInvoice ? invoiceNip : null,
        invoiceCompanyName: wantsInvoice ? invoiceCompanyName : null,
        invoiceAddress: wantsInvoice ? invoiceAddress : null,
        notes,
      };

      const res = await axios.post('/api/orders', payload);
      clearCart();
      navigate(`/order-confirmation/${res.data.order.orderNumber}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.error || 'Wystąpił błąd podczas składania zamówienia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kasa i Zamówienie jako Gość</h1>
        <p className="text-xs text-gray-500 mt-1">Szybki zakup bez zakładania konta. Wybierz sposób dostawy.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Dane Kontaktowe (Zamówienie jako Gość)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Imię *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="np. Jan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nazwisko *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="np. Kowalski"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adres E-mail *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="jan.kowalski@technischools.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Numer Telefonu *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+48 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Selection */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Sposób Dostawy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: School Pickup */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'SCHOOL_PICKUP'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'SCHOOL_PICKUP'}
                    onChange={() => setDeliveryMethod('SCHOOL_PICKUP')}
                    className="accent-emerald-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Odbiór w szkole</h4>
                  <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">Darmowa (0.00 zł)</span>
                </div>
              </label>

              {/* Option 2: Paczkomat */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'PACZKOMAT'
                    ? 'border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building className="w-5 h-5 text-cyan-600" />
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'PACZKOMAT'}
                    onChange={() => setDeliveryMethod('PACZKOMAT')}
                    className="accent-cyan-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Paczkomat InPost</h4>
                  <span className="text-[11px] font-bold text-gray-700 block mt-0.5">11.99 zł</span>
                </div>
              </label>

              {/* Option 3: Courier */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'COURIER'
                    ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'COURIER'}
                    onChange={() => setDeliveryMethod('COURIER')}
                    className="accent-purple-600"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Kurier pod drzwi</h4>
                  <span className="text-[11px] font-bold text-gray-700 block mt-0.5">14.99 zł</span>
                </div>
              </label>
            </div>

            {/* Dynamic delivery inputs */}
            {deliveryMethod === 'SCHOOL_PICKUP' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Wybierz placówkę Techni Schools *</label>
                <select
                  value={schoolLocationId}
                  onChange={(e) => setSchoolLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} - {loc.address}, {loc.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {deliveryMethod === 'PACZKOMAT' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kod Paczkomatu (np. KRA01M, WAW12N) *</label>
                <input
                  type="text"
                  required
                  value={paczkomatCode}
                  onChange={(e) => setPaczkomatCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="np. WAW01M"
                />
              </div>
            )}

            {deliveryMethod === 'COURIER' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pełny Adres Dostawy (Ulica, nr domu/mieszkania, Kod pocztowy, Miasto) *</label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="ul. Marszałkowska 10/12, 00-001 Warszawa"
                />
              </div>
            )}
          </div>

          {/* Section 3: Invoice Options */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="wantsInvoice"
                checked={wantsInvoice}
                onChange={(e) => setWantsInvoice(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="wantsInvoice" className="text-xs font-bold text-gray-900 cursor-pointer">
                Chcę otrzymać fakturę VAT na firmę
              </label>
            </div>

            {wantsInvoice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">NIP *</label>
                  <input
                    type="text"
                    required={wantsInvoice}
                    value={invoiceNip}
                    onChange={(e) => setInvoiceNip(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nazwa Firmy *</label>
                  <input
                    type="text"
                    required={wantsInvoice}
                    value={invoiceCompanyName}
                    onChange={(e) => setInvoiceCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Techni Solutions Sp. z o.o."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adres Siedziby Firmy *</label>
                  <input
                    type="text"
                    required={wantsInvoice}
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="ul. Prosta 32, 00-838 Warszawa"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Uwagi do zamówienia (opcjonalnie)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="np. Prośba o zapakowanie na prezent"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Submit */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Podsumowanie Koszyka</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
              {cart.map((item) => (
                <div key={item.variant.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{item.product.title}</span>
                    <span className="text-gray-500 text-[11px]">
                      {item.quantity}x {item.variant.size || ''} {item.variant.color || ''}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0 ml-2">
                    {(item.variant.price * item.quantity).toFixed(2)} zł
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-gray-600 pt-4 border-t border-gray-100">
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
              <div className="flex justify-between">
                <span>Koszt dostawy:</span>
                <span className="font-semibold text-gray-900">
                  {deliveryCost === 0 ? '0.00 zł (Darmowa)' : `${deliveryCost.toFixed(2)} zł`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                <span>Do zapłaty:</span>
                <span className="text-emerald-600">{grandTotal.toFixed(2)} zł</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Przetwarzanie...' : 'Złóż Zamówienie i Zapłać'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center space-x-1 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Płatność testowa Stripe Sandbox</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
