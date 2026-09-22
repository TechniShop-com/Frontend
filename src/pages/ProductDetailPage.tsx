import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useBrandTheme } from '../context/BrandThemeContext';
import { ShoppingBag, ArrowLeft, Check, AlertTriangle, Truck, ShieldCheck, MapPin } from 'lucide-react';
import axios from 'axios';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { brandStyles } = useBrandTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        if (res.data.variants && res.data.variants.length > 0) {
          // Select first variant in stock or first overall
          const defaultVar = res.data.variants.find((v: ProductVariant) => v.stock > 0) || res.data.variants[0];
          setSelectedVariant(defaultVar);
        }
      } catch (err) {
        setError('Nie udało się pobrać szczegółów produktu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-96 bg-gray-200 rounded-3xl max-w-4xl mx-auto"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Nie znaleziono produktu</h2>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Wróć do katalogu
        </button>
      </div>
    );
  }

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  const handleAddToCart = () => {
    if (selectedVariant && !isOutOfStock) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wróć do przeglądania</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={selectedVariant?.imageUrl || product.imageUrl || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details & Variant Selector */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {product.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {product.title}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="pt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {selectedVariant ? selectedVariant.price.toFixed(2) : '0.00'} zł
              </span>
              <span className="text-xs text-gray-400 ml-2 font-medium">zawiera VAT</span>
            </div>

            {/* Variants Picker */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Dostępne Warianty (Rozmiar / Kolor):
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vStock = v.stock;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                            : vStock === 0
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>
                          {[v.size, v.color].filter(Boolean).join(' - ') || 'Domyślny'}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="pt-2 text-xs">
              {isOutOfStock ? (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Brak wariantu w magazynie (nie można kupić).
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Dostępne w magazynie ({selectedVariant?.stock} szt.)
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-gray-600 font-bold hover:text-gray-900"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(selectedVariant ? selectedVariant.stock : 1, q + 1))
                  }
                  className="px-3 py-1.5 text-gray-600 font-bold hover:text-gray-900"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                  isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : brandStyles.buttonBg
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Dodaj do Koszyka</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-[11px] text-gray-500 border-t border-gray-100">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Odbiór w szkole za 0 zł</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Wysyłka w 24h</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Płatności Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
