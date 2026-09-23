import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[1]);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedColor, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-xs text-gray-500 underline mb-4 inline-block">
        ← Wróć do listy
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
        <div>
          <img src={product.imageUrl} alt={product.title} className="w-full h-72 object-cover rounded-xl border" />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
          <div className="text-2xl font-extrabold text-slate-900">{product.price.toFixed(2)} zł</div>

          {/* Color options selection */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-bold text-gray-700 block">Wybierz kolor:</label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedColor === color
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size options selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Wybierz rozmiar:</label>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedSize === size
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div className="pt-4">
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Dodaj do Koszyka ({selectedColor}, {selectedSize})
            </button>
            {addedNotice && (
              <p className="text-xs text-emerald-600 font-bold text-center mt-2">
                ✓ Dodano do koszyka!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
