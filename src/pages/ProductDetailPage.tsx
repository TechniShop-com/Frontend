import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { Product } from '../types';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { Product3DViewer } from '../components/Product3DViewer';
import { FitFinderModal, loadSavedFitProfile, FitProfile } from '../components/FitFinderModal';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import {
  Check,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  Ruler,
  Clock,
  Box,
  Sparkles,
  Image as ImageIcon,
  UserCheck,
  MessageSquare,
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

  const [mediaMode, setMediaMode] = useState<'2d' | '3d'>('3d');
  const [isFitFinderOpen, setIsFitFinderOpen] = useState(false);
  const [fitProfile, setFitProfile] = useState<FitProfile | null>(() => loadSavedFitProfile());

  useEffect(() => {
    const syncProfile = () => setFitProfile(loadSavedFitProfile());
    window.addEventListener('fitProfileUpdated', syncProfile);
    return () => window.removeEventListener('fitProfileUpdated', syncProfile);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setSelectedColor(data.colors[0] || 'Domyślny');
          const saved = loadSavedFitProfile();
          if (saved && data.sizes.includes(saved.recommendedSize)) {
            setSelectedSize(saved.recommendedSize);
          } else {
            setSelectedSize(data.sizes[0] || 'M');
          }
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EBE6DD] p-4 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBE6DD]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMediaMode('3d')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                    mediaMode === '3d'
                      ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                      : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>Model 3D 360°</span>
                </button>

                <button
                  onClick={() => setMediaMode('2d')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                    mediaMode === '2d'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Zdjęcie 2D</span>
                </button>
              </div>

              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-[10px] uppercase tracking-wider rounded-full">
                {product.gender === 'WOMEN' ? 'Damskie' : product.gender === 'MEN' ? 'Męskie' : 'Unisex'}
              </span>
            </div>

            {mediaMode === '3d' ? (
              <div className="w-full h-[450px] sm:h-[480px] rounded-2xl overflow-hidden relative">
                <Product3DViewer
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                  availableColors={product.colors}
                  height="h-full"
                  autoRotateDefault={true}
                />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] flex items-center justify-center relative group">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            )}
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
              <button
                type="button"
                onClick={() => {
                  setActiveTab('opinie');
                  const elem = document.getElementById('details-section');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center space-x-1 text-xs group cursor-pointer hover:opacity-85 transition-opacity"
                title="Przejdź do opinii i recenzji"
              >
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-slate-800 ml-1">4.9</span>
                <span className="text-purple-600 font-bold group-hover:underline">
                  (Opinie kupujących)
                </span>
              </button>

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

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rozmiar: <span className="text-purple-700 font-semibold normal-case">{selectedSize}</span>
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFitFinderOpen(true)}
                  className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>Asystent Rozmiaru AI</span>
                </button>
                <button
                  type="button"
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
            </div>

            {fitProfile && product.sizes.includes(fitProfile.recommendedSize) && (
              <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Twój rozmiar FitFinder AI: <strong>{fitProfile.recommendedSize}</strong> ({fitProfile.confidence}% dopasowania dla {fitProfile.height}cm / {fitProfile.weight}kg)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFitFinderOpen(true)}
                  className="text-[11px] font-black text-emerald-700 hover:underline ml-2 shrink-0 cursor-pointer"
                >
                  Zmień
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                const isRecommended = fitProfile?.recommendedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`relative min-w-11 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white font-bold shadow-xs'
                        : isRecommended
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold hover:bg-emerald-100'
                        : 'border-[#DDD8CD] bg-[#FAF7F2] text-slate-700 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    {size}
                    {isRecommended && (
                      <span className=" -top-2 -right-1.5 px-1.5 py-0.2 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase shadow-2xs ml-1.5">
                        AI
                      </span>
                    )}
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

          {/* Delivery & Payment Polish Trust Box (Allegro / Reserved style) */}
          <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E3DDD2] space-y-3 text-xs">
            <div className="font-extrabold text-slate-900 flex items-center justify-between pb-2 border-b border-[#EAE4D9]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-700" />
                <span>Opcje dostawy i płatności</span>
              </span>
              <span className="text-purple-700 font-black">Darmowa od 200 zł</span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600 font-medium">
              <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-[#E7E2D8]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shrink-0 shadow-2xs" />
                  <span>Paczkomaty InPost (Dostawa w 24h)</span>
                </span>
                <span className="font-extrabold text-slate-900">
                  {product.price * quantity >= 200 ? (
                    <span className="text-emerald-600">0.00 zł</span>
                  ) : (
                    '14.99 zł'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-[#E7E2D8]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shrink-0 shadow-2xs" />
                  <span>Odbiór osobisty w szkole</span>
                </span>
                <span className="font-extrabold text-emerald-600">0.00 zł (Darmowy)</span>
              </div>
            </div>

            {/* PayPo & BLIK Badge */}
            <div className="pt-2 border-t border-[#EAE4D9] flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kup teraz, zapłać za 30 dni z <strong>PayPo</strong></span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDD8CD] font-black text-purple-700">
                BLIK
              </span>
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
            className={`px-6 py-4 text-xs transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'opinie'
                ? 'border-b-2 border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-b-2 border-transparent text-slate-600 hover:text-purple-600 font-medium'
            }`}
          >
            <span>Opinie & Recenzje</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700">
              Społeczność
            </span>
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

          {/* TAB 4: OPINIE KUPUJĄCYCH (INTERACTIVE REVIEWS & RATINGS ENGINE) */}
          {activeTab === 'opinie' && (
            <ProductReviewsSection
              productId={product.id}
              productTitle={product.title}
            />
          )}
        </div>
      </div>


      {/* Sticky Mobile Add To Cart Bar (Reserved / Zara / Zalando mobile standard) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E3DDD2] p-3 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] text-slate-500 font-bold">Cena całkowita:</div>
          <div className="text-base font-black text-slate-900 leading-none">
            {(product.price * quantity).toFixed(2)} zł
          </div>
          <div className="text-[10px] text-purple-700 font-bold mt-0.5">
            {selectedColor} &bull; {selectedSize}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>DODAJ DO KOSZYKA</span>
        </button>
      </div>

      <FitFinderModal
        isOpen={isFitFinderOpen}
        onClose={() => setIsFitFinderOpen(false)}
        productTitle={product.title}
        availableSizes={product.sizes}
        onSelectSize={(size) => setSelectedSize(size)}
      />
    </div>
  );
};
export default ProductDetailPage;
