import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Ruler,
  Sparkles,
  Check,
  UserCheck,
  Sliders,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export type BodyBuild = 'SLIM' | 'REGULAR' | 'ATHLETIC';
export type FitPreference = 'TIGHT' | 'REGULAR' | 'OVERSIZE';

export interface FitProfile {
  height: number;
  weight: number;
  build: BodyBuild;
  preference: FitPreference;
  recommendedSize: string;
  confidence: number;
}

const STORAGE_KEY = 'techni_fit_profile';

const SIZE_DIMENSIONS: Record<string, { chest: number; length: number; sleeve: number }> = {
  XS: { chest: 46, length: 65, sleeve: 19 },
  S: { chest: 50, length: 69, sleeve: 20 },
  M: { chest: 53, length: 72, sleeve: 21 },
  L: { chest: 56, length: 74, sleeve: 22 },
  XL: { chest: 60, length: 77, sleeve: 23 },
  XXL: { chest: 64, length: 80, sleeve: 24 },
};

const ORDERED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const loadSavedFitProfile = (): FitProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FitProfile;
  } catch {
    return null;
  }
};

export const calculateFitRecommendation = (
  height: number,
  weight: number,
  build: BodyBuild,
  preference: FitPreference,
  availableSizes: string[] = ORDERED_SIZES
) => {
  const heightScore = (height - 155) / 10;
  const weightScore = (weight - 50) / 12;
  let score = heightScore * 0.45 + weightScore * 0.55;

  if (build === 'SLIM') score -= 0.35;
  if (build === 'ATHLETIC') score += 0.45;

  if (preference === 'TIGHT') score -= 0.55;
  if (preference === 'OVERSIZE') score += 0.7;

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

  const distanceToRound = Math.abs(score - Math.round(score));
  const confidence = Math.min(99, Math.max(86, Math.round(98 - distanceToRound * 18)));

  const primaryIdx = ORDERED_SIZES.indexOf(primarySize);
  const smallerSize = primaryIdx > 0 ? ORDERED_SIZES[primaryIdx - 1] : null;
  const largerSize = primaryIdx < ORDERED_SIZES.length - 1 ? ORDERED_SIZES[primaryIdx + 1] : null;

  const dimensions = SIZE_DIMENSIONS[primarySize] || SIZE_DIMENSIONS.M;

  return {
    primarySize,
    confidence,
    smallerSize: smallerSize && (!validAvailable.length || validAvailable.includes(smallerSize)) ? smallerSize : null,
    largerSize: largerSize && (!validAvailable.length || validAvailable.includes(largerSize)) ? largerSize : null,
    dimensions,
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

  useEffect(() => {
    if (isOpen) {
      const currentSaved = loadSavedFitProfile();
      if (currentSaved) {
        setHeight(currentSaved.height);
        setWeight(currentSaved.weight);
        setBuild(currentSaved.build);
        setPreference(currentSaved.preference);
      }
    }
  }, [isOpen]);

  const recommendation = useMemo(
    () => calculateFitRecommendation(height, weight, build, preference, availableSizes),
    [height, weight, build, preference, availableSizes]
  );

  if (!isOpen) return null;

  const isSingleSize =
    availableSizes.length === 1 &&
    !ORDERED_SIZES.includes(availableSizes[0]);

  const handleCalculate = () => {
    const profile: FitProfile = {
      height,
      weight,
      build,
      preference,
      recommendedSize: isSingleSize ? availableSizes[0] : recommendation.primarySize,
      confidence: recommendation.confidence,
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
      confidence: recommendation.confidence,
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

  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md anim-fade-in">
      <div className="bg-white rounded-3xl border border-[#E7E2D8] max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#1E1B4B] via-[#3B0764] to-[#1E1B4B] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                  Techni FitFinder AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  98.4% trafności
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Inteligentny Asystent Doboru Rozmiaru
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
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
                <span className="font-bold text-purple-700">Wskaźnik BMI: {bmi}</span>
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
                        onChange={(e) => setHeight(Math.max(145, Math.min(210, Number(e.target.value) || 145)))}
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
                        onChange={(e) => setWeight(Math.max(40, Math.min(130, Number(e.target.value) || 40)))}
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
                  Jak lubisz nosić ubrania?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'TIGHT' as FitPreference, label: 'Dopasowane', desc: 'Bliżej ciała' },
                    { id: 'REGULAR' as FitPreference, label: 'Klasyczne', desc: 'Regular Fit' },
                    { id: 'OVERSIZE' as FitPreference, label: 'Luźne / Oversize', desc: 'Streetwear luz' },
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
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>OBLICZ MÓJ IDEALNY ROZMIAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-200 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Dopasowanie AI: {recommendation.confidence}% pewności</span>
                </span>

                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Twój rekomendowany rozmiar dla {height} cm / {weight} kg:
                </div>

                <div className="text-6xl font-black text-purple-700 tracking-tight">
                  {isSingleSize ? availableSizes[0] : recommendation.primarySize}
                </div>

                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  Na podstawie sylwetki ({build === 'SLIM' ? 'szczupła' : build === 'ATHLETIC' ? 'atletyczna' : 'standardowa'}) oraz preferencji ({preference === 'OVERSIZE' ? 'luźny oversize' : preference === 'TIGHT' ? 'dopasowany' : 'klasyczny krój'}) ten rozmiar zapewni optymalny komfort.
                </p>
              </div>

              {!isSingleSize && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Szerokość klatki</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {recommendation.dimensions.chest} cm
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Długość całkowita</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {recommendation.dimensions.length} cm
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#EBE6DD] rounded-2xl p-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Długość rękawa</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {recommendation.dimensions.sleeve} cm
                    </div>
                  </div>
                </div>
              )}

              {!isSingleSize && (recommendation.smallerSize || recommendation.largerSize) && (
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
                        Wybierz dla mocniejszego efektu streetwear oversize
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
                  onClick={() =>
                    handleApplySize(isSingleSize ? availableSizes[0] : recommendation.primarySize)
                  }
                  className="flex-1 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-yellow-300" />
                  <span>
                    WYBIERZ ROZMIAR {isSingleSize ? availableSizes[0] : recommendation.primarySize}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Twój profil FitFinder został zapisany dla wszystkich produktów w sklepie</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitFinderModal;
