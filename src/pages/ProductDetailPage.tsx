import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { Product } from '../types';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Check,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  Ruler,
  Clock
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product>(() => {
    return MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
  });
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Domyślny');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'opis' | 'parametry' | 'rozmiary' | 'dostawa' | 'opinie'>('opis');
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setSelectedColor(data.colors[0] || 'Domyślny');
          setSelectedSize(data.sizes[0] || 'M');
        }
      } catch (err) {
        console.warn('Backend niedostępny, używam produktu mock:', err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedColor, selectedSize);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedColor, selectedSize);
    }
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center space-x-2 anim-wiggle">
          <Check className="w-5 h-5 text-yellow-300" />
          <span>Dodano {quantity}x "{product.title}" ({selectedColor}, {selectedSize}) do koszyka!</span>
        </div>
      )}

      {/* Breadcrumbs (Allegro style) */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-purple-600 transition-colors">
          Strona Główna
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-purple-600 transition-colors">
          Produkty
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/products?category=${product.gender === 'WOMEN' ? 'kobiety' : product.gender === 'MEN' ? 'mezczyzni' : 'all'}`}
          className="hover:text-purple-600 transition-colors"
        >
          {product.gender === 'WOMEN' ? 'Kobiety' : product.gender === 'MEN' ? 'Mężczyźni' : 'Unisex'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* TOP SECTION: ALLEGRO-STYLE (Left: Large Photo Gallery, Right: Purchase Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Large Photo & Highlights (5 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EBE6DD] p-4 sm:p-8 shadow-xs relative overflow-hidden group">
            <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-sm">
              {product.gender === 'WOMEN' ? 'Damskie' : product.gender === 'MEN' ? 'Męskie' : 'Unisex'}
            </span>

            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </div>

          {/* Guarantee Badges below image */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <Truck className="w-5 h-5 mx-auto text-purple-600" />
              <div className="text-[11px] font-bold text-slate-800">Dostawa 24h</div>
              <div className="text-[10px] text-slate-500 font-medium">Szybka wysyłka</div>
            </div>
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <RotateCcw className="w-5 h-5 mx-auto text-purple-600" />
              <div className="text-[11px] font-bold text-slate-800">14 dni zwrot</div>
              <div className="text-[10px] text-slate-500 font-medium">Darmowe zwroty</div>
            </div>
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <ShieldCheck className="w-5 h-5 mx-auto text-purple-600" />
              <div className="text-[11px] font-bold text-slate-800">100% Oryginał</div>
              <div className="text-[10px] text-slate-500 font-medium">Oficjalny sklep</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Buy Panel / Allegro Purchase Box (6 cols on lg) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EBE6DD] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Info */}
          <div className="space-y-2 border-b border-[#EBE6DD] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <span>{product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}</span>
              </span>
              <div className="flex items-center space-x-1 text-xs">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-slate-800 ml-1">5.0</span>
                <span className="text-slate-400 font-medium">(428 ocen)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Stan: <span className="font-semibold text-slate-800">Nowy z metką</span> | Kod: <span className="font-mono text-slate-600">{product.id.toUpperCase()}</span>
            </p>
          </div>

          {/* Price Box */}
          <div className="space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {product.price.toFixed(2)} <span className="text-2xl font-bold">zł</span>
              </span>
              <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-md">
                Smart!
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Darmowa dostawa od 40 zł • Zapłać za 30 dni z PayPo / BLIK</span>
            </p>
          </div>

          {/* Variant / Color Selector */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Kolor / Wariant: <span className="text-purple-700 font-semibold normal-case">{selectedColor}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center space-x-2 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white font-bold shadow-xs'
                        : 'border-[#DDD8CD] bg-[#FAF7F2] text-slate-700 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    <span>{color}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rozmiar: <span className="text-purple-700 font-semibold normal-case">{selectedSize}</span>
              </label>
              <button
                onClick={() => {
                  setActiveTab('rozmiary');
                  const elem = document.getElementById('details-section');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-bold text-purple-600 hover:underline flex items-center space-x-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Tabela rozmiarów</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-11 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white font-bold shadow-xs'
                        : 'border-[#DDD8CD] bg-[#FAF7F2] text-slate-700 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Liczba sztuk:</span>
            <div className="flex items-center border border-[#DDD8CD] rounded-xl bg-[#FAF7F2] p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-[#DDD8CD] text-purple-700 font-bold text-sm flex items-center justify-center hover:bg-purple-50 transition-colors"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-[#DDD8CD] text-purple-700 font-bold text-sm flex items-center justify-center hover:bg-purple-50 transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">z 50 sztuk dostępnych</span>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-3 pt-4 border-t border-[#EBE6DD]">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>DODAJ DO KOSZYKA</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <span>KUP TERAZ I PRZEJDŹ DO KASY</span>
            </button>
          </div>

          {/* Delivery Options (Allegro Box) */}
          <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE6DD] space-y-2.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Sposoby dostawy:</span>
              <span className="text-purple-600 font-bold">od 0,00 zł</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>• Odbiór osobisty w szkole</span>
                <span className="font-semibold text-emerald-600">0,00 zł (Darmowy)</span>
              </div>
              <div className="flex justify-between">
                <span>• Paczkomaty InPost (Dostawa jutro)</span>
                <span className="font-semibold text-slate-900">9,99 zł (Smart! 0 zł)</span>
              </div>
              <div className="flex justify-between">
                <span>• Kurier DPD / DHL</span>
                <span className="font-semibold text-slate-900">14,99 zł</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION (Under Photo and Title): Rich Description, Size Chart, Specs, Reviews */}
      <div id="details-section" className="bg-white rounded-3xl border border-[#EBE6DD] shadow-xs overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#EBE6DD] overflow-x-auto bg-[#F7F4EE]">
          <button
            onClick={() => setActiveTab('opis')}
            className={`px-6 py-4 text-xs transition-all shrink-0 ${
              activeTab === 'opis'
                ? 'border-b-2 border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-b-2 border-transparent text-slate-600 hover:text-purple-600 font-medium'
            }`}
          >
            Opis Produktu
          </button>
          <button
            onClick={() => setActiveTab('parametry')}
            className={`px-6 py-4 text-xs transition-all shrink-0 ${
              activeTab === 'parametry'
                ? 'border-b-2 border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-b-2 border-transparent text-slate-600 hover:text-purple-600 font-medium'
            }`}
          >
            Parametry i Specyfikacja
          </button>
          <button
            onClick={() => setActiveTab('rozmiary')}
            className={`px-6 py-4 text-xs transition-all shrink-0 ${
              activeTab === 'rozmiary'
                ? 'border-b-2 border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-b-2 border-transparent text-slate-600 hover:text-purple-600 font-medium'
            }`}
          >
            Tabela Rozmiarów
          </button>
          <button
            onClick={() => setActiveTab('opinie')}
            className={`px-6 py-4 text-xs transition-all shrink-0 ${
              activeTab === 'opinie'
                ? 'border-b-2 border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-b-2 border-transparent text-slate-600 hover:text-purple-600 font-medium'
            }`}
          >
            Opinie Kupujących (428)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-10 text-slate-800">
          {/* TAB 1: OPIS */}
          {activeTab === 'opis' && (
            <div className="space-y-6 max-w-4xl leading-relaxed text-sm">
              <h3 className="text-xl font-black text-slate-900">
                {product.title} — Oficjalna Kolekcja Techni
              </h3>
              <p className="text-slate-600 font-medium">
                {product.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EBE6DD] space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Materiały Najwyższej Jakości</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Do produkcji użyto wyselekcjonowanej bawełny czesanej o podwyższonej gramaturze, co zapewnia wyjątkową trwałość, miękkość i odporność na wielokrotne pranie.
                  </p>
                </div>
                <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EBE6DD] space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Dopracowane Detale & Trwały Haft</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Precyzyjny haft z logo Techni wykonany z nici odpornych na blaknięcie. Wzmocnione szwy na ramionach i podwójne przeszycia gwarantują komfort noszenia.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARAMETRY (Allegro Key-Value Table) */}
          {activeTab === 'parametry' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-black text-slate-900 mb-4">Parametry techniczne</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Marka:</span>
                  <span className="font-bold text-slate-900">
                    {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Stan:</span>
                  <span className="font-bold text-slate-900">Nowy z kompletem metek</span>
                </div>
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Przeznaczenie:</span>
                  <span className="font-bold text-slate-900">
                    {product.gender === 'WOMEN' ? 'Damskie' : product.gender === 'MEN' ? 'Męskie' : 'Unisex'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Materiał dominujący:</span>
                  <span className="font-bold text-slate-900">100% Bawełna Pique / Czesana</span>
                </div>
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Gramatura:</span>
                  <span className="font-bold text-slate-900">220 - 380 g/m²</span>
                </div>
                <div className="flex justify-between py-2.5 px-4 bg-[#FAF7F2] border border-[#EBE6DD]/60 rounded-xl">
                  <span className="text-slate-500 font-medium">Kraj produkcji:</span>
                  <span className="font-bold text-slate-900">Polska</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TABELA ROZMIARÓW */}
          {activeTab === 'rozmiary' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Tabela wymiarów produktu (cm)</h3>
                <span className="text-xs text-slate-500 font-medium">Tolerancja +/- 1.5 cm</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#EBE6DD]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F0ECE4] text-slate-900 font-bold border-b border-[#E2DDD3]">
                      <th className="p-3">Rozmiar</th>
                      <th className="p-3">Szerokość pod pachami (A)</th>
                      <th className="p-3">Długość całkowita (B)</th>
                      <th className="p-3">Długość rękawa (C)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE6DD] font-medium text-slate-700 bg-white">
                    <tr className={selectedSize === 'XS' ? 'bg-purple-50 font-bold text-purple-900' : ''}>
                      <td className="p-3 font-bold">XS</td>
                      <td className="p-3">46 cm</td>
                      <td className="p-3">65 cm</td>
                      <td className="p-3">19 cm</td>
                    </tr>
                    <tr className={selectedSize === 'S' ? 'bg-purple-50 font-bold text-purple-900' : ''}>
                      <td className="p-3 font-bold">S</td>
                      <td className="p-3">50 cm</td>
                      <td className="p-3">69 cm</td>
                      <td className="p-3">20 cm</td>
                    </tr>
                    <tr className={selectedSize === 'M' ? 'bg-purple-50 font-bold text-purple-900' : ''}>
                      <td className="p-3 font-bold">M</td>
                      <td className="p-3">53 cm</td>
                      <td className="p-3">72 cm</td>
                      <td className="p-3">21 cm</td>
                    </tr>
                    <tr className={selectedSize === 'L' ? 'bg-purple-50 font-bold text-purple-900' : ''}>
                      <td className="p-3 font-bold">L</td>
                      <td className="p-3">56 cm</td>
                      <td className="p-3">74 cm</td>
                      <td className="p-3">22 cm</td>
                    </tr>
                    <tr className={selectedSize === 'XL' ? 'bg-purple-50 font-bold text-purple-900' : ''}>
                      <td className="p-3 font-bold">XL</td>
                      <td className="p-3">60 cm</td>
                      <td className="p-3">77 cm</td>
                      <td className="p-3">23 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OPINIE KUPUJĄCYCH */}
          {activeTab === 'opinie' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center space-x-4 bg-[#FAF7F2] p-6 rounded-2xl border border-[#EBE6DD]">
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900">5.0</div>
                  <div className="flex text-yellow-400 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="border-l border-[#E2DDD3] pl-4 space-y-1 text-xs">
                  <div className="font-bold text-slate-900">100% kupujących poleca ten produkt</div>
                  <div className="text-slate-500 font-medium">Na podstawie 428 zweryfikowanych zamówień uczniów i nauczycieli.</div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Kacper M. (Uczeń Techni)</span>
                    <span className="text-[10px] text-slate-400">2 dni temu • Zweryfikowany zakup</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium">
                    Jakość materiału jest rewelacyjna. Bardzo wygodna, krój idealnie leży i świetnie wygląda w szkole.
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Weronika K.</span>
                    <span className="text-[10px] text-slate-400">w zeszłym tygodniu • Zweryfikowany zakup</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium">
                    Szybka dostawa i genialny fioletowy kolor! Wszystko zgodnie z tabelą rozmiarów.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetailPage;
