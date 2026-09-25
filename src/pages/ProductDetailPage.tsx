import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wróć do katalogu</span>
      </button>

      <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl shadow-cyan-950/40">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner">
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {product.title}
            </h1>

            <p className="text-xs text-cyan-100/70 leading-relaxed">{product.description}</p>

            <div className="pt-2">
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-sky-400">
                {product.price.toFixed(2)} zł
              </span>
              <span className="text-xs text-cyan-300/60 ml-2 font-medium">zawiera VAT</span>
            </div>

            {/* Color selection */}
            <div className="space-y-2.5 pt-4 border-t border-cyan-500/20">
              <label className="text-xs font-bold text-cyan-200 uppercase tracking-wider block">
                Wybierz Kolor Koszulki Polo:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center space-x-2 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20 scale-105'
                          : 'border-slate-800 bg-slate-950/70 text-gray-300 hover:border-cyan-500/40 hover:text-white'
                      }`}
                    >
                      <span>{color}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-cyan-200 uppercase tracking-wider block">
                Wybierz Rozmiar:
              </label>
              <div className="flex gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center space-x-2 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20 scale-105'
                          : 'border-slate-800 bg-slate-950/70 text-gray-300 hover:border-cyan-500/40 hover:text-white'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add to Cart Action */}
          <div className="pt-4 border-t border-cyan-500/20 space-y-3">
            <button
              onClick={handleAdd}
              className="w-full py-4 px-6 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Dodaj do Koszyka ({selectedColor}, {selectedSize})</span>
            </button>

            {addedNotice && (
              <p className="text-xs text-cyan-300 font-extrabold text-center animate-bounce">
                ✓ Dodano koszulkę polo ({selectedColor}, {selectedSize}) do koszyka!
              </p>
            )}

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-cyan-300/70 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Antigravity Glassmorphism UI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
