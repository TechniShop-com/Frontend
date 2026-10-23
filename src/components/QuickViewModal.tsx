import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Zap,
  Check,
  Star,
  Truck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const getColorHex = (colorName: string): string => {
  const c = colorName.toLowerCase();
  if (c.includes('fiolet')) return '#7C3AED';
  if (c.includes('czarn')) return '#18181B';
  if (c.includes('biał')) return '#FFFFFF';
  if (c.includes('szar')) return '#94A3B8';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#8B5CF6';
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Synchronizacja po wybraniu innego produktu
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || 'Domyślny');
      setSelectedSize(product.sizes[0] || 'M');
      setQuantity(1);
      setAddedNotice(false);
    }
  }, [product]);

  // Obsługa klawisza Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Blokada przewijania tła gdy modal jest otwarty
  useEffect(() => {
    if (isOpen && product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    await addToCart(product, selectedColor, selectedSize, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 2000);
  };

  const handleBuyNow = async () => {
    await addToCart(product, selectedColor, selectedSize, quantity);
    onClose();
    navigate('/checkout');
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Przyciemnione rozmyte tło (Backdrop) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#E3DDD2] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8"
        >
          {/* Przycisk Zamknij X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center border border-[#DDD8CD] shadow-xs transition-colors cursor-pointer"
            title="Zamknij (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* LEWA KOLUMNA: Zdjęcie i paski zaufania */}
            <div className="md:col-span-6 p-6 sm:p-8 bg-[#F3EFE7]/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E2D8]">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E2DDD3] shadow-inner group">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Etykieta Płci */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                    {product.gender === 'WOMEN'
                      ? 'Damskie'
                      : product.gender === 'MEN'
                      ? 'Męskie'
                      : 'Unisex'}
                  </span>
                </div>

                {/* Etykieta Marki */}
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FAF7F2]/95 text-purple-900 shadow-xs border border-[#E2DDD3]">
                  {product.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                </span>
              </div>

              {/* Pasek zaufania poniżej zdjęcia */}
              <div className="grid grid-cols-3 gap-2.5 pt-5 text-center">
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-2.5 shadow-2xs">
                  <Truck className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                  <div className="text-[10px] font-black text-slate-800">Dostawa 24h</div>
                  <div className="text-[9px] text-slate-500">InPost & Kurier</div>
                </div>
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-2.5 shadow-2xs">
                  <RotateCcw className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                  <div className="text-[10px] font-black text-slate-800">14 dni zwrot</div>
                  <div className="text-[9px] text-slate-500">Bez pytań</div>
                </div>
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-2.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-[10px] font-black text-slate-800">380g/m²</div>
                  <div className="text-[9px] text-slate-500">Gruby haft</div>
                </div>
              </div>
            </div>

            {/* PRAWA KOLUMNA: Szczegóły, Wybór parametrów i Akcje */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Kategoria i Gwiazdki */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Szybki Podgląd
                  </span>

                  <div className="flex items-center space-x-1 text-yellow-500 text-xs font-bold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-slate-400 text-[10px] font-semibold ml-1">(5.0)</span>
                  </div>
                </div>

                {/* Tytuł i Cena */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {product.title}
                  </h3>
                  <div className="pt-2 flex items-baseline space-x-3">
                    <span className="text-2xl font-black text-purple-700">
                      {product.price.toFixed(2)} <span className="text-sm font-bold">zł</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Darmowa dostawa od 200 zł
                    </span>
                  </div>
                </div>

                {/* Krótki opis */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>

                {/* WYBÓR KOLORU */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#EAE4D9]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Kolor:</span>
                      <span className="font-bold text-purple-700">{selectedColor}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      {product.colors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-purple-600 text-purple-700 ring-2 ring-purple-600/20 shadow-xs'
                                : 'bg-white/80 border-[#DDD8CD] text-slate-700 hover:border-purple-300'
                            }`}
                            title={`Wybierz kolor ${color}`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-2xs"
                              style={{ backgroundColor: getColorHex(color) }}
                            />
                            <span>{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WYBÓR ROZMIARU */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Rozmiar:</span>
                      <span className="text-[11px] text-slate-400 font-medium">Krój regular / oversize</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-10 h-10 px-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105'
                                : 'bg-white text-slate-800 border border-[#DDD8CD] hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WYBÓR ILOŚCI */}
                <div className="flex items-center space-x-4 pt-2">
                  <span className="text-xs font-extrabold text-slate-800">Ilość:</span>
                  <div className="flex items-center border border-[#DDD8CD] rounded-xl bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors disabled:opacity-30 cursor-pointer"
                      disabled={quantity <= 1}
                      title="Zmniejsz ilość"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center font-black text-xs text-slate-900 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors disabled:opacity-30 cursor-pointer"
                      disabled={quantity >= 10}
                      title="Zwiększ ilość"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Razem: <strong className="text-slate-900 font-bold">{(product.price * quantity).toFixed(2)} zł</strong>
                  </span>
                </div>
              </div>

              {/* PRZYCISKI AKCJI */}
              <div className="space-y-2.5 pt-4 border-t border-[#EAE4D9]">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    addedNotice
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.01]'
                      : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-purple-600/25 hover:shadow-lg'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-yellow-300" />
                      <span>DODANO DO KOSZYKA!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>DODAJ DO KOSZYKA ({(product.price * quantity).toFixed(2)} ZŁ)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>KUP TERAZ I PRZEJDŹ DO KASY</span>
                </button>

                {/* Link do pełnej karty produktu */}
                <div className="text-center pt-2">
                  <button
                    onClick={handleViewFullDetails}
                    className="inline-flex items-center space-x-1.5 text-xs font-black text-purple-700 hover:text-purple-900 hover:underline transition-colors cursor-pointer"
                  >
                    <span>Zobacz pełną kartę produktu i parametry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
