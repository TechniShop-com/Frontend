import React, { useState, useEffect, useMemo } from 'react';
import { ProductReview, ReviewStats } from '../types';
import { getProductReviewsApi, addProductReviewApi, likeReviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
}

const RATING_LABELS: { [key: number]: string } = {
  1: 'Słaba jakość',
  2: 'Przeciętny produkt',
  3: 'W porządku',
  4: 'Bardzo dobry!',
  5: 'Rewelacja, gorąco polecam!',
};

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productTitle,
}) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Stan formularza dodawania opinii
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtrowanie i sortowanie
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  // Przechowywanie polubionych opinii w sesji
  const [likedReviews, setLikedReviews] = useState<{ [id: string]: boolean }>({});

  // Załaduj opinie przy zmianie produktu
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getProductReviewsApi(productId);
        if (isMounted) {
          setReviews(data.reviews);
          setStats(data.stats);
        }
      } catch (err) {
        console.warn('Błąd pobierania recenzji:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Uzupełnij imię, gdy użytkownik się zaloguje
  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user]);

  // Obsługa wysłania formularza
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authorName.trim()) {
      setErrorMessage('Wpisz swoje imię lub pseudonim.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage('Napisz co najmniej 5 znaków recenzji.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addProductReviewApi(productId, {
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
        isStudent,
      });

      setReviews((prev) => [res.review, ...prev]);
      setStats(res.stats);
      setSuccessMessage('Dziękujemy! Twoja opinia została dodana i jest widoczna.');
      setComment('');
      setIsFormOpen(false);

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Nie udało się dodać opinii.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obsługa polubienia opinii
  const handleLike = async (reviewId: string) => {
    if (likedReviews[reviewId]) return;

    setLikedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );

    try {
      await likeReviewApi(reviewId);
    } catch (err) {
      console.warn('Błąd lajkowania opinii:', err);
    }
  };

  // Filtrowanie i sortowanie listy opinii
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];

    if (filterStar !== null) {
      list = list.filter((r) => Math.round(r.rating) === filterStar);
    }

    if (sortBy === 'newest') {
      // Domyślny porządek z API (najnowsze na górze)
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }

    return list;
  }, [reviews, filterStar, sortBy]);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Toast powiadomienie o sukcesie */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GŁÓWNA KARTA STATYSTYK OCEN (Allegro / Amazon standard) */}
      <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#EBE6DD] grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
        {/* Lewa kolumna: Wielka ocena i gwiazdki */}
        <div className="md:col-span-4 text-center md:text-left md:border-r border-[#E2DDD3] md:pr-6 space-y-2">
          <div className="flex items-baseline justify-center md:justify-start space-x-2">
            <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
              {stats ? stats.averageRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-slate-400 font-bold text-lg">/ 5.0</span>
          </div>

          <div className="flex justify-center md:justify-start text-yellow-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(stats ? stats.averageRating : 5)
                    ? 'fill-current text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-bold text-slate-900">
            {stats ? stats.recommendationPercentage : 100}% kupujących poleca ten produkt
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Na podstawie {stats ? stats.totalReviews : reviews.length} zweryfikowanych zamówień uczniów i kadry.
          </p>
        </div>

        {/* Środkowa kolumna: Wykres paskowy rozkładu gwiazdek */}
        <div className="md:col-span-5 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats?.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const total = stats?.totalReviews || 1;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = filterStar === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => setFilterStar(isSelected ? null : stars)}
                className={`w-full flex items-center space-x-2.5 py-1 px-2 rounded-xl transition-colors cursor-pointer group text-left ${
                  isSelected ? 'bg-purple-100/70 ring-1 ring-purple-300' : 'hover:bg-white/60'
                }`}
                title={`Filtruj oceny ${stars} gwiazdek (${count})`}
              >
                <span className="w-7 text-[11px] font-bold text-slate-700 flex items-center gap-0.5 shrink-0">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>

                <div className="flex-1 h-2 rounded-full bg-[#EAE4D9] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected
                        ? 'bg-purple-600'
                        : 'bg-gradient-to-r from-yellow-400 to-amber-500 group-hover:from-purple-500 group-hover:to-purple-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-8 text-right text-[10px] font-mono text-slate-500 font-bold shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prawa kolumna: Przycisk dodawania opinii */}
        <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer group"
          >
            <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{isFormOpen ? 'Zamknij formularz' : 'Napisz opinię'}</span>
          </button>
          <span className="text-[10px] text-slate-400 mt-2 text-center md:text-right font-medium">
            Podziel się wrażeniami z noszenia
          </span>
        </div>
      </div>

      {/* FORMULARZ DODAWANIA NOWEJ OPINII */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white border-2 border-purple-200 rounded-3xl p-5 sm:p-7 space-y-4 shadow-lg shadow-purple-900/5 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D9]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  Dodaj recenzję produktu
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Twoja ocena pomaga innym uczniom i społeczności Techni wybrać właściwy rozmiar i krój.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interaktywny wybór gwiazdek */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Twoja ogólna ocena:
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= activeRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-200 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-purple-700 font-mono bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                {RATING_LABELS[activeRating]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pole Imię */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Twoje imię lub nick *
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="np. Marceli K. (Techni)"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10"
              />
            </div>

            {/* Checkbox Uczeń / Nauczyciel Techni */}
            <div className="flex items-center space-x-2 pt-6">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-[#DDD8CD] focus:ring-purple-500"
                />
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Uczeń / Kadra Techni Schools lub Zdalni</span>
                </span>
              </label>
            </div>
          </div>

          {/* Treść opinii */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700">
                Treść Twojej recenzji *
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {comment.length} znaków (min. 5)
              </span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opisz jakość materiału, dopasowanie rozmiaru, wygodę noszenia lub szybkość dostawy..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/10 resize-none"
            />
          </div>

          {/* Przyciski formularza */}
          <div className="flex items-center justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publikowanie...</span>
                </>
              ) : (
                <span>Opublikuj opinię</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PASEK FILTROWANIA I SORTOWANIA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-[#EBE6DD]">
        {/* Filtry po gwiazdkach */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filtruj:
          </span>
          <button
            type="button"
            onClick={() => setFilterStar(null)}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterStar === null
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EAE4D9]'
            }`}
          >
            Wszystkie ({reviews.length})
          </button>
          {[5, 4, 3].map((star) => {
            const count = stats?.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterStar(filterStar === star ? null : star)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                  filterStar === star
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#EAE4D9]'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-2.5 h-2.5 ${filterStar === star ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sortowanie */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <ArrowUpDown className="w-3 h-3" /> Sortuj:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 bg-[#FAF7F2] border border-[#DDD8CD] rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="newest">Najnowsze</option>
            <option value="highest">Najwyżej ocenione</option>
            <option value="helpful">Najbardziej pomocne</option>
          </select>
        </div>
      </div>

      {/* LISTA RECENZJI */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Ładowanie opinii...</span>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="bg-[#FAF7F2] p-8 rounded-2xl text-center space-y-2 border border-[#EBE6DD]">
            <p className="text-xs font-bold text-slate-700">
              Brak opinii spełniających wybrane kryteria filtrowania.
            </p>
            <button
              onClick={() => setFilterStar(null)}
              className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
            >
              Pokaż wszystkie opinie ({reviews.length})
            </button>
          </div>
        ) : (
          filteredAndSortedReviews.map((rev) => {
            const hasLiked = Boolean(likedReviews[rev.id]);
            return (
              <div
                key={rev.id}
                className="bg-[#FAF7F2] hover:bg-white p-5 rounded-2xl border border-[#EBE6DD] hover:border-purple-200 hover:shadow-xs transition-all space-y-2.5 text-xs"
              >
                {/* Górny wiersz autora i odznak */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2.5">
                    {/* Awatar z inicjałem */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {rev.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-extrabold text-slate-900">{rev.authorName}</span>
                        {rev.isStudent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center gap-1 border border-purple-200">
                            <GraduationCap className="w-3 h-3" /> Uczeń Techni
                          </span>
                        )}
                        {rev.verifiedPurchase && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-0.5 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Zweryfikowany zakup
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {rev.date}
                  </span>
                </div>

                {/* Gwiazdki */}
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-current text-yellow-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-slate-600 ml-1.5 font-mono">
                    {rev.rating}.0
                  </span>
                </div>

                {/* Treść recenzji */}
                <p className="text-slate-700 font-medium leading-relaxed">
                  {rev.comment}
                </p>

                {/* Dolny pasek: Pomocna opinia */}
                <div className="pt-2 border-t border-[#EAE4D9]/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Czy ta opinia była dla Ciebie pomocna?</span>
                  <button
                    type="button"
                    onClick={() => handleLike(rev.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                      hasLiked
                        ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-2xs'
                        : 'bg-white border-[#DDD8CD] hover:border-purple-300 hover:text-purple-700'
                    }`}
                    title="Oznacz opinię jako pomocną"
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasLiked ? 'text-purple-600 fill-purple-600' : ''}`} />
                    <span>Pomocna ({rev.helpfulCount})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default ProductReviewsSection;
