# TechniShop Frontend

Sklep internetowy TechniShop: React 18 + TypeScript, Vite, Tailwind CSS, React Router oraz Supabase (katalog, konta, zamówienia, panel administratora). Podglądy produktów 3D korzystają z `three` i `@react-three/fiber`.

## Szybki start

Wymagany Node.js 20 (tej wersji używa CI).

```sh
npm ci
npm run dev
```

Bez konfiguracji Supabase aplikacja uruchamia się z adresem i kluczem zastępczym (`src/lib/supabase.ts`, flaga `isSupabaseConfigured`). Do pracy z prawdziwym katalogiem utwórz plik `.env.local`:

```sh
VITE_SUPABASE_URL=https://<projekt>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publiczny klucz aplikacji>
```

Używaj wyłącznie publicznego klucza aplikacji, nigdy klucza `service_role`. Pliki `.env*` są w `.gitignore`.

## Skrypty

| Polecenie | Opis |
| --- | --- |
| `npm run dev` | Serwer deweloperski Vite |
| `npm run build` | Kontrola typów (`tsc -b`) i build produkcyjny do `dist/` |
| `npm run lint` | Kontrola typów bez generowania plików |
| `npm run preview` | Podgląd zbudowanej aplikacji |

## Struktura

```
src/
  pages/        widoki podpięte pod trasy w App.tsx
  components/   komponenty współdzielone (Navbar, koszyk, modale, viewer 3D)
  context/      AuthContext i CartContext
  lib/          klient Supabase
  services/     warstwa dostępu do danych
  utils/        narzędzia (np. wyszukiwanie rozmyte)
supabase/
  migrations/   migracje SQL
  rollback/     skrypty wycofania migracji
  functions/    funkcje Edge (deactivate-account, send-order-email)
  tests/        izolowane testy migracji i uprawnień
tests/          testy smoke (Python + Playwright) uruchamiane w CI
scripts/        skrypty operatorskie (np. przywracanie konta)
docs/           dokumentacja procesów
```

Główne trasy: `/`, `/products`, `/product/:id`, `/cart`, `/checkout`, `/login`, `/register`, `/settings` (`/account`), `/orders`, `/admin` (`/panel`).

## Testy

Testy migracji panelu administratora działają lokalnie na PGlite i nie łączą się z hostowanym Supabase:

```sh
node supabase/tests/admin-panel.mjs
```

Testy smoke (`tests/production_smoke.py`) wymagają zbudowanej aplikacji, prawdziwego katalogu Supabase oraz zmiennej `TECHNISHOP_URL`. Uruchamia je workflow `Production smoke tests` dla każdego PR-a i pushu na `main`. Szczegóły są w [docs/release-checks.md](docs/release-checks.md).

## Wdrożenie

Hosting: Vercel (`vercel.json`). Do `prod` trafia tylko commit z `main`, który przeszedł testy smoke, po ręcznym uruchomieniu workflow z opcją `promote`. Migracje w `supabase/migrations/` nie wdrażają się automatycznie.

## Dokumentacja

- [docs/release-checks.md](docs/release-checks.md): kontrola przed wydaniem i promocja na `prod`
- [docs/account-deactivation-supabase.md](docs/account-deactivation-supabase.md): dezaktywacja i przywracanie kont
- [supabase/ADMIN_PANEL.md](supabase/ADMIN_PANEL.md): wdrożenie panelu administratora
