import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Laptop, ShieldAlert, Truck, CreditCard, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 text-sm border-t border-slate-800">
      {/* Features Bar */}
      <div className="border-b border-slate-800 py-8 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">3 Sposoby Dostawy</h4>
              <p className="text-xs text-gray-500">Kurier, Paczkomat oraz Odbiór w szkole</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Płatności Stripe</h4>
              <p className="text-xs text-gray-500">Szybka i bezpieczna płatność online</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Łatwe Zwroty</h4>
              <p className="text-xs text-gray-500">Formularz zwrotów i reklamacji online</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Zakup jako Gość</h4>
              <p className="text-xs text-gray-500">Bez zbędnej rejestracji konta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
              T
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TechniShop</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Oficjalny sklep internetowy z merchem dla uczniów, studentów i pasjonatów technologii sieci Techni Schools oraz Techni Zdalni.
          </p>
          <div className="flex space-x-3 text-xs">
            <a
              href="https://technischools.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-emerald-400 hover:underline"
            >
              <GraduationCap className="w-4 h-4" />
              <span>technischools.com</span>
            </a>
            <a
              href="https://www.technizdalni.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-cyan-400 hover:underline"
            >
              <Laptop className="w-4 h-4" />
              <span>technizdalni.com</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Kolekcje</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/catalog?brand=TECHNI_SCHOOLS" className="hover:text-emerald-400 transition-colors">Odzież Techni Schools</Link></li>
            <li><Link to="/catalog?brand=TECHNI_ZDALNI" className="hover:text-cyan-400 transition-colors">Kolekcja Techni Zdalni</Link></li>
            <li><Link to="/catalog?category=Odzież" className="hover:text-white transition-colors">Bluzy i Koszulki</Link></li>
            <li><Link to="/catalog?category=Akcesoria" className="hover:text-white transition-colors">Bidony i Gadżety</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Obsługa Klienta</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/status" className="hover:text-white transition-colors">Status Zamówienia</Link></li>
            <li><Link to="/claims" className="hover:text-white transition-colors">Zgłoś Zwrot / Reklamację</Link></li>
            <li><span className="text-gray-500">Regulamin Sklepu</span></li>
            <li><span className="text-gray-500">Polityka Prywatności</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Miejsca Odbioru w Szkołach</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Zamów online i odbierz za 0 zł w wybranej placówce Techni Schools (Warszawa, Lublin, Poznań).
          </p>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 px-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TechniShop. Wszelkie prawa zastrzeżone. Projekt zrealizowany na praktykach.
      </div>
    </footer>
  );
};
