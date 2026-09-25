import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { GraduationCap, Laptop, Sparkles, ArrowRight } from 'lucide-react';

interface HomePageProps {
  activeBrand: string;
}

export const HomePage: React.FC<HomePageProps> = ({ activeBrand }) => {
  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.brand === activeBrand);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white border shadow-xl transition-all duration-500 ${
          activeBrand === 'TECHNI_ZDALNI'
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 border-purple-500/30'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-emerald-500/30'
        }`}
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Oficjalny Merch Techni</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {activeBrand === 'TECHNI_ZDALNI' ? (
            <span>
              Kolekcja <span className="text-cyan-400">Techni Zdalni</span>
            </span>
          ) : (
            <span>
              Kolekcja <span className="text-emerald-400">Techni Schools</span>
            </span>
          )}
        </h1>

        <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
          Oficjalna koszulka polo Techni z haftowanym logo. Dostępna w 3 wariantach kolorystycznych: <strong>fioletowa</strong>, <strong>czarna</strong> oraz <strong>biała</strong>.
        </p>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          {activeBrand === 'TECHNI_ZDALNI' ? (
            <Laptop className="w-5 h-5 text-purple-600" />
          ) : (
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          )}
          <span>Dostępne Koszulki Polo:</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
                  {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>

                <div className="text-xs text-gray-500 font-medium pt-1">
                  Dostępne kolory: <span className="font-bold text-gray-800">{product.colors.join(', ')}</span>
                </div>

                <div className="text-xl font-extrabold text-slate-900 pt-2">{product.price.toFixed(2)} zł</div>
              </div>

              <Link
                to={`/product/${product.id}`}
                className={`mt-4 w-full py-3 px-4 text-center text-xs font-bold text-white rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all ${
                  activeBrand === 'TECHNI_ZDALNI'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
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
