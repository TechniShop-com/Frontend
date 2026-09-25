import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check, ShoppingBag, ShieldCheck } from 'lucide-react';

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
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wróć do listy produktów</span>
      </button>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-lg">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {product.title}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-slate-900">{product.price.toFixed(2)} zł</span>
              <span className="text-xs text-gray-400 ml-2 font-medium">zawiera VAT</span>
            </div>

            {/* Color selection */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Wybierz Kolor Koszulki Polo:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm font-bold ring-2 ring-emerald-600/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{color}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Wybierz Rozmiar:
              </label>
              <div className="flex gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm font-bold ring-2 ring-emerald-600/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Dodaj do Koszyka ({selectedColor}, {selectedSize})</span>
            </button>

            {addedNotice && (
              <p className="text-xs text-emerald-600 font-bold text-center animate-bounce">
                ✓ Dodano koszulkę do koszyka!
              </p>
            )}

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Oficjalny produkt Techni Merch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
