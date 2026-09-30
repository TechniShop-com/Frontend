import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Truck, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AuthPage: React.FC = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect home
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!isRegister) {
        const result = await login(email, password);
        if (!result.success) {
          setErrorMessage(result.message || 'Błąd logowania');
        } else {
          navigate('/');
        }
      } else {
        const result = await register(name, email, password);
        if (!result.success) {
          setErrorMessage(result.message || 'Błąd rejestracji');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: Full-Screen Atmospheric Brand Merch Showcase (Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 p-12 xl:p-16 flex-col justify-between text-white select-none">
        {/* Background Visual Image with Ambient Purple Overlay */}
        <img
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80"
          alt="TechniShop Merch Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/60 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <Logo size="md" variant="light" showSubtitle />
          </Link>
        </div>

        {/* Center Main Message */}
        <div className="relative z-10 max-w-xl space-y-4">
          <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white">
            Oficjalny sklep odzieży{' '}
            <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              TechniShop
            </span>
          </h2>

          <p className="text-slate-300 text-base xl:text-lg leading-relaxed font-normal">
            Dedykowana kolekcja odzieży dla uczniów i społeczności Techni Schools oraz Techni Zdalni. Jakość premium, autorskie kroje i oficjalna identyfikacja.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
          <div className="flex items-center space-x-3 text-xs text-slate-200">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-bold">Szybka dostawa</p>
              <p className="text-[11px] text-slate-400 font-medium">Kurier oraz Paczkomat® InPost</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-200">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-bold">Oryginalny merch</p>
              <p className="text-[11px] text-slate-400 font-medium">Autorskie projekty i wysoka jakość</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Clean, Focused Auth Form (Comfortable Ergonomic Width) */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14 bg-gradient-to-b from-slate-50/60 to-white relative overflow-hidden">
        {/* Subtle decorative purple glow in top right */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] bg-white sm:p-8 sm:rounded-3xl sm:border sm:border-slate-200/70 sm:shadow-xl sm:shadow-purple-900/5 space-y-6 relative z-10">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-center">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <Logo size="lg" />
            </Link>
          </div>

          {/* Heading and Subtext */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {!isRegister ? 'Zaloguj się' : 'Utwórz konto'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {!isRegister
                ? 'Wprowadź dane logowania, aby przejść do swojego konta.'
                : 'Dołącz do TechniShop i zamawiaj oficjalny merch z rabatami.'}
            </p>
          </div>

          {/* Segmented Control Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                setErrorMessage(null);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-purple-700 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/register');
                setErrorMessage(null);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-purple-700 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejestracja
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Imię i Nazwisko
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="np. Jan Kowalski"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Adres Email
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="twoj.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hasło
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                  title={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password or Terms */}
            {!isRegister ? (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                  />
                  <span className="font-semibold">Zapamiętaj mnie</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Funkcja resetowania hasła zostanie wkrótce udostępniona.');
                  }}
                  className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Nie pamiętasz hasła?
                </a>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-xs text-slate-500 pt-0.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Rejestrując się, akceptujesz <span className="text-purple-600 font-semibold">Regulamin sklepu</span> oraz politykę prywatności.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              <span>{!isRegister ? 'Zaloguj się do sklepu' : 'Zarejestruj nowe konto'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Navigation Switcher */}
          <div className="text-center text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
            {!isRegister ? (
              <p>
                Nie masz jeszcze konta?{' '}
                <Link
                  to="/register"
                  onClick={() => setErrorMessage(null)}
                  className="text-purple-600 font-bold hover:text-purple-800 hover:underline cursor-pointer ml-1"
                >
                  Zarejestruj się za darmo
                </Link>
              </p>
            ) : (
              <p>
                Masz już konto?{' '}
                <Link
                  to="/login"
                  onClick={() => setErrorMessage(null)}
                  className="text-purple-600 font-bold hover:text-purple-800 hover:underline cursor-pointer ml-1"
                >
                  Przejdź do logowania
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
