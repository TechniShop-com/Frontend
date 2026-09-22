import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, BrandType } from '../types';
import { ProductCard } from '../components/catalog/ProductCard';
import { useBrandTheme } from '../context/BrandThemeContext';
import { Search, Filter, GraduationCap, Laptop, Sparkles } from 'lucide-react';
import axios from 'axios';

export const BrandCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeBrand, setActiveBrand, brandStyles } = useBrandTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');

  useEffect(() => {
    const urlBrand = searchParams.get('brand') as BrandType | null;
    if (urlBrand && (urlBrand === 'TECHNI_SCHOOLS' || urlBrand === 'TECHNI_ZDALNI' || urlBrand === 'ALL')) {
      setActiveBrand(urlBrand);
    }
  }, [searchParams, setActiveBrand]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/products', {
          params: {
            brand: activeBrand,
            category: selectedCategory,
            search: searchQuery,
            sort: sortOption,
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error loading catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeBrand, selectedCategory, searchQuery, sortOption]);

  const handleBrandTabChange = (brand: BrandType) => {
    setActiveBrand(brand);
    setSearchParams({ brand });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Brand Filter Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Katalog Produktów
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kolekcja <span className={brandStyles.brandColor}>{brandStyles.brandTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
            Wybierz odzież lub gadżety przypisane do Twojej marki lub przejrzyj naszą pełną ofertę.
          </p>
        </div>

        {/* Brand Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => handleBrandTabChange('TECHNI_SCHOOLS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeBrand === 'TECHNI_SCHOOLS'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Techni Schools</span>
          </button>

          <button
            onClick={() => handleBrandTabChange('TECHNI_ZDALNI')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeBrand === 'TECHNI_ZDALNI'
                ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Techni Zdalni</span>
          </button>

          <button
            onClick={() => handleBrandTabChange('ALL')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeBrand === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Wszystkie</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj produktu (np. bluza, bidon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
          />
        </div>

        {/* Category Pills & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setSelectedCategory('Odzież')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === 'Odzież' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Odzież
            </button>
            <button
              onClick={() => setSelectedCategory('Akcesoria')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === 'Akcesoria' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Akcesoria
            </button>
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50 focus:outline-none text-gray-700"
          >
            <option value="newest">Najnowsze</option>
            <option value="price_asc">Cena: rosnąco</option>
            <option value="price_desc">Cena: malejąco</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-200 h-80 rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-3">
          <p className="text-base font-bold text-gray-800">Brak produktów spełniających kryteria</p>
          <p className="text-xs text-gray-500">Zmień wybraną markę lub wyczyść zapytanie w wyszukiwarce.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
