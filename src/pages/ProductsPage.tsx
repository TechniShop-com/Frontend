import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Zap, Search, ArrowUpDown, Check } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categoryParam = searchParams.get('category') || 'all';
  const querySearch = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS.filter((p) => {
      let matchesCategory = true;
      if (categoryParam === 'kobiety') {
        matchesCategory = p.gender === 'WOMEN' || p.gender === 'UNISEX';
      } else if (categoryParam === 'mezczyzni') {
        matchesCategory = p.gender === 'MEN' || p.gender === 'UNISEX';
      }

      const matchesQuery =
        !querySearch ||
        p.title.toLowerCase().includes(querySearch.toLowerCase()) ||
        p.description.toLowerCase().includes(querySearch.toLowerCase());

      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [categoryParam, querySearch, sortBy]);

  const handleCategorySelect = (cat: string) => {
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: typeof MOCK_PRODUCTS[0]) => {
    e.stopPropagation();
    addToCart(product, product.colors[0] || 'Domyślny', product.sizes[0] || 'M');
    setQuickNotice(`Dodano "${product.title}" do koszyka!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {quickNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center space-x-2 anim-wiggle">
          <Check className="w-5 h-5 text-yellow-300" />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* Product Grid - Clean, Clickable Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center space-y-4 shadow-sm">
          <Zap className="w-12 h-12 mx-auto text-purple-400" />
          <h3 className="text-lg font-black text-slate-900">Brak produktów spełniających kryteria</h3>
          <p className="text-xs text-slate-500">Spróbuj zmienić kategorię lub wyczyścić wyszukiwanie.</p>
          <button
            onClick={() => handleCategorySelect('all')}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/30"
          >
            Pokaż wszystkie produkty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group bg-white rounded-2xl border border-purple-100 hover:border-purple-300 p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              {/* Product Image Container */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-purple-50/50 border border-purple-100 mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-md">
                  {product.gender === 'WOMEN'
                    ? 'Damskie'
                    : product.gender === 'MEN'
                    ? 'Męskie'
                    : 'Unisex'}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/90 text-purple-800 shadow-sm border border-purple-200">
                  {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                </span>
              </div>

              {/* Info & Rating */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-yellow-400 text-xs font-bold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-gray-400 text-[10px] font-normal ml-1">(5.0)</span>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>

                {/* Color preview tags */}
                <div className="pt-1 flex items-center space-x-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Warianty:</span>
                  <span className="text-[11px] font-semibold text-purple-700">
                    {product.colors.join(', ')}
                  </span>
                </div>

                <div className="text-xl font-black text-gray-900 pt-2 flex items-baseline justify-between">
                  <span>{product.price.toFixed(2)} zł</span>
                  <span className="text-[10px] font-bold text-purple-600">Darmowa dostawa</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={(e) => handleQuickAdd(e, product)}
                  className="w-full py-2.5 px-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>DODAJ DO KOSZYKA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
