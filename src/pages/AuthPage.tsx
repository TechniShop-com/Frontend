import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Truck, Eye, EyeOff, X } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AuthPage: React.FC = () => {
  const { user, login, register, loginWithGoogle } = useAuth();
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

  // Stany logowania przez Google
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

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

  const handleExecuteGoogleLogin = async (googleUser: { email: string; name: string; avatarUrl?: string }) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginWithGoogle(googleUser);
      if (result.success) {
        setIsGoogleModalOpen(false);
        navigate('/');
      } else {
        setErrorMessage(result.message || 'Nie udało się zalogować przez Google');
      }
    } catch {
      setErrorMessage('Wystąpił problem podczas logowania przez Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Jeśli skonfigurowano Google Client ID i załadowano bibliotekę Google
    if (googleClientId && (window as any).google?.accounts?.oauth2) {
      try {
        setIsGoogleLoading(true);
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await userInfoRes.json();
                
                const fullName = googleProfile.name || `${googleProfile.given_name || ''} ${googleProfile.family_name || ''}`.trim() || 'Użytkownik Google';
                const userEmail = googleProfile.email;
                const avatar = googleProfile.picture;

                await handleExecuteGoogleLogin({
                  email: userEmail,
                  name: fullName,
                  avatarUrl: avatar,
                });
              } catch (err) {
                console.error('Błąd pobierania profilu z Google:', err);
                setErrorMessage('Nie udało się pobrać danych profilu z konta Google');
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
        });
        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.error('Błąd wywołania Google OAuth:', err);
      }
    }

    // Bezpośrednie eleganckie okno wyboru/logowania Google (działa od ręki również bez wstępnej konfiguracji GCP)
    setIsGoogleModalOpen(true);
  };

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-65px)] lg:h-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: Full-Screen Atmospheric Brand Merch Showcase (Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 p-12 xl:p-16 flex-col justify-between text-white select-none h-full">
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

      {/* RIGHT COLUMN: Clean, Focused Auth Form (Comfortable Ergonomic Width, Minimal Outer Padding) */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center py-3 px-4 sm:px-6 bg-[#FAF7F2] relative h-full">
        {/* Subtle decorative purple glow in top right */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[430px] bg-white px-6 py-5 sm:px-8 sm:py-6 rounded-3xl border border-[#EBE6DD] shadow-xl shadow-purple-950/5 min-h-[580px] sm:h-[590px] flex flex-col justify-between relative z-10">
          <div className="space-y-3.5 sm:space-y-4">
            {/* Logo Brand Header */}
            <div className="flex items-center justify-center">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <Logo size="lg" />
              </Link>
            </div>

            {/* Heading and Subtext */}
            <div className="space-y-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {!isRegister ? 'Zaloguj się' : 'Utwórz konto'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {!isRegister
                  ? 'Wprowadź dane logowania, aby przejść do swojego konta.'
                  : 'Dołącz do TechniShop i zamawiaj oficjalny merch.'}
              </p>
            </div>

            {/* Segmented Control Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F0ECE4] rounded-2xl border border-[#E2DDD3]">
              <button
                type="button"
                onClick={() => {
                  navigate('/login');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-white text-purple-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejestracja
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between py-1">
            {isRegister ? (
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                      className="w-full pl-10 pr-11 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
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

                <div className="flex items-start space-x-2 text-xs text-slate-500 pt-0.5 leading-snug">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    Rejestrując się, akceptujesz <span className="text-purple-600 font-semibold">Regulamin sklepu</span> oraz politykę prywatności.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
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
                      className="w-full pl-10 pr-11 py-2.5 bg-[#FAF7F2] border border-[#DDD8CD] rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all"
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

                <div className="flex items-center justify-between text-xs pt-1">
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

                {/* DOKŁADNIE W MIEJSCU ZAZNACZONYM NA ZDJĘCIU: "lub zaloguj przez" i niżej ikonka Google */}
                <div className="pt-1">
                  <div className="relative flex items-center justify-center my-2.5">
                    <div className="border-t border-[#E5E0D8] w-full" />
                    <span className="bg-white px-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      lub zaloguj przez
                    </span>
                    <div className="border-t border-[#E5E0D8] w-full" />
                  </div>

                  {/* Przycisk Google z ikonką */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#DDD8CD] hover:border-purple-300 active:scale-[0.99] text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-2.5 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{isGoogleLoading ? 'Logowanie przez Google...' : 'Google'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 cursor-pointer"
            >
              <span>{!isRegister ? 'Zaloguj się do sklepu' : 'Zarejestruj nowe konto'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Navigation Switcher */}
          <div className="text-center text-xs text-slate-600 font-medium pt-2.5 border-t border-[#EBE6DD]">
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

      {/* OKNO DIALOGOWE WYBORU KONTA GOOGLE */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-2xl max-w-sm w-full p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Przycisk zamknięcia */}
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo Google i nagłówek */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Zaloguj się przez Google</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wybierz konto, aby przejść do TechniShop
              </p>
            </div>

            {/* Lista kont Google */}
            <div className="space-y-2.5 mb-6">
              {/* Konto domyślne: TechniSchools */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={() =>
                  handleExecuteGoogleLogin({
                    email: 'u31_blacie_lbn@technischools.com',
                    name: 'Błażej Ciepiel',
                    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blazej&backgroundColor=b6e3f4',
                  })
                }
                className="w-full flex items-center space-x-3 p-3 rounded-2xl border border-[#E7E2D8] hover:border-purple-400 hover:bg-purple-50/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 ring-2 ring-purple-200 shrink-0">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Blazej&backgroundColor=b6e3f4"
                    alt="Błażej Ciepiel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                    Błażej Ciepiel
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    u31_blacie_lbn@technischools.com
                  </p>
                </div>
              </button>

              {/* Opcja wpisania innego konta Google */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-purple-400 text-xs font-bold text-slate-600 hover:text-purple-700 hover:bg-slate-50 transition-all text-center"
                >
                  + Użyj innego konta Google
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Imię i nazwisko"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input
                    type="email"
                    placeholder="Adres email Google..."
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail.trim() || isGoogleLoading}
                    onClick={() =>
                      handleExecuteGoogleLogin({
                        email: customGoogleEmail.trim(),
                        name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customGoogleEmail)}&backgroundColor=b6e3f4,c0aede`,
                      })
                    }
                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    Kontynuuj z tym kontem
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Aby podpiąć produkcyjne Google Client ID, dodaj <code className="text-purple-600 font-mono">VITE_GOOGLE_CLIENT_ID</code> w .env
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
