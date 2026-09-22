import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/catalog/ProductCard';
import { useBrandTheme } from '../context/BrandThemeContext';
import { Sparkles, GraduationCap, Laptop, ArrowRight, ShieldCheck, MapPin, Truck } from 'lucide-react';
import axios from 'axios';

export const HomePage: React.FC = () => {
  const { activeBrand, setActiveBrand, brandStyles } = useBrandTheme();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/products', {
          params: { brand: activeBrand },
        });
        setFeaturedProducts(res.data);
      } catch (err) {
        console.error('Error fetching homepage products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeBrand]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${brandStyles.heroGradient} text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Oficjalna Kolekcja Techni Merch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Wyraź swój styl w <span className={brandStyles.brandColor}>Techni</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Odkryj wysokiej jakości bluzy, t-shirty oraz akcesoria stworzone specjalnie dla społeczności <strong className="text-emerald-400">Techni Schools</strong> oraz <strong className="text-cyan-400">Techni Zdalni</strong>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/catalog"
                className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg ${brandStyles.buttonBg}`}
              >
                <span>Przeglądaj Katalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setActiveBrand('TECHNI_SCHOOLS')}
                className="px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Techni Schools</span>
              </button>

              <button
                onClick={() => setActiveBrand('TECHNI_ZDALNI')}
                className="px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition-all flex items-center space-x-2"
              >
                <Laptop className="w-4 h-4" />
                <span>Techni Zdalni</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={
                  activeBrand === 'TECHNI_ZDALNI'
                    ? 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
                }
                alt="Merch Techni"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">Edycja Limitowana</span>
                  <span className="text-lg font-bold text-white">Premium Quality Merch 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Odbiór Osobisty w Szkołach (0 zł)</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Zamów bez płacenia za dostawę i odbierz w sekretariacie swojej szkoły (Warszawa, Lublin, Poznań).
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Kurier & Paczkomaty</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Szybka dostawa InPost lub kurierem prosto pod drzwi w 24-48h.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Zakup Jako Gość</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Szybki proces zakupowy bez zakładania konta. Wybierz wariant i zapłać.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Oferta <span className={brandStyles.brandColor}>{brandStyles.brandTitle}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Dostępne warianty rozmiarów i kolorów ze stanem magazynowym live.</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center space-x-1"
          >
            <span>Zobacz wszystko</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-200 h-80 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
