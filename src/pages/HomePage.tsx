import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { ShoppingBag, Star, Zap, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { HeroSlider } from '../components/HeroSlider';

interface HomePageProps {
  activeBrand?: string;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const querySearch = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [quickNotice, setQuickNotice] = useState<string | null>(null);

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

  const filteredProducts = products.filter((p) => {
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

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    await addToCart(product, product.colors[0] || 'Domyślny', product.sizes[0] || 'M');
    setQuickNotice(`Dodano "${product.title}" do koszyka!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* HERO BANNER SLIDER WITH OVERLAY TEXT */}
      <section className="w-[95%] mx-auto pt-6">
        <HeroSlider />
      </section>

      {/* QUICK NOTICE TOAST */}
      {quickNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center space-x-2 anim-wiggle">
          <Check className="w-5 h-5 text-yellow-300" />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-purple-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
              <Zap className="w-6 h-6 text-purple-600" />
              <span>Bestsellery i Nowości</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Kliknij w dowolny produkt, aby przejść do karty produktu i szczegółów.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-extrabold text-purple-600 hover:text-purple-800 flex items-center space-x-1 hover:underline"
          >
            <span>Zobacz wszystko</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Spinner / Product Grid */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 font-bold text-sm text-slate-600">Ładowanie produktów z bazy...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 4).map((product) => (
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

        {/* Bottom CTA to full products page */}
        <div className="text-center pt-4">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-2xl font-black text-xs shadow-sm hover:scale-105 transition-all"
          >
            <span>ZOBACZ WSZYSTKIE PRODUKTY</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
