import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Ruler,
  Check,
  UserCheck,
  Sliders,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';

export type BodyBuild = 'SLIM' | 'REGULAR' | 'ATHLETIC';
export type FitPreference = 'TIGHT' | 'REGULAR' | 'OVERSIZE';
export type GarmentCategory = 'HOODIE' | 'POLO' | 'TSHIRT';

export interface FitProfile {
  height: number;
  weight: number;
  build: BodyBuild;
  preference: FitPreference;
  recommendedSize: string;
}

const STORAGE_KEY = 'techni_fit_profile';

export const ORDERED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const VALID_BUILDS: BodyBuild[] = ['SLIM', 'REGULAR', 'ATHLETIC'];
const VALID_PREFERENCES: FitPreference[] = ['TIGHT', 'REGULAR', 'OVERSIZE'];

const GARMENT_SIZE_TABLES: Record<
  GarmentCategory,
  Record<string, { chest: number; length: number; sleeve: number }>
> = {
  TSHIRT: {
    XS: { chest: 48, length: 66, sleeve: 20 },
    S: { chest: 51, length: 69, sleeve: 21 },
    M: { chest: 54, length: 72, sleeve: 22 },
    L: { chest: 57, length: 75, sleeve: 23 },
    XL: { chest: 61, length: 78, sleeve: 24 },
    XXL: { chest: 65, length: 81, sleeve: 25 },
  },
  POLO: {
    XS: { chest: 46, length: 65, sleeve: 19 },
    S: { chest: 49, length: 68, sleeve: 20 },
    M: { chest: 52, length: 71, sleeve: 21 },
    L: { chest: 55, length: 74, sleeve: 22 },
    XL: { chest: 59, length: 77, sleeve: 23 },
    XXL: { chest: 63, length: 80, sleeve: 24 },
  },
  HOODIE: {
    XS: { chest: 52, length: 67, sleeve: 61 },
    S: { chest: 56, length: 70, sleeve: 63 },
    M: { chest: 59, length: 73, sleeve: 65 },
    L: { chest: 62, length: 76, sleeve: 67 },
    XL: { chest: 66, length: 79, sleeve: 69 },
    XXL: { chest: 70, length: 82, sleeve: 71 },
  },
};

export const detectGarmentCategory = (productTitle?: string): GarmentCategory => {
  const normalized = (productTitle || '').toLowerCase();
  if (normalized.includes('bluza') || normalized.includes('hoodie')) {
    return 'HOODIE';
  }
  if (normalized.includes('polo')) {
    return 'POLO';
  }
  return 'TSHIRT';
};

export const supportsFitFinder = (product?: Product | null): boolean => {
  if (!product || !Array.isArray(product.sizes) || product.sizes.length === 0) {
    return false;
  }
  return product.sizes.some((s) => ORDERED_SIZES.includes(s));
};

export const loadSavedFitProfile = (): FitProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.height !== 'number' ||
      parsed.height < 120 ||
      parsed.height > 240 ||
      typeof parsed.weight !== 'number' ||
      parsed.weight < 30 ||
      parsed.weight > 200 ||
      !VALID_BUILDS.includes(parsed.build) ||
      !VALID_PREFERENCES.includes(parsed.preference) ||
      typeof parsed.recommendedSize !== 'string' ||
      !ORDERED_SIZES.includes(parsed.recommendedSize)
    ) {
      return null;
    }
    return {
      height: parsed.height,
      weight: parsed.weight,
      build: parsed.build,
      preference: parsed.preference,
      recommendedSize: parsed.recommendedSize,
    };
  } catch {
    return null;
  }
};

export const calculateFitRecommendation = (
  height: number,
  weight: number,
  build: BodyBuild,
  preference: FitPreference,
  availableSizes: string[] = ORDERED_SIZES,
  garmentCategory: GarmentCategory = 'TSHIRT'
) => {
  const heightScore = (height - 155) / 10;
  const weightScore = (weight - 50) / 12;
  let score = heightScore * 0.45 + weightScore * 0.55;

  if (build === 'SLIM') score -= 0.35;
  if (build === 'ATHLETIC') score += 0.45;

  if (preference === 'TIGHT') score -= 0.55;
  if (preference === 'OVERSIZE') score += 0.7;

  if (garmentCategory === 'POLO') score += 0.15;
  if (garmentCategory === 'HOODIE') score -= 0.1;

  const clampedIndex = Math.max(0, Math.min(ORDERED_SIZES.length - 1, Math.round(score)));
  let primarySize = ORDERED_SIZES[clampedIndex];

  const validAvailable = availableSizes.filter((s) => ORDERED_SIZES.includes(s));
  if (validAvailable.length > 0 && !validAvailable.includes(primarySize)) {
    let closest = validAvailable[0];
    let minDiff = 999;
    validAvailable.forEach((s) => {
      const idx = ORDERED_SIZES.indexOf(s);
      const diff = Math.abs(idx - clampedIndex);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    });
    primarySize = closest;
  }

  const primaryIdx = ORDERED_SIZES.indexOf(primarySize);
  const smallerSize = primaryIdx > 0 ? ORDERED_SIZES[primaryIdx - 1] : null;
  const largerSize = primaryIdx < ORDERED_SIZES.length - 1 ? ORDERED_SIZES[primaryIdx + 1] : null;

  const table = GARMENT_SIZE_TABLES[garmentCategory] || GARMENT_SIZE_TABLES.TSHIRT;
  const dimensions = table[primarySize] || table.M;

  return {
    primarySize,
    smallerSize:
      smallerSize && (!validAvailable.length || validAvailable.includes(smallerSize))
        ? smallerSize
        : null,
    largerSize:
      largerSize && (!validAvailable.length || validAvailable.includes(largerSize))
        ? largerSize
        : null,
    dimensions,
    garmentCategory,
  };
};

interface FitFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  availableSizes?: string[];
  onSelectSize?: (size: string) => void;
}

export const FitFinderModal: React.FC<FitFinderModalProps> = ({
  isOpen,
  onClose,
  productTitle = 'Odzież Techni',
  availableSizes = ['XS', 'S', 'M', 'L', 'XL'],
  onSelectSize,
}) => {
  const saved = useMemo(() => loadSavedFitProfile(), [isOpen]);

  const [height, setHeight] = useState<number>(saved?.height || 176);
  const [weight, setWeight] = useState<number>(saved?.weight || 70);
  const [build, setBuild] = useState<BodyBuild>(saved?.build || 'REGULAR');
  const [preference, setPreference] = useState<FitPreference>(saved?.preference || 'REGULAR');
  const [step, setStep] = useState<'form' | 'result'>('form');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const hasValidSizes = availableSizes.some((size) => ORDERED_SIZES.includes(size));

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const currentSaved = loadSavedFitProfile();
      if (currentSaved) {
        setHeight(currentSaved.height);
        setWeight(currentSaved.weight);
        setBuild(currentSaved.build);
        setPreference(currentSaved.preference);
      }
      setStep('form');
    }
  }, [isOpen]);

  const garmentCategory = useMemo(() => detectGarmentCategory(productTitle), [productTitle]);

  const recommendation = useMemo(
    () =>
      calculateFitRecommendation(
        height,
        weight,
        build,
        preference,
        availableSizes,
        garmentCategory
      ),
    [height, weight, build, preference, availableSizes, garmentCategory]
  );

  useEffect(() => {
    if (!isOpen || !hasValidSizes) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, hasValidSizes]);

  if (!isOpen) return null;

  if (!hasValidSizes) return null;

  const handleCalculate = () => {
    const profile: FitProfile = {
      height,
      weight,
      build,
      preference,
      recommendedSize: recommendation.primarySize,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('fitProfileUpdated'));
    setStep('result');
  };

  const handleApplySize = (sizeToApply: string) => {
    const profile: FitProfile = {
      height,
      weight,
      build,
      preference,
      recommendedSize: sizeToApply,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('fitProfileUpdated'));
    if (onSelectSize) {
      onSelectSize(sizeToApply);
    }
    onClose();
  };

  const handleReset = () => {
    setHeight(176);
    setWeight(70);
    setBuild('REGULAR');
    setPreference('REGULAR');
    setStep('form');
  };

  const categoryLabel =
    garmentCategory === 'HOODIE'
      ? 'Bluza Hoodie'
      : garmentCategory === 'POLO'
      ? 'Koszulka Polo'
      : 'T-Shirt';

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="fitfinder-title" className="bg-white rounded-3xl border border-[#E7E2D8] max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        <div className="bg-[#FAF8F5] border-b border-[#EBE6DD] p-5 sm:p-6 text-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Techni FitFinder
                </span>
              </div>
              <h3 id="fitfinder-title" className="text-lg sm:text-xl font-black tracking-tight">
                Asystent Doboru Rozmiaru
              </h3>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Zamknij asystenta rozmiaru"
            className="w-10 h-10 rounded-full bg-white hover:bg-purple-50 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {step === 'form' ? (
            <>
              <div className="flex items-center justify-between bg-[#FAF7F2] px-4 py-3 rounded-2xl border border-[#EBE6DD] text-xs">
                <span className="text-slate-600 font-medium">
                  Dobierasz rozmiar dla: <strong className="text-slate-900">{productTitle}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Ruler className="w-4 h-4 text-purple-600" />
                      <span>Wzrost</span>
                    </label>
                    <div className="flex items-baseline space-x-1">
                      <input
                        type="number"
                        min={145}
                        max={210}
                        value={height}
                        onChange={(e) =>
                          setHeight(Math.max(145, Math.min(210, Number(e.target.value) || 145)))
                        }
                        className="w-16 text-right font-black text-lg text-purple-700 bg-white border border-[#DDD8CD] rounded-lg px-2 py-0.5"
                      />
                      <span className="text-xs font-bold text-slate-500">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={145}
                    max={210}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>145 cm</span>
                    <span>175 cm</span>
                    <span>210 cm</span>
                  </div>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-purple-600" />
                      <span>Waga</span>
                    </label>
                    <div className="flex items-baseline space-x-1">
                      <input
                        type="number"
                        min={40}
                        max={130}
                        value={weight}
                        onChange={(e) =>
                          setWeight(Math.max(40, Math.min(130, Number(e.target.value) || 40)))
                        }
                        className="w-16 text-right font-black text-lg text-purple-700 bg-white border border-[#DDD8CD] rounded-lg px-2 py-0.5"
                      />
                      <span className="text-xs font-bold text-slate-500">kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={130}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>40 kg</span>
                    <span>85 kg</span>
                    <span>130 kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Budowa sylwetki
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'SLIM' as BodyBuild, label: 'Szczupła', desc: 'Węższe ramiona' },
                    { id: 'REGULAR' as BodyBuild, label: 'Standardowa', desc: 'Proporcjonalna' },
                    { id: 'ATHLETIC' as BodyBuild, label: 'Atletyczna', desc: 'Szersza klatka' },
                  ].map((item) => {
                    const active = build === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBuild(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-200'
                            : 'border-[#EBE6DD] bg-[#FAF7F2] hover:bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                          <span>{item.label}</span>
                          {active && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Preferowany krój odzieży
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'TIGHT' as FitPreference, label: 'Dopasowany', desc: 'Bliżej ciała' },
                    { id: 'REGULAR' as FitPreference, label: 'Klasyczny', desc: 'Regular Fit' },
                    {
                      id: 'OVERSIZE' as FitPreference,
                      label: 'Luźny / Oversize',
                      desc: 'Swobodny krój',
                    },
                  ].map((item) => {
                    const active = preference === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreference(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-200'
                            : 'border-[#EBE6DD] bg-[#FAF7F2] hover:bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                          <span>{item.label}</span>
                          {active && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>OBLICZ REKOMENDOWANY ROZMIAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#FAF8F5] border border-[#EBE6DD] rounded-3xl p-6 text-center space-y-3 relative overflow-hidden">
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Orientacyjna sugestia ({categoryLabel})</span>
                </span>

                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sugerowany rozmiar dla {height} cm / {weight} kg:
                </div>

                <div className="text-6xl font-black text-purple-700 tracking-tight">
                  {recommendation.primarySize}
                </div>

                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  Uwzględniono budowę sylwetki (
                  {build === 'SLIM'
                    ? 'szczupła'
                    : build === 'ATHLETIC'
                    ? 'atletyczna'
                    : 'standardowa'}
                  ) oraz preferowany krój (
                  {preference === 'OVERSIZE'
                    ? 'luźny oversize'
                    : preference === 'TIGHT'
                    ? 'dopasowany'
                    : 'klasyczny'}
                  ).
                </p>
                <p className="text-xs text-slate-600">Wymiary mają charakter orientacyjny. Porównaj je z tabelą konkretnego produktu przed zakupem.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Szerokość klatki
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {recommendation.dimensions.chest} cm
                  </div>
                </div>
                <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Długość całkowita
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {recommendation.dimensions.length} cm
                  </div>
                </div>
                <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Długość rękawa
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {recommendation.dimensions.sleeve} cm
                  </div>
                </div>
              </div>

              {(recommendation.smallerSize || recommendation.largerSize) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {recommendation.smallerSize && (
                    <button
                      type="button"
                      onClick={() => handleApplySize(recommendation.smallerSize!)}
                      className="flex-1 p-3 rounded-2xl border border-[#EBE6DD] bg-[#FAF7F2] hover:border-purple-300 text-xs text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-slate-900 block">
                        Alternatywnie rozmiar {recommendation.smallerSize}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Wybierz, jeśli wolisz bardziej przylegający krój
                      </span>
                    </button>
                  )}
                  {recommendation.largerSize && (
                    <button
                      type="button"
                      onClick={() => handleApplySize(recommendation.largerSize!)}
                      className="flex-1 p-3 rounded-2xl border border-[#EBE6DD] bg-[#FAF7F2] hover:border-purple-300 text-xs text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-slate-900 block">
                        Alternatywnie rozmiar {recommendation.largerSize}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Wybierz dla luźniejszego efektu oversize
                      </span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3.5 px-4 rounded-xl border border-[#DDD8CD] bg-[#FAF7F2] hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Zmień wymiary</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySize(recommendation.primarySize)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-yellow-300" />
                  <span>WYBIERZ ROZMIAR {recommendation.primarySize}</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Twój profil FitFinder został zapisany dla odzieży w sklepie</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>, document.body
  );
};

export default FitFinderModal;
