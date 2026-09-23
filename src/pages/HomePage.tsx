import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';

interface HomePageProps {
  activeBrand: string;
}

export const HomePage: React.FC<HomePageProps> = ({ activeBrand }) => {
  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.brand === activeBrand);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Banner */}
      <div className={`p-6 rounded-2xl text-white ${
        activeBrand === 'TECHNI_ZDALNI' ? 'bg-gradient-to-r from-slate-900 to-purple-900' : 'bg-gradient-to-r from-slate-900 to-emerald-900'
      }`}>
        <h1 className="text-2xl font-bold">
          {activeBrand === 'TECHNI_ZDALNI' ? 'Kolekcja Techni Zdalni' : 'Kolekcja Techni Schools'}
        </h1>
        <p className="text-xs text-gray-300 mt-1">
          Oficjalna koszulka polo Techni w 3 wariantach kolorystycznych: fioletowa, czarna oraz biała.
        </p>
      </div>

      {/* Product List */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Dostępne Produkty:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <h3 className="font-bold text-base text-gray-900">{product.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                <div className="text-xs text-gray-500 font-medium">
                  Kolory: <span className="font-bold text-gray-800">{product.colors.join(', ')}</span>
                </div>
                <div className="text-base font-bold text-slate-900 pt-2">{product.price.toFixed(2)} zł</div>
              </div>
              <Link
                to={`/product/${product.id}`}
                className={`mt-4 w-full py-2 text-center text-xs font-bold text-white rounded-lg transition-colors ${
                  activeBrand === 'TECHNI_ZDALNI' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Zobacz Szczegóły i Wybierz Kolor
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
