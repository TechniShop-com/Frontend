import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  User,
  Shield,
  Sliders,
  Camera,
  Check,
  AlertCircle,
  X,
  Lock,
  Mail,
  Save,
  Bell,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
  MapPin,
  Phone,
} from 'lucide-react';

interface AvatarOption {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  url: string;
}

export const DEFAULT_AVATARS: AvatarOption[] = [
  // 5 Chłopców
  {
    id: 'boy-1',
    name: 'Felix',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
  },
  {
    id: 'boy-2',
    name: 'Oliver',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=c0aede',
  },
  {
    id: 'boy-3',
    name: 'Jack',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=d1d4f9',
  },
  {
    id: 'boy-4',
    name: 'Lucas',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas&backgroundColor=b6e3f4',
  },
  {
    id: 'boy-5',
    name: 'Alexander',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alexander&backgroundColor=c0aede',
  },
  // 5 Dziewczyn
  {
    id: 'girl-1',
    name: 'Sophia',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia&backgroundColor=ffd5dc',
  },
  {
    id: 'girl-2',
    name: 'Mia',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=ffdfbf',
  },
  {
    id: 'girl-3',
    name: 'Emma',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma&backgroundColor=ffd5dc',
  },
  {
    id: 'girl-4',
    name: 'Zoe',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=c0aede',
  },
  {
    id: 'girl-5',
    name: 'Chloe',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe&backgroundColor=ffd5dc',
  },
];

type TabType = 'general' | 'security' | 'advanced';

interface ToastNotification {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Formularz "Ogólne"
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Modal wyboru avatara
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'boy' | 'girl'>('all');

  // Formularz "Bezpieczeństwo"
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Formularz "Zaawansowane" (Preferencje)
  const [defaultLocker, setDefaultLocker] = useState(() => localStorage.getItem('techni_pref_locker') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('techni_pref_phone') || '');
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyPromos, setNotifyPromos] = useState(true);
  const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);

  // Stan zapisu i powiadomień
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotification>({
    show: false,
    type: 'success',
    message: '',
  });

  // Ref do wysuwanego okienka avatara
  const avatarPickerRef = useRef<HTMLDivElement>(null);

  // Przekieruj jeśli użytkownik nie jest zalogowany
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Zamykanie okienka po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarPickerRef.current && !avatarPickerRef.current.contains(e.target as Node)) {
        setIsAvatarModalOpen(false);
      }
    };
    if (isAvatarModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarModalOpen]);

  // Wypełnij formularz danymi aktualnego użytkownika
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || DEFAULT_AVATARS[0].url);
    }
  }, [user]);

  // Pomocnicza funkcja do wyświetlania animowanego toasta od góry
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Zapis zmian w zakładce "Ogólne"
  const handleSaveGeneral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!firstName.trim()) {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      return;
    }

    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const result = await updateProfile({
        name: fullName,
        email: email.trim(),
        avatarUrl: avatarUrl,
      });

      if (result.success) {
        showToast('success', 'Zmiany zostały pomyślnie zapisane');
      } else {
        showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      }
    } catch {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
    } finally {
      setIsSaving(false);
    }
  };

  // Zapis hasła w zakładce "Bezpieczeństwo"
  const handleSavePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password.trim() || password.length < 6) {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      return;
    }

    setIsSavingPassword(true);

    try {
      const result = await updateProfile({
        password: password.trim(),
      });

      if (result.success) {
        showToast('success', 'Zmiany zostały pomyślnie zapisane');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
      }
    } catch {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Zapis w zakładce "Zaawansowane"
  const handleSaveAdvanced = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAdvanced(true);

    try {
      localStorage.setItem('techni_pref_locker', defaultLocker.trim().toUpperCase());
      localStorage.setItem('techni_pref_phone', phone.trim());
      showToast('success', 'Zmiany zostały pomyślnie zapisane');
    } catch {
      showToast('error', 'Niestety nie udało się zapisać zmian, spróbuj jeszcze raz');
    } finally {
      setIsSavingAdvanced(false);
    }
  };

  const filteredAvatars = DEFAULT_AVATARS.filter((av) => {
    if (avatarFilter === 'all') return true;
    return av.gender === avatarFilter;
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-white text-slate-900">
      {/* 🚀 TOP ANIMATED TOAST NOTIFICATION */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${
          toast.show
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div
          className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-white shadow-emerald-900/30 ring-1 ring-emerald-400/20'
              : 'bg-rose-950/90 border-rose-500/30 text-white shadow-rose-900/30 ring-1 ring-rose-400/20'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 animate-in zoom-in-75 duration-200" />
            ) : (
              <AlertCircle className="w-5 h-5 animate-in zoom-in-75 duration-200" />
            )}
          </div>
          <div className="pr-3 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {toast.type === 'success' ? 'Sukces' : 'Komunikat'}
            </p>
            <p className="text-sm font-semibold tracking-tight">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================
          LEWY PANEL BOCZNY (PEŁNA WYSOKOŚĆ EKRANU)
          ========================================= */}
      <aside className="w-full md:w-72 lg:w-80 h-auto md:h-full bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#E7E2D8] flex flex-col justify-between p-6 shrink-0 overflow-y-auto">
        <div>
          {/* Powrót do sklepu */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Wróć do sklepu</span>
          </Link>

          {/* Logo TechniShop */}
          <div className="mb-8">
            <Logo size="sm" showSubtitle />
          </div>

          {/* Zakładki nawigacji */}
          <nav className="space-y-1.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Menu Ustawień
            </p>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                activeTab === 'general'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/80'
              }`}
            >
              <User className={`w-5 h-5 ${activeTab === 'general' ? 'text-white' : 'text-slate-400'}`} />
              <span>Ogólne</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                activeTab === 'security'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/80'
              }`}
            >
              <Shield className={`w-5 h-5 ${activeTab === 'security' ? 'text-white' : 'text-slate-400'}`} />
              <span>Bezpieczeństwo</span>
            </button>

            <button
              onClick={() => setActiveTab('advanced')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                activeTab === 'advanced'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/80'
              }`}
            >
              <Sliders className={`w-5 h-5 ${activeTab === 'advanced' ? 'text-white' : 'text-slate-400'}`} />
              <span>Zaawansowane</span>
            </button>
          </nav>
        </div>

        {/* Dolna sekcja profilu i wylogowania */}
        <div className="pt-6 mt-6 border-t border-[#E7E2D8] space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 ring-2 ring-purple-200 shrink-0">
              <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden text-left flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Wyloguj się</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          PRAWY OBSZAR GŁÓWNY (PEŁNY EKRAN)
          ========================================= */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10 lg:p-14 bg-white flex flex-col items-center">
        <div className="max-w-2xl w-full my-auto py-8">

          {/* =========================================
              ZAKŁADKA 1: OGÓLNE
              ========================================= */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Klikalny Avatar z wysuwanym okienkiem (dokładnie jak na rysunku) */}
              <div className="flex justify-center mb-4">
                <div className="relative" ref={avatarPickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(!isAvatarModalOpen)}
                    className="relative group cursor-pointer focus:outline-none rounded-full block"
                    title="Kliknij, aby wybrać avatar"
                  >
                    <div className={`w-28 h-28 rounded-full overflow-hidden ring-4 transition-all bg-white shadow-lg ${
                      isAvatarModalOpen ? 'ring-purple-600 scale-105' : 'ring-purple-100 group-hover:ring-purple-500'
                    }`}>
                      <img
                        src={avatarUrl}
                        alt="Twój avatar"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera className="w-6 h-6 mb-0.5 drop-shadow" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Zmień</span>
                    </div>
                  </button>

                  {/* Wysuwane okienko z 10 avatarami (dużo szersze, swobodne, bez nachodzenia na siebie) */}
                  {isAvatarModalOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-5 z-50 w-[350px] bg-white border border-[#E7E2D8] rounded-3xl shadow-2xl p-4 animate-in fade-in slide-in-from-left-4 duration-200">
                      {/* Trójkącik wskazujący na avatar */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-[#E7E2D8] transform rotate-45 z-0" />

                      {/* Siatka 10 avatarów: 5 u góry, 5 na dole, bez żadnego tekstu */}
                      <div className="grid grid-cols-5 gap-3 relative z-10 place-items-center">
                        {DEFAULT_AVATARS.map((av) => {
                          const isSelected = avatarUrl === av.url;
                          return (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => {
                                setAvatarUrl(av.url);
                                setIsAvatarModalOpen(false);
                              }}
                              className={`shrink-0 w-12 h-12 rounded-full overflow-hidden transition-all transform hover:scale-115 focus:outline-none bg-white ${
                                isSelected
                                  ? 'ring-3 ring-purple-600 shadow-md scale-105'
                                  : 'ring-2 ring-slate-100 hover:ring-purple-400 shadow-sm'
                              }`}
                            >
                              <img
                                src={av.url}
                                alt={av.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Formularz z polami */}
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Pole: Imię */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Wpisz imię..."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Pole: Nazwisko */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Wpisz nazwisko..."
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Pole: Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Adres email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj.email@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Na ten adres przesyłane są potwierdzenia zamówień oraz powiadomienia o logowaniu.
                  </p>
                </div>

                {/* Przycisk Zapisz po prawej na dole */}
                <div className="pt-6 border-t border-[#E7E2D8] flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center space-x-2 px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-extrabold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Zapisywanie...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Zapisz</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================
              ZAKŁADKA 2: BEZPIECZEŃSTWO
              ========================================= */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <form onSubmit={handleSavePassword} className="space-y-6">
                {/* Pole: Hasło */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Hasło
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wpisz nowe hasło..."
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                      title={showPassword ? 'Ukryj hasło' : 'Podejrzyj hasło'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hasło powinno mieć co najmniej 6 znaków.
                  </p>
                </div>

                {/* Pole: Powtórz hasło (niżej) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Powtórz hasło
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Powtórz nowe hasło..."
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                      title={showConfirmPassword ? 'Ukryj hasło' : 'Podejrzyj hasło'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Przycisk Zapisz po prawej na dole */}
                <div className="pt-6 border-t border-[#E7E2D8] flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="inline-flex items-center space-x-2 px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-extrabold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Zapisywanie...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Zapisz</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================
              ZAKŁADKA 3: ZAAWANSOWANE
              ========================================= */}
          {activeTab === 'advanced' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <form onSubmit={handleSaveAdvanced} className="space-y-8">
                {/* SEKCJA 1: DANE DOSTAWY */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Ulubiony Paczkomat */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Ulubiony Paczkomat InPost
                      </label>
                      <input
                        type="text"
                        value={defaultLocker}
                        onChange={(e) => setDefaultLocker(e.target.value)}
                        placeholder="np. LBN01M lub KRA02N"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:text-slate-400"
                      />
                    </div>

                    {/* Telefon */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Numer telefonu do przesyłek
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+48 123 456 789"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CEC2] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* SEKCJA 2: POWIADOMIENIA E-MAIL */}
                <div className="pt-6 border-t border-[#E7E2D8] space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Powiadomienia
                  </label>

                  <div className="space-y-3">
                    {/* Przełącznik 1 */}
                    <div
                      onClick={() => setNotifyOrders(!notifyOrders)}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-[#E7E2D8] transition-all cursor-pointer select-none"
                    >
                      <div className="pr-4">
                        <p className="text-sm font-bold text-slate-800">Statusy paczek i kody odbioru</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Powiadomienia o umieszczeniu przesyłki w Paczkomacie InPost
                        </p>
                      </div>

                      {/* Nowoczesny przełącznik iOS toggle */}
                      <button
                        type="button"
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                          notifyOrders ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            notifyOrders ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Przełącznik 2 */}
                    <div
                      onClick={() => setNotifyPromos(!notifyPromos)}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-[#E7E2D8] transition-all cursor-pointer select-none"
                    >
                      <div className="pr-4">
                        <p className="text-sm font-bold text-slate-800">Dropy odzieży i kody rabatowe</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Informacje o limitowanych kolekcjach i okazjonalnych zniżkach
                        </p>
                      </div>

                      {/* Nowoczesny przełącznik iOS toggle */}
                      <button
                        type="button"
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                          notifyPromos ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            notifyPromos ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEKCJA 3: STREFA KONTA */}
                <div className="pt-6 border-t border-[#E7E2D8] space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Usunięcie konta</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Trwałe usunięcie Twojego profilu i historii zakupów
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert('W celu usunięcia konta prosimy o kontakt z administratorem TechniShop: support@technischools.com');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors shrink-0"
                    >
                      Usuń konto
                    </button>
                  </div>
                </div>

                {/* PRZYCISK ZAPISZ PO PRAWEJ NA DOLE */}
                <div className="pt-6 border-t border-[#E7E2D8] flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSavingAdvanced}
                    className="inline-flex items-center space-x-2 px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-extrabold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingAdvanced ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Zapisywanie...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Zapisz</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};
