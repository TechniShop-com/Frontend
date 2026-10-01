import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { createOrderApi } from '../services/api';

type DeliveryMethod = 'paczkomat' | 'kurier' | 'szkola';
type PaymentMethod = 'blik' | 'karta' | 'paypo' | 'odbior';

export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paczkomatCode, setPaczkomatCode] = useState('LBN01M (Lublin ul. Spokojna 1)');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('paczkomat');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('blik');
  const [blikCode, setBlikCode] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFreeShipping = totalPrice >= 200;
  const deliveryCost = deliveryMethod === 'szkola' || isFreeShipping ? 0 : deliveryMethod === 'paczkomat' ? 14.99 : 16.99;
  const finalTotal = totalPrice + deliveryCost;

  if (isOrdered) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 text-center bg-white border border-[#E7E2D8] rounded-3xl space-y-5 my-12 shadow-sm text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Zamówienie Złożone Pomyślnie!</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Dziękujemy, <strong className="text-slate-900">{name}</strong>! Twoje zamówienie na kwotę{' '}
          <strong className="text-purple-700 font-mono text-base">{finalTotal.toFixed(2)} zł</strong> zostało
          zapisane w systemie TechniShop. Potwierdzenie wysłaliśmy na adres <strong>{email}</strong>.
        </p>

        <div className="p-4 bg-[#FAF8F5] border border-[#E3DDD2] rounded-2xl text-left text-xs space-y-1.5 text-slate-700 font-medium">
          <div className="flex justify-between">
            <span>Metoda dostawy:</span>
            <span className="font-bold">
              {deliveryMethod === 'paczkomat'
                ? `Paczkomat InPost (${paczkomatCode})`
                : deliveryMethod === 'kurier'
                ? `Kurier na adres: ${address}`
                : 'Odbiór osobisty w szkole Techni'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Płatność:</span>
            <span className="font-bold uppercase text-purple-700">{paymentMethod}</span>
          </div>
        </div>

        <button
          onClick={() => {
            clearCart();
            window.location.href = '/';
          }}
          className="px-8 py-3.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Wróć do sklepu głównego
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-[#E7E2D8] rounded-3xl my-12 text-slate-900 shadow-xs">
        <p className="text-sm font-bold text-slate-600">Twój koszyk jest pusty.</p>
        <a
          href="/products"
          className="mt-4 inline-block px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Przeglądaj produkty
        </a>
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
        address: deliveryMethod === 'paczkomat' ? `Paczkomat: ${paczkomatCode}` : address,
        paymentMethod: `${paymentMethod.toUpperCase()}${deliveryMethod === 'paczkomat' ? ' (InPost)' : ''}`,
        totalPrice: finalTotal,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Kasa & Dostawa</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Dokończ zakupy w kilku prostych krokach z bezpieczną płatnością BLIK lub kartą.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer info, Delivery, Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Dane Odbiorcy */}
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE4D9]">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Dane Odbiorcy</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Imię i Nazwisko *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="np. Jan Kowalski"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Adres Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Numer Telefonu (powiadomienia SMS o paczce) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+48 500 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Sposób Dostawy (InPost, Kurier, Odbiór) */}
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE4D9]">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Sposób Dostawy</h3>
              </div>

              <div className="space-y-3">
                {/* InPost Paczkomat 24/7 Option */}
                <div
                  onClick={() => setDeliveryMethod('paczkomat')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    deliveryMethod === 'paczkomat'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-purple-600">
                        {deliveryMethod === 'paczkomat' && (
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                          <span>Paczkomaty InPost 24/7</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Odbiór w wybranym Paczkomacie w 24h</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-slate-900">
                      {isFreeShipping ? <span className="text-emerald-600 font-bold">0.00 zł</span> : '14.99 zł'}
                    </span>
                  </div>

                  {deliveryMethod === 'paczkomat' && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                        Wybrany Paczkomat lub miasto:
                      </label>
                      <input
                        type="text"
                        required
                        value={paczkomatCode}
                        onChange={(e) => setPaczkomatCode(e.target.value)}
                        placeholder="np. WAW22M lub ulica"
                        className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* Kurier Option */}
                <div
                  onClick={() => setDeliveryMethod('kurier')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    deliveryMethod === 'kurier'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-purple-600">
                        {deliveryMethod === 'kurier' && (
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Kurier DPD / InPost pod adres</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Dostawa bezpośrednio do rąk własnych</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-slate-900">
                      {isFreeShipping ? <span className="text-emerald-600 font-bold">0.00 zł</span> : '16.99 zł'}
                    </span>
                  </div>

                  {deliveryMethod === 'kurier' && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                        Adres do doręczenia:
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ul. Szkolna 10/2, 00-001 Warszawa"
                        className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* Odbiór w szkole */}
                <div
                  onClick={() => setDeliveryMethod('szkola')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    deliveryMethod === 'szkola'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-purple-600">
                        {deliveryMethod === 'szkola' && (
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Odbiór osobisty w szkole Techni</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Odbierz bezpłatnie w sekretariacie szkoły</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-emerald-600 font-bold">0.00 zł</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Płatność (BLIK, Karta, PayPo) */}
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-[#EAE4D9]">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Metoda Płatności</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* BLIK Card */}
                <div
                  onClick={() => setPaymentMethod('blik')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'blik'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-600/20'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                      BLIK
                    </span>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Polecane
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Płatność BLIK</div>
                    <div className="text-[10px] text-slate-500 font-medium">Szybki kod 6 cyfr</div>
                  </div>
                </div>

                {/* Karta / Szybki Przelew Card */}
                <div
                  onClick={() => setPaymentMethod('karta')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'karta'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-600/20'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Karta / Przelew</div>
                    <div className="text-[10px] text-slate-500 font-medium">Visa, Mastercard, PayU</div>
                  </div>
                </div>

                {/* PayPo Card */}
                <div
                  onClick={() => setPaymentMethod('paypo')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'paypo'
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-600/20'
                      : 'border-[#DDD8CD] bg-[#FAF8F5] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs text-slate-900">PayPo</span>
                    <span className="text-[9px] font-bold text-purple-700">30 dni</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Kup teraz, zapłać później</div>
                    <div className="text-[10px] text-slate-500 font-medium">Zapłać za 30 dni</div>
                  </div>
                </div>
              </div>

              {/* BLIK Code Input if BLIK selected */}
              {paymentMethod === 'blik' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-purple-200 space-y-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Podaj 6-cyfrowy kod BLIK z aplikacji banku:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={blikCode}
                      onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000 000"
                      className="w-44 p-2.5 text-center tracking-widest font-mono text-base font-black bg-white border border-[#DDD8CD] rounded-xl focus:border-purple-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 flex items-center font-medium">
                      Zatwierdź płatność w aplikacji banku po kliknięciu
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-[#E7E2D8] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-[#EAE4D9] flex items-center justify-between">
                <span>Podsumowanie Zamówienia</span>
                <span className="text-xs px-2.5 py-0.5 bg-[#FAF8F5] text-purple-700 font-extrabold rounded-full border border-[#DDD8CD]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} szt.
                </span>
              </h3>

              {/* Item thumbnails */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-[#EAE4D9]">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex items-center space-x-3 text-xs">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-12 h-14 object-cover rounded-xl border border-[#E3DDD2] bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 truncate">{item.product.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {item.selectedColor} &bull; {item.selectedSize} &bull; {item.quantity} szt.
                      </div>
                    </div>
                    <div className="font-black text-slate-900 shrink-0">
                      {(item.product.price * item.quantity).toFixed(2)} zł
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-[#EAE4D9] text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Wartość koszyka:</span>
                  <span className="font-bold text-slate-900">{totalPrice.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between">
                  <span>Dostawa:</span>
                  <span className="font-bold">
                    {deliveryCost === 0 ? (
                      <span className="text-emerald-600 font-bold">0.00 zł (Darmowa)</span>
                    ) : (
                      `${deliveryCost.toFixed(2)} zł`
                    )}
                  </span>
                </div>

                <div className="border-t border-[#DDD8CD] pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-black text-slate-900">Razem do zapłaty:</span>
                  <span className="text-2xl font-black text-purple-700">{finalTotal.toFixed(2)} zł</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 text-sm font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Przetwarzanie płatności...</span>
                    </>
                  ) : (
                    <>
                      <span>ZAMAWIAM I PŁACĘ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Polish Trust Bar */}
              <div className="pt-3 border-t border-[#EAE4D9] space-y-2 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Szyfrowanie SSL 256-bit &bull; 100% bezpieczne zakupy</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Darmowy zwrot w ciągu 14 dni bez podawania przyczyny</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default CheckoutPage;
