import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  Tag,
  Check,
  X,
  Sparkles,
  Loader2,
  Percent,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PromoCodeBoxProps {
  compact?: boolean;
}

export const PromoCodeBox: React.FC<PromoCodeBoxProps> = ({ compact = false }) => {
  const { coupon, applyCoupon, removeCoupon, discountAmount, subtotalPrice } = useCart();
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(Boolean(coupon));

  const handleApply = async (codeToApply?: string) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      setFeedback({ type: 'error', text: 'Wpisz kod rabatowy' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await applyCoupon(code);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setInputCode('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Wystąpił nieoczekiwany błąd walidacji' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setFeedback(null);
    setInputCode('');
  };

  const quickCodes = [
    { code: 'TECHNI20', label: 'TECHNI20 (-20%)', desc: 'Zniżka szkolna' },
    { code: 'START30', label: 'START30 (-30 zł)', desc: 'Od 120 zł' },
    { code: 'FREESHIP', label: 'FREESHIP', desc: 'Darmowa dostawa' },
  ];

  // Jeśli kupon jest już aktywny
  if (coupon) {
    return (
      <div className="bg-gradient-to-r from-purple-50/80 via-emerald-50/40 to-teal-50/60 border border-purple-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs text-purple-900 tracking-wider font-mono bg-purple-100/90 px-2 py-0.5 rounded-lg border border-purple-200">
                  {coupon.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Check className="w-3 h-3 text-emerald-600" /> Aktywny
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                {coupon.description}
              </p>
            </div>
          </div>

          <button
            onClick={handleRemove}
            type="button"
            className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-[#DDD8CD] hover:border-red-200 flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
            title="Usuń kod rabatowy"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wskaźnik oszczędności */}
        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-purple-100/80 text-purple-950 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
            <span>Zaoszczędzona kwota:</span>
          </span>
          <span className="font-black text-emerald-700 font-mono text-xs">
            {coupon.type === 'FREE_SHIPPING'
              ? 'Darmowa dostawa (0 zł)'
              : `-${discountAmount.toFixed(2)} zł`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#E3DDD2] rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 hover:text-purple-700 transition-colors cursor-pointer group text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-[#EFECE4] group-hover:bg-purple-100 text-purple-700 flex items-center justify-center transition-colors">
            <Tag className="w-3 h-3" />
          </div>
          <span>Masz kod rabatowy lub voucher?</span>
        </button>
        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
          Zniżki
        </span>
      </div>

      {isOpen && (
        <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setFeedback(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                placeholder="np. TECHNI20"
                className="w-full pl-3 pr-3 py-2 text-xs uppercase font-mono font-bold bg-white text-slate-900 border border-[#DDD8CD] rounded-xl focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 placeholder:text-slate-400 placeholder:normal-case placeholder:font-sans"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={isLoading || !inputCode.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Zastosuj</span>
              )}
            </button>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Quick Clickable Suggestions (Dla błyskawicznego demo na nagraniu) */}
          <div className="pt-1 border-t border-[#EAE4D9]/80">
            <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
              Przetestuj kody promocyjne:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickCodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setInputCode(item.code);
                    handleApply(item.code);
                  }}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-purple-50 hover:border-purple-300 border border-[#DDD8CD] text-[10px] font-mono font-bold text-slate-700 hover:text-purple-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer group"
                  title={item.desc}
                >
                  <Percent className="w-2.5 h-2.5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span>{item.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
