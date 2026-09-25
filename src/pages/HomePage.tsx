import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { GraduationCap, Laptop, Sparkles, ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';

interface HomePageProps {
  activeBrand: string;
}

export const HomePage: React.FC<HomePageProps> = ({ activeBrand }) => {
  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.brand === activeBrand);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Hero Spatial Floating Banner */}
      <div className="relative group overflow-hidden rounded-3xl p-8 sm:p-12 text-white border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/80 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 transition-all duration-500 hover:border-cyan-400/50">
        {/* Glow Spheres in Background */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-700 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 backdrop-blur-md border border-cyan-500/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Antigravity UI & Motion Design</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Oficjalny Merch{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {activeBrand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
            </span>
          </h1>

          <p className="text-cyan-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            Ekskluzywna koszulka polo Techni w 3 wariantach kolorystycznych: <strong className="text-purple-300">fioletowa</strong>, <strong className="text-gray-200">czarna</strong> oraz <strong className="text-cyan-200">biała</strong>. Szkło, lekkość i trójwymiarowa stylistyka.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-300/90 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-cyan-500/20">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>3 Warianty Kolorów (Fiolet, Czarna, Biała)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-300/90 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-sky-500/20">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>100% Czysta Bawełna Pique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spatial 3D Card Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            {activeBrand === 'TECHNI_ZDALNI' ? (
              <Laptop className="w-5 h-5 text-cyan-400" />
            ) : (
              <GraduationCap className="w-5 h-5 text-sky-400" />
            )}
            <span className="tracking-tight">Wybrana Kolekcja:</span>
          </h2>
          <span className="text-xs text-cyan-400/80 font-medium">Błękitno-Niebieska Stylistyka Glassmorphism</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-[1000px]">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/60 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-cyan-950/30 hover:shadow-cyan-500/20 hover:-translate-y-2 hover:rotate-1 transition-all duration-500 ease-out"
            >
              {/* Floating Glow Blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-all duration-500 pointer-events-none" />

              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 mb-5">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950/80 text-cyan-300 backdrop-blur-md border border-cyan-500/30 shadow-lg">
                    {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-black text-xl text-white group-hover:text-cyan-300 transition-colors duration-300">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{product.description}</p>

                  <div className="text-xs text-cyan-200/80 font-medium pt-1 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dostępne kolory: </span>
                    <strong className="text-white font-bold">{product.colors.join(', ')}</strong>
                  </div>

                  <div className="text-2xl font-black text-white pt-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
                    {product.price.toFixed(2)} zł
                  </div>
                </div>
              </div>

              <Link
                to={`/product/${product.id}`}
                className="mt-6 w-full py-3.5 px-5 text-center text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02]"
              >
                <span>Wybierz Kolor i Rozmiar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
