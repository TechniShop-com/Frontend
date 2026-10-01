import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Zap, Check, Loader2, Heart, Sparkles } from 'lucide-react';

const getColorHex = (colorName: string): string => {
  const c = colorName.toLowerCase();
  if (c.includes('fiolet')) return '#7C3AED';
  if (c.includes('czarn')) return '#18181B';
  if (c.includes('biał')) return '#FFFFFF';
  if (c.includes('szar')) return '#94A3B8';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#8B5CF6';
};

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categoryParam = searchParams.get('category') || 'all';
  const querySearch = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [quickNotice, setQuickNotice] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        if (isMounted && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Backend niedostępny, używam danych mock:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      let matchesCategory = true;
      if (categoryParam === 'kobiety') {
        matchesCategory = p.gender === 'WOMEN' || p.gender === 'UNISEX';
      } else if (categoryParam === 'mezczyzni') {
        matchesCategory = p.gender === 'MEN' || p.gender === 'UNISEX';
      } else if (categoryParam === 'akcesoria') {
        matchesCategory =
          p.title.toLowerCase().includes('plecak') ||
          p.title.toLowerCase().includes('butelka') ||
          p.title.toLowerCase().includes('czapka');
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
  }, [products, categoryParam, querySearch, sortBy]);

  const handleCategorySelect = (cat: string) => {
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    await addToCart(product, product.colors[0] || 'Domyślny', product.sizes[0] || 'M');
    setQuickNotice(`Dodano "${product.title}" do koszyka!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  const handleQuickSizeAdd = async (e: React.MouseEvent, product: Product, size: string) => {
    e.stopPropagation();
    await addToCart(product, product.colors[0] || 'Domyślny', size);
    setQuickNotice(`Dodano "${product.title}" (${size}) do koszyka!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
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

      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 font-bold text-sm text-slate-600">Ładowanie produktów z bazy danych...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EBE6DD] p-12 text-center space-y-4 shadow-xs">
          <Zap className="w-12 h-12 mx-auto text-purple-400" />
          <h3 className="text-lg font-black text-slate-900">Brak produktów spełniających kryteria</h3>
          <p className="text-xs text-slate-500">Spróbuj zmienić kategorię lub wyczyścić wyszukiwanie.</p>
          <button
            onClick={() => handleCategorySelect('all')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Pokaż wszystkie produkty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group bg-white rounded-3xl border border-[#E7E2D8] hover:border-purple-300 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-purple-950/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
              >
                {/* Product Image Container (Modern 3:4 fashion ratio) */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EBE6DD] mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-xs">
                      {product.gender === 'WOMEN'
                        ? 'Damskie'
                        : product.gender === 'MEN'
                        ? 'Męskie'
                        : 'Unisex'}
                    </span>
                  </div>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
                      isWishlisted
                        ? 'bg-rose-50 text-rose-600 scale-110'
                        : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:scale-110'
                    }`}
                    title={isWishlisted ? 'Usuń z listy życzeń' : 'Dodaj do listy życzeń'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                  </button>

                  {/* Brand Tag Bottom Right */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FAF7F2]/95 text-purple-900 shadow-xs border border-[#E2DDD3] z-10">
                    {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                  </span>

                  {/* Quick Size Picker on Hover (Reserved / Zara / Gymshark style) */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="absolute inset-x-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0 flex items-center justify-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider mr-0.5">
                        Rozmiar:
                      </span>
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={(e) => handleQuickSizeAdd(e, product, sz)}
                          className="min-w-6 h-6 px-1.5 text-[10px] font-black rounded-md bg-[#FAF7F2] hover:bg-purple-600 hover:text-white text-slate-800 border border-[#DDD8CD] transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                          title={`Kup rozmiar ${sz}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info & Rating */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-yellow-500 text-xs font-bold">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-current" />
                      ))}
                      <span className="text-slate-400 text-[10px] font-normal ml-1">(5.0)</span>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center space-x-1.5" title={`Kolory: ${product.colors.join(', ')}`}>
                      {product.colors.slice(0, 3).map((col) => (
                        <span
                          key={col}
                          className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs inline-block"
                          style={{ backgroundColor: getColorHex(col) }}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-[9px] font-bold text-slate-400">+{product.colors.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {product.description}
                  </p>

                  <div className="pt-1 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900">
                      {product.price.toFixed(2)} <span className="text-xs font-bold">zł</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Darmowa od 200 zł
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3.5">
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>DODAJ DO KOSZYKA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
