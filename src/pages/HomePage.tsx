import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { ShoppingBag, Star, Sparkles, ArrowRight, Zap, Check, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  activeBrand: string;
}

export const HomePage: React.FC<HomePageProps> = ({ activeBrand }) => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const querySearch = searchParams.get('search') || '';

  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesBrand = activeBrand === 'ALL' || (p.brand as string) === activeBrand;
    const matchesQuery = !querySearch || p.title.toLowerCase().includes(querySearch.toLowerCase()) || p.description.toLowerCase().includes(querySearch.toLowerCase());
    return matchesBrand && matchesQuery;
  });

  const featuredProduct = filteredProducts[0] || MOCK_PRODUCTS[0];

  const handleQuickAdd = (p: typeof featuredProduct, color: string) => {
    addToCart(p, color, 'M');
    setQuickNotice(`Dodano koszulkę polo (${color}, M) do koszyka!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* HERO BANNER - Modeled after Reference Image layout with Organic Wave & Floating Product */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-purple-100">
        {/* Animated Background Blob Shapes (Multi-directional fluid morphing) */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-purple-400/35 via-purple-300/25 to-indigo-400/30 blur-3xl anim-blob-a pointer-events-none" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-300/25 rounded-full blur-2xl anim-blob-b pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl anim-spin-slow pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column: Headlines & Action */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 text-purple-700 shadow-md border border-purple-200 anim-wiggle">
              <Sparkles className="w-4 h-4 text-purple-600 anim-spin-slow" />
              <span>Dla Uczniów Techni 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
              Odkryj Swoją Nową{' '}
              <span className="shimmer-purple-text drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Ulubioną Polo
              </span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
              Oficjalna koszulka polo Techni w 3 wyjątkowych wariantach: <strong className="text-purple-700 font-black">fioletowa</strong>, <strong className="text-gray-900 font-black">czarna</strong> oraz <strong className="text-purple-600 font-black">biała</strong>. Wykonana ze szlachetnej bawełny Pique.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={`/product/${featuredProduct.id}`}
                className="px-8 py-4 rounded-full font-black text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:scale-110 hover:-rotate-1 transition-all duration-300 flex items-center space-x-3 anim-pulse-glow"
              >
                <span>KUP TERAZ</span>
                <ArrowRight className="w-5 h-5 animate-bounce" />
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic 3D Floating Hero Product with Multiple Orbital Badges */}
          <div className="relative flex justify-center items-center py-6">
            
            {/* Floating Orbital Decorative Chip 1 (Top-Left) */}
            <div className="absolute -top-3 left-4 sm:left-8 z-20 bg-white/90 backdrop-blur-md border border-purple-200 shadow-xl rounded-2xl px-4 py-2 flex items-center space-x-2 anim-orbit-a">
              <span className="text-yellow-400 font-black text-sm">★ 5.0</span>
              <span className="text-[11px] font-bold text-slate-700">500+ opinii</span>
            </div>

            {/* Floating Orbital Decorative Chip 2 (Bottom-Right) */}
            <div className="absolute -bottom-4 right-4 sm:right-8 z-20 bg-white/90 backdrop-blur-md border border-purple-200 shadow-xl rounded-2xl px-4 py-2 flex items-center space-x-2 anim-orbit-b">
              <Zap className="w-4 h-4 text-purple-600 animate-bounce" />
              <span className="text-[11px] font-black text-purple-900">100% Bawełna Pique</span>
            </div>

            {/* Floating Decorative Chip 3 (Top-Right Wiggle) */}
            <div className="absolute top-6 -right-2 sm:right-2 z-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 rounded-xl px-3 py-1.5 text-[10px] font-black tracking-wider uppercase anim-wiggle">
              🔥 HIT SEZONU
            </div>

            {/* Main 3D Floating Hero Showcase Card (Figure-8 Infinity Motion) */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/20 border-4 border-white bg-white/70 backdrop-blur-md anim-hero-product group">
              <img
                src={featuredProduct.imageUrl}
                alt={featuredProduct.title}
                className="w-full h-full object-cover group-hover:scale-115 group-hover:rotate-2 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/75 via-purple-900/10 to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-xs font-black text-purple-300 uppercase tracking-widest block anim-breathe">
                    Edycja Limitowana 2026
                  </span>
                  <span className="text-lg font-black text-white">{featuredProduct.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK NOTICE TOAST */}
      {quickNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center space-x-2 anim-wiggle">
          <Check className="w-5 h-5 text-yellow-300" />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* PRODUCT GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-purple-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
              <Zap className="w-6 h-6 text-purple-600 animate-bounce" />
              <span>Dostępne Koszulki Polo</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Każdy produkt z unikalną wielokierunkową dynamiką 3D.</p>
          </div>
        </div>

        {/* 4 Product Cards Layout with Unique Individual Motions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 perspective-[1000px]">
          {filteredProducts.map((product, idx) => {
            // Assign unique multi-directional animation to each card
            const cardAnimClasses = [
              'anim-card-1', // Diagonal top-right float + tilt
              'anim-card-2', // Horizontal pendulum sway + roll
              'anim-card-3', // Diagonal top-left float + counter-tilt
              'anim-card-4', // 3D Gyroscopic perspective wobble
            ];
            const currentAnim = cardAnimClasses[idx % cardAnimClasses.length];

            return (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl border border-purple-100 hover:border-purple-300 p-5 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out ${currentAnim}`}
              >
                {/* Product Image Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-purple-50/50 border border-purple-100 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-md anim-wiggle">
                    {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                  </span>
                </div>

                {/* Info & Rating with Wave Twinkling Stars */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1 text-yellow-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current anim-twinkle-1" />
                    <Star className="w-3.5 h-3.5 fill-current anim-twinkle-2" />
                    <Star className="w-3.5 h-3.5 fill-current anim-twinkle-3" />
                    <Star className="w-3.5 h-3.5 fill-current anim-twinkle-4" />
                    <Star className="w-3.5 h-3.5 fill-current anim-twinkle-5" />
                    <span className="text-gray-400 text-[10px] font-normal ml-1">(5.0)</span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>

                  {/* Color Selector Pills */}
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      Wybierz Kolor:
                    </span>
                    <div className="flex gap-1.5">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleQuickAdd(product, c)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-md border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-600 hover:text-white hover:scale-110 active:scale-95 transition-all"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xl font-black text-gray-900 pt-2">{product.price.toFixed(2)} zł</div>
                </div>

                {/* CTA Action Buttons */}
                <div className="pt-4 flex items-center space-x-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="p-2.5 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 hover:scale-110 transition-all"
                    title="Zobacz szczegóły"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleQuickAdd(product, 'Fioletowa')}
                    className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 flex items-center justify-center space-x-1 transition-all hover:scale-105 active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>DODAJ DO KOSZYKA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
