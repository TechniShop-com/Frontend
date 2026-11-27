import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Zap,
  Check,
  Star,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Product, ReviewStats } from '../types';
import { useCart } from '../context/CartContext';
import { getProductReviewsApi } from '../services/api';
import { getColorHex } from '../utils/color';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const addedNoticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || 'Domyślny');
      setSelectedSize(product.sizes[0] || 'M');
      setQuantity(1);
      setAddedNotice(false);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (addedNoticeTimerRef.current !== null) {
        window.clearTimeout(addedNoticeTimerRef.current);
      }
    };
  }, [product?.id]);

  // Load real review stats only when product doesn't carry an explicit rating
  useEffect(() => {
    if (!isOpen || !product) {
      setReviewStats(null);
      return;
    }
    if (typeof product.rating === 'number' && Number.isFinite(product.rating)) {
      setReviewStats(null);
      return;
    }

    let active = true;
    void getProductReviewsApi(product.id)
      .then((data) => {
        if (active) setReviewStats(data.stats);
      })
      .catch(() => {
        if (active) setReviewStats(null);
      });

    return () => {
      active = false;
    };
  }, [isOpen, product?.id, product?.rating]);

  // Lock scroll, move focus into modal, trap Tab navigation, handle Escape, and restore focus
  useEffect(() => {
    if (!isOpen || !product) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialogRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const canPurchase = product.stock != null && product.stock > 0;
  const maxQuantity = canPurchase ? Math.min(10, product.stock as number) : 1;
  const safeQuantity = Math.min(quantity, maxQuantity);

  const explicitRating =
    typeof product.rating === 'number' &&
    Number.isFinite(product.rating) &&
    product.rating > 0
      ? Math.min(5, Math.max(0, product.rating))
      : null;

  const reviewRating =
    explicitRating === null && reviewStats && reviewStats.totalReviews > 0
      ? reviewStats.averageRating
      : null;

  const displayRating = explicitRating ?? reviewRating;
  const filledStars = displayRating !== null ? Math.round(displayRating) : 0;

  const primaryImage = product.images?.[0] || product.imageUrl;

  const handleAddToCart = async () => {
    if (!canPurchase) return;
    await addToCart(product, selectedColor, selectedSize, safeQuantity);
    setAddedNotice(true);
    if (addedNoticeTimerRef.current !== null) {
      window.clearTimeout(addedNoticeTimerRef.current);
    }
    addedNoticeTimerRef.current = window.setTimeout(() => {
      setAddedNotice(false);
    }, 2000);
  };

  const handleBuyNow = async () => {
    if (!canPurchase) return;
    await addToCart(product, selectedColor, selectedSize, safeQuantity);
    onClose();
    navigate('/checkout');
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Przyciemnione rozmyte tło (Backdrop) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      <div
        className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#E3DDD2] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8"
        >
          {/* Przycisk Zamknij X */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center border border-[#DDD8CD] shadow-xs transition-colors cursor-pointer"
            title="Zamknij (Esc)"
            aria-label="Zamknij szybki podgląd"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* LEWA KOLUMNA: Zdjęcie i paski zaufania */}
            <div className="md:col-span-6 p-6 sm:p-8 bg-[#F3EFE7]/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E2D8]">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E2DDD3] shadow-inner group">
                <img
                  src={primaryImage}
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
              <div className="grid grid-cols-2 gap-2.5 pt-5 text-center">
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-2.5 shadow-2xs">
                  <Truck className="w-4 h-4 mx-auto text-purple-600 mb-1" aria-hidden="true" />
                  <div className="text-[10px] font-black text-slate-800">Dostawa 24h</div>
                  <div className="text-[9px] text-slate-500">InPost & Kurier</div>
                </div>
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-2.5 shadow-2xs">
                  <RotateCcw className="w-4 h-4 mx-auto text-emerald-600 mb-1" aria-hidden="true" />
                  <div className="text-[10px] font-black text-slate-800">14 dni zwrot</div>
                  <div className="text-[9px] text-slate-500">Bez pytań</div>
                </div>
              </div>
            </div>

            {/* PRAWA KOLUMNA: Szczegóły, Wybór parametrów i Akcje */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Kategoria i Ocena */}
                <div className="flex items-center justify-between pr-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Szybki Podgląd
                  </span>

                  {displayRating !== null && (
                    <div
                      className="flex items-center space-x-1 text-yellow-500 text-xs font-bold"
                      aria-label={`Ocena produktu: ${displayRating.toFixed(1)} na 5`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          aria-hidden="true"
                          className={`w-3.5 h-3.5 ${
                            s <= filledStars ? 'fill-current text-yellow-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-slate-500 text-[10px] font-semibold ml-1">
                        ({displayRating.toFixed(1)}
                        {reviewStats && explicitRating === null
                          ? ` • ${reviewStats.totalReviews}`
                          : ''}
                        )
                      </span>
                    </div>
                  )}
                </div>

                {/* Tytuł i Cena */}
                <div>
                  <h2
                    id="quick-view-title"
                    className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug"
                  >
                    {product.title}
                  </h2>
                  <div className="pt-2 flex flex-wrap items-baseline gap-2.5">
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
                    <div className="flex flex-wrap items-center gap-2">
                      {product.colors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            aria-pressed={isSelected}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-purple-600 text-purple-700 ring-2 ring-purple-600/20 shadow-xs'
                                : 'bg-white/80 border-[#DDD8CD] text-slate-700 hover:border-purple-300'
                            }`}
                            title={`Wybierz kolor ${color}`}
                          >
                            <span
                              aria-hidden="true"
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
                      <span className="text-[11px] font-medium">
                        {product.stock == null ? (
                          <span className="text-slate-500">Dostępność niepotwierdzona</span>
                        ) : product.stock <= 0 ? (
                          <span className="text-red-600 font-bold">Produkt wyprzedany</span>
                        ) : product.stock <= 10 ? (
                          <span className="text-amber-700 font-bold">
                            Ostatnie {product.stock} szt.
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">
                            Dostępne: {product.stock} szt.
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            aria-pressed={isSelected}
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
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      disabled={!canPurchase || safeQuantity <= 1}
                      title="Zmniejsz ilość"
                      aria-label="Zmniejsz ilość"
                    >
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span
                      aria-live="polite"
                      className="w-9 text-center font-black text-xs text-slate-900 select-none"
                    >
                      {safeQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      disabled={!canPurchase || safeQuantity >= maxQuantity}
                      title="Zwiększ ilość"
                      aria-label="Zwiększ ilość"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Razem:{' '}
                    <strong className="text-slate-900 font-bold">
                      {(product.price * safeQuantity).toFixed(2)} zł
                    </strong>
                  </span>
                </div>
              </div>

              {/* PRZYCISKI AKCJI */}
              <div className="space-y-2.5 pt-4 border-t border-[#EAE4D9]">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canPurchase}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                    !canPurchase
                      ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed'
                      : addedNotice
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[1.01] cursor-pointer'
                      : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-purple-600/25 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  {!canPurchase ? (
                    <>
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {product.stock == null
                          ? 'DOSTĘPNOŚĆ NIEPOTWIERDZONA'
                          : 'BRAK W MAGAZYNIE'}
                      </span>
                    </>
                  ) : addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-yellow-300" aria-hidden="true" />
                      <span>DODANO DO KOSZYKA!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>
                        DODAJ DO KOSZYKA ({(product.price * safeQuantity).toFixed(2)} ZŁ)
                      </span>
                    </>
                  )}
                </button>

                {canPurchase && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                    <span>KUP TERAZ I PRZEJDŹ DO KASY</span>
                  </button>
                )}

                {/* Link do pełnej karty produktu */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleViewFullDetails}
                    className="inline-flex items-center space-x-1.5 text-xs font-black text-purple-700 hover:text-purple-900 hover:underline transition-colors cursor-pointer"
                  >
                    <span>Zobacz pełną kartę produktu i parametry</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
