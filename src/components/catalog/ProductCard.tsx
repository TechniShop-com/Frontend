import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ShoppingCart, GraduationCap, Laptop, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const minPrice = product.variants.length
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const renderBrandBadge = () => {
    if (product.brand === 'TECHNI_SCHOOLS') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <GraduationCap className="w-3 h-3" />
          <span>Techni Schools</span>
        </span>
      );
    }
    if (product.brand === 'TECHNI_ZDALNI') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
          <Laptop className="w-3 h-3" />
          <span>Techni Zdalni</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
        <Sparkles className="w-3 h-3" />
        <span>Kolekcja Wspólna</span>
      </span>
    );
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants.length > 0) {
      const availableVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
      addToCart(product, availableVariant, 1);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">{renderBrandBadge()}</div>
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-sm uppercase tracking-wider">
            Niedostępny
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 text-base">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Cena od</span>
            <span className="text-lg font-extrabold text-slate-900">{minPrice.toFixed(2)} zł</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={totalStock === 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white transition-all disabled:opacity-40 disabled:hover:bg-slate-900 shadow-sm"
            title="Dodaj najpopularniejszy wariant"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
