import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Flame,
  CornerDownLeft,
  ShoppingBag,
  Clock,
  Layers,
} from 'lucide-react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../mockData';
import { getProducts } from '../services/api';
import { searchProductsFuzzy } from '../utils/fuzzySearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = [
  'Bluza Hoodie',
  'Koszulka Polo',
  'Plecak 24L',
  'Techni Zdalni',
  'Techni Schools',
  'Oversize',
  'Butelka',
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Załaduj produkty z API lub danych mock
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (isMounted && data && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // Fallback do MOCK_PRODUCTS
        if (isMounted) setProducts(MOCK_PRODUCTS);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Autofocus przy otwarciu
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Blokada przewijania tła
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filtrowanie produktów na żywo z tolerancją literówek (Fuzzy Search)
  const searchResult = useMemo(() => {
    return searchProductsFuzzy(products, query);
  }, [products, query]);

  const filteredProducts = searchResult.results;
  const suggestedCorrection = searchResult.suggestedCorrection;
  const hasFuzzyMatch = searchResult.hasFuzzyMatch;

  // Obsługa nawigacji klawiaturą (góra / dół / enter / esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredProducts.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % filteredProducts.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredProducts.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredProducts.length > 0 && filteredProducts[selectedIndex]) {
          handleSelectProduct(filteredProducts[selectedIndex].id);
        } else if (query.trim()) {
          handleViewAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredProducts, selectedIndex, query]);

  // Scroll do wybranego elementu na klawiaturze
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      onClose();
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const highlightMatch = (text: string, term: string, suggestion?: string) => {
    const rawTarget = term.trim();
    if (!rawTarget && !suggestion) return text;
    const target =
      suggestion && text.toLowerCase().includes(suggestion.toLowerCase()) ? suggestion : rawTarget;
    if (!target) return text;

    try {
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === target.toLowerCase() ? (
              <mark key={i} className="bg-purple-200 text-purple-950 font-black rounded-xs px-0.5">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch {
      return text;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Tło z efektem rozmycia */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      <div className="min-h-full flex items-start justify-center p-4 sm:p-6 lg:p-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E3DDD2] rounded-3xl shadow-2xl overflow-hidden mt-6 sm:mt-12 animate-in zoom-in-95 fade-in duration-200"
        >
          {/* Pasek Wyszukiwania */}
          <div className="relative border-b border-[#E3DDD2] bg-white px-5 py-4 flex items-center space-x-3">
            <Search className="w-5 h-5 text-purple-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Szukaj produktów, np. bluza, polo, plecak..."
              className="w-full text-base sm:text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="w-7 h-7 rounded-full bg-[#EFECE4] hover:bg-[#E3DDD2] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Wyczyść"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-[11px] font-black uppercase text-slate-500 bg-[#FAF7F2] hover:bg-[#EFECE4] rounded-lg border border-[#DDD8CD] transition-colors cursor-pointer hidden sm:block"
            >
              ESC
            </button>
          </div>

          {/* Treść okna wyszukiwania */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
            {/* Widok początkowy: brak zapytania */}
            {!query.trim() ? (
              <div className="space-y-6 py-2">
                {/* Popularne wyszukiwania */}
                <div>
                  <div className="flex items-center space-x-2 text-xs font-black text-purple-700 uppercase tracking-wider mb-3">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Popularne wyszukiwania</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          inputRef.current?.focus();
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-[#DDD8CD] hover:border-purple-300 transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer flex items-center space-x-1.5"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Polecane produkty / Bestsellery */}
                <div className="pt-2 border-t border-[#EAE4D9]">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Polecane Bestsellery Techni</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item.id)}
                        className="group flex items-center space-x-3 p-2.5 rounded-2xl bg-white hover:bg-purple-50/50 border border-[#E3DDD2] hover:border-purple-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover border border-[#EBE6DD] group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-700 truncate transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {item.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                          </span>
                          <span className="text-xs font-black text-purple-700 mt-0.5 inline-block">
                            {item.price.toFixed(2)} zł
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Brak wyników */
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto shadow-2xs">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Brak wyników dla „{query}”
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Sprawdź, czy nie ma literówki lub spróbuj wpisać bardziej ogólne hasło (np. <em>bluza</em>, <em>polo</em>, <em>plecak</em>).
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    Wyczyść wyszukiwanie
                  </button>
                </div>
              </div>
            ) : (
              /* Lista znalezionych produktów na żywo */
              <div>
                {/* Inteligentny baner autokorekty przy wykryciu literówki lub synonimu */}
                {suggestedCorrection &&
                  query.trim().toLowerCase() !== suggestedCorrection.toLowerCase() && (
                    <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/90 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
                      <div className="flex items-center space-x-2.5 text-xs text-purple-950">
                        <span className="text-base select-none shrink-0">💡</span>
                        <span>
                          Czy chodziło Ci o:{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setQuery(suggestedCorrection);
                              inputRef.current?.focus();
                            }}
                            className="font-black text-purple-700 underline hover:text-purple-900 cursor-pointer text-xs"
                          >
                            {suggestedCorrection}
                          </button>
                          ?
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs shrink-0">
                        Wykryto literówkę
                      </span>
                    </div>
                  )}

                <div className="space-y-2" ref={listRef}>
                  <div className="px-2 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Produkty ({filteredProducts.length})</span>
                    <span className="text-[10px] lowercase font-normal text-slate-400">
                      Użyj ↑↓ i Enter
                    </span>
                  </div>

                  {filteredProducts.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md translate-x-1'
                            : 'bg-white hover:bg-purple-50/50 text-slate-900 border-[#E5E0D6]'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E3DDD2] bg-[#FAF7F2]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {item.gender === 'WOMEN'
                                  ? 'Damskie'
                                  : item.gender === 'MEN'
                                  ? 'Męskie'
                                  : 'Unisex'}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  isSelected ? 'text-purple-200' : 'text-slate-400'
                                }`}
                              >
                                {item.brand === 'TECHNI_ZDALNI' ? 'Techni Zdalni' : 'Techni Schools'}
                              </span>
                            </div>

                            <h4
                              className={`text-xs sm:text-sm font-extrabold truncate mt-0.5 ${
                                isSelected ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {highlightMatch(item.title, query, suggestedCorrection)}
                            </h4>
                          </div>
                        </div>

                      <div className="flex items-center space-x-3 shrink-0 pl-3">
                        <span
                          className={`text-xs sm:text-sm font-black ${
                            isSelected ? 'text-yellow-300' : 'text-slate-900'
                          }`}
                        >
                          {item.price.toFixed(2)} zł
                        </span>
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform ${
                            isSelected
                              ? 'bg-white/20 text-white translate-x-0.5'
                              : 'text-slate-400 group-hover:text-purple-600'
                          }`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          {/* Dolny pasek podsumowujący */}
          {query.trim() && filteredProducts.length > 0 && (
            <div className="border-t border-[#E3DDD2] bg-[#EFECE4] px-5 py-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                Liczba trafień: <strong className="text-purple-700">{filteredProducts.length}</strong>
              </span>
              <button
                onClick={handleViewAll}
                className="inline-flex items-center space-x-1.5 font-black text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
              >
                <span>Zobacz wszystkie w katalogu</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
