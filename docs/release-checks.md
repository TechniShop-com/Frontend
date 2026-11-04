# Kontrola przed wydaniem

Workflow `Production smoke tests` buduje commit `main` i uruchamia go lokalnie w CI. Sprawdza stronę główną, stronę produktów, szczegóły produktu i logowanie oraz wymaga udanej odpowiedzi rzeczywistego katalogu Supabase. Dane awaryjne nie wystarczają do zaliczenia testu.

W ustawieniach GitHub Actions repozytorium należy skonfigurować sekrety `VITE_SUPABASE_URL` i `VITE_SUPABASE_PUBLISHABLE_KEY` dla właściwego projektu. Klucz musi być publicznym kluczem aplikacji, nigdy kluczem `service_role`. Brak konfiguracji lub niedostępny katalog kończy test błędem.

Push na `main` tylko uruchamia kontrolę. Po ręcznym przeglądzie zmian można uruchomić workflow z gałęzi `main` i zaznaczyć `promote`. Promocja nastąpi tylko po udanych testach, gdy testowany commit nadal jest najnowszym `main`, a `prod` jest jego przodkiem. Testy smoke nie zastępują pełnego przeglądu funkcji, bezpieczeństwa ani integracji.
