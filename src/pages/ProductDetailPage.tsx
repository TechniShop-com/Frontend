import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, ShoppingBag, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const [selectedColor, setSelectedColor] = useState<string>('Fioletowa');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedColor, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pt-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-black text-purple-600 hover:text-purple-800 transition-all hover:scale-105 group"
      >
        <ArrowLeft className="w-4 h-4 animate-bounce group-hover:-translate-x-1 transition-transform" />
        <span>Wróć do katalogu produktów</span>
      </button>

      <div className="relative bg-white border border-purple-100 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl shadow-purple-900/10 hover:shadow-purple-900/20 transition-all duration-500 overflow-hidden">
        {/* Glow & Wave background elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-spin-slow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

        {/* Floating Product Image Card */}
        <div className="space-y-4 relative z-10">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-xl shadow-purple-500/5 group animate-float relative">
            <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
              HOT HIT
            </span>
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Animated Details */}
        <div className="space-y-6 flex flex-col justify-between relative z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200 shadow-sm animate-bounce">
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin-slow" />
              <span>{product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}</span>
            </span>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {product.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">{product.description}</p>

            <div className="pt-2">
              <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 animate-pulse">
                {product.price.toFixed(2)} zł
              </span>
              <span className="text-xs text-purple-600/80 ml-2 font-bold">zawiera VAT</span>
            </div>

            {/* Color selection buttons */}
            <div className="space-y-2.5 pt-4 border-t border-purple-100">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-purple-600 animate-bounce" />
                <span>Wybierz Kolor Koszulki Polo:</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all duration-300 flex items-center space-x-2 ${
                        isSelected
                          ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105 animate-pulse'
                          : 'border-slate-200 bg-gray-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-105'
                      }`}
                    >
                      <span>{color}</span>
                      {isSelected && <Check className="w-4 h-4 text-white animate-bounce" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Wybierz Rozmiar:
              </label>
              <div className="flex gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all duration-300 flex items-center space-x-2 ${
                        isSelected
                          ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105 animate-pulse'
                          : 'border-slate-200 bg-gray-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-105'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <Check className="w-4 h-4 text-white animate-bounce" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add to Cart Animated Button */}
          <div className="pt-4 border-t border-purple-100 space-y-3">
            <button
              onClick={handleAdd}
              className="w-full py-4 px-6 text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.03] animate-pulse-glow"
            >
              <ShoppingBag className="w-5 h-5 animate-bounce" />
              <span>Dodaj do Koszyka ({selectedColor}, {selectedSize})</span>
            </button>

            {addedNotice && (
              <p className="text-xs text-purple-700 font-black text-center animate-bounce">
                ✓ Dodano koszulkę polo ({selectedColor}, {selectedSize}) do koszyka!
              </p>
            )}

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-purple-600/80 pt-1 font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>Gwarancja jakości Techni Schools & 100% Bawełna</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
