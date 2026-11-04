# Dezaktywacja i przywracanie konta

Przycisk w ustawieniach wywołuje `deactivate-account` bez przekazywania identyfikatora użytkownika. Funkcja sprawdza sesję, zapisuje `profiles.is_deleted = true`, wylogowuje wszystkie sesje i blokuje logowanie przez Supabase Auth. Odpowiada `completed` dopiero po zakończeniu tych operacji. Konto i zamówienia pozostają w bazie. `deleted_at` zapisuje czas dezaktywacji; nie jest to automatyczna polityka retencji ani trwałe usunięcie danych.

Polityki RLS sprawdzają status konta i istnienie sesji po stronie bazy. Przywrócenie aktualizuje `sessions_valid_after`, więc nawet sesja powstała w trakcie przywracania nie odzyskuje dostępu. Zwykły klient nie może zmieniać pól blokady. Funkcja `send-order-email` sprawdza zamówienie przez RLS i wymaga, by należało do zalogowanego użytkownika; adres i treść pochodzą z zamówienia w bazie.

## Wdrożenie

W projekcie produkcyjnym TechniShop migracja `20261104210428` oraz funkcje `deactivate-account` i `send-order-email` zostały wdrożone 4 listopada 2026 r. Migracji nie należy stosować ponownie w tym projekcie. Interfejs pozostaje w PR-ze #11 do czasu jego zmergowania i wdrożenia aplikacji.

Migracja `supabase/migrations/20261104210428_account_deactivation.sql` zakłada istniejący schemat TechniShop (`profiles`, `orders`, `cart_items`, `admin_users`, `Product`) i obecne polityki RLS. Nie jest kompletną migracją całej bazy. Przed wdrożeniem porównaj aktualny schemat, granty, polityki i inne punkty dostępu z migracją. Sprawdź też, czy nie dodano nowych tabel, polityk Storage ani funkcji serwerowych, które należy objąć tym samym zabezpieczeniem. Nie nadpisuj istniejących funkcji bez porównania ich aktualnego kodu.

1. W izolowanym środowisku sprawdź migrację i obie funkcje, w tym logowanie hasłem i OAuth, odświeżanie sesji, stare JWT, uprawnienia administratora i proces przywracania.
2. Zaplanuj odwrócenie zmian i dostęp awaryjny. Upewnij się, że w Auth są dostępne sesje istniejących użytkowników: polityki wymagają prawidłowego `session_id` z JWT i rekordu w `auth.sessions`.
3. Wdróż uaktualnioną funkcję `send-order-email`, migrację oraz `deactivate-account` z weryfikacją JWT; dopiero po potwierdzeniu działania udostępnij interfejs. Klucz `service_role` pozostaje wyłącznie w zaufanym środowisku.
4. Przed włączeniem dla klientów ustal zasady retencji, żądań usunięcia danych i obsługi przywracania. Dezaktywacja konta nie musi sama w sobie spełniać wszystkich takich żądań.

## Przywrócenie przez zaufanego operatora

Przywrócenie wymaga **zarówno** odblokowania w Auth, jak i zmiany statusu w bazie. Nie wystarczy ręcznie ustawić `is_deleted = false`. W zaufanym środowisku ustaw zmienne `TECHNISHOP_SUPABASE_URL` i `TECHNISHOP_SUPABASE_SERVICE_ROLE_KEY`, a następnie uruchom `node scripts/restore-account.mjs <user-uuid>`. Nie zapisuj klucza w repozytorium ani nie podawaj go przeglądarce.

Skrypt przyjmuje tylko konto z potwierdzoną dezaktywacją. Zabezpiecza jednoczesne próby, odblokowuje Auth, zmienia status i pozostawia starsze sesje zablokowane. W razie błędu stara się ponownie zablokować Auth; jeśli proces zostanie przerwany, konto może wymagać ręcznego uzgodnienia. Przed wznowieniem sprawdź `is_deleted`, `deactivation_completed_at`, `restoration_started_at` i blokadę w Auth. Nie uruchamiaj równocześnie innych operacji na tym koncie. Pole `restoration_started_at` pozostawione po przerwaniu operacji wymaga interwencji zaufanego operatora.

Jeśli `is_deleted = true`, a `deactivation_completed_at` jest puste, dezaktywacja nie została potwierdzona. Konto pozostaje odcięte od danych przez RLS, ale zależnie od miejsca błędu blokada logowania w Auth może wymagać dokończenia. Operator powinien zablokować konto w Auth, sprawdzić sesje i dopiero po uzgodnieniu oznaczyć proces jako zakończony. Nie zakładaj sukcesu na podstawie samego statusu w interfejsie.

## Lokalne testy

`supabase/tests/local_base_fixture.sql` odtwarza wyłącznie minimalny schemat testowy i nie zawiera danych produkcyjnych. Na pustej lokalnej bazie Supabase zastosuj ten fixture, a następnie migrację; uruchom `npx supabase functions serve` i `node supabase/tests/account-deactivation.mjs`. Test tworzy wyłącznie konta `example.invalid`, sprawdza uprawnienia, dezaktywację, blokadę logowania i sesji, zachowanie zamówienia, wpływ na drugie konto, błąd Auth oraz przywrócenie, po czym usuwa dane testowe. Nie wysyła wiadomości.

Test lokalny nie zastępuje testu rzeczywistego logowania OAuth ani kontroli schematu i konfiguracji projektu przed wdrożeniem. W panelu administratora istnieje też lokalny fallback uwierzytelniania; nie wolno używać go do przywracania kont.
