import React, { useState } from 'react';
import { Product } from '../types';
import { Product3DViewer } from './Product3DViewer';
import { X, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Model3DModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Model3DModal: React.FC<Model3DModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0] || 'Fioletowa'
  );
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [addedNotice, setAddedNotice] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    addToCart(product, selectedColor, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md anim-fade-in">
      <div className="bg-white rounded-3xl border border-[#E7E2D8] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:w-3/5 h-[380px] md:h-auto bg-[#FAF7F2] relative">
          <Product3DViewer
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            availableColors={product.colors}
            height="h-full"
            autoRotateDefault={true}
          />
        </div>

        <div className="md:w-2/5 p-6 space-y-5 flex flex-col justify-between overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-[#EBE6DD]">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                Podgląd 3D 360°
              </span>
              <span className="text-[10px] font-bold text-slate-400">ID: {product.id}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h3>

            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
              {product.description}
            </p>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">
                {product.price.toFixed(2)} <span className="text-lg font-bold">zł</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Wybrany Kolor 3D: <span className="text-purple-700 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedColor === c
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-[#DDD8CD] bg-[#FAF7F2] text-slate-700 hover:border-purple-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Rozmiar: <span className="text-purple-700 font-semibold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === s
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-[#DDD8CD] bg-[#FAF7F2] text-slate-700 hover:border-purple-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#EBE6DD]">
            {addedNotice && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dodano produkt w trójwymiarze do koszyka!</span>
              </div>
            )}

            <button
              onClick={handleAdd}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>DODAJ DO KOSZYKA</span>
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Darmowy zwrot w ciągu 14 dni & Dostawa w 24h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DModal;
