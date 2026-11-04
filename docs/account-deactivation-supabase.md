# Dezaktywacja konta: wymagania po stronie Supabase

Interfejs wywołuje Edge Function `deactivate-account` bez podawania identyfikatora konta i uznaje operację za zakończoną tylko po odpowiedzi `{ "status": "completed" }`. Funkcja nie jest jeszcze wdrożona: przed uruchomieniem należy przygotować i przetestować konfigurację po stronie Supabase. Błąd lub brak potwierdzenia może oznaczać częściowo zakończoną operację, dlatego interfejs nie obiecuje, że konto jest nadal aktywne.

Zadanie dla administratora Supabase: przygotuj migrację dostosowaną do rzeczywistego schematu i obowiązujących polityk RLS. Dodaj chronione przed zapisem klienta `profiles.deleted` i wersję tokenu, zachowaj zamówienia i powiązania. Funkcja Edge ma weryfikować JWT, ustalać użytkownika z sesji, a nie z danych wejściowych, i rozpocząć dezaktywację od atomowej zmiany stanu w bazie. Status oraz weryfikacja wersji tokenu muszą blokować stare JWT przez odpowiednio dostosowane restrykcyjne polityki RLS; uwzględnij wszystkie polityki, funkcje `SECURITY DEFINER`, Storage i Edge Functions mające dostęp do danych. Następnie funkcja serwerowa korzysta z Auth Admin API do blokady konta i unieważnienia sesji. Klucz serwisowy nie może trafić do przeglądarki.

Zaprojektuj idempotentną obsługę częściowych błędów: po ustawieniu blokady nie odblokowuj konta automatycznie, a zaufany proces musi móc dokończyć lub uzgodnić operację nawet wtedy, gdy klient został już odcięty. Przywracanie ma być dostępne wyłącznie administratorowi i skoordynować odblokowanie Auth, zmianę stanu i nową wersję tokenu tak, aby stare sesje nie wróciły do życia. Przygotuj testy równoczesnej dezaktywacji i przywracania.

Przed zmianą Auth Hooks sprawdź ich istniejącą konfigurację i plan wdrożenia z rollbackiem. Token hook oraz restrykcyjne RLS wymagają etapowego wprowadzenia, aby nie zablokować aktywnych kont bez nowego claimu. Sprawdź działanie dla logowania hasłem, OAuth, odświeżania i nowych kont. Nie włączaj migracji na produkcji przed testami w izolowanym środowisku. Sprawdź wpływ retencji i żądań usunięcia danych z osobą odpowiedzialną za zgodność.

Przed wdrożeniem przetestuj izolowane konto: dezaktywację, ponowną próbę logowania hasłem i OAuth, odświeżenie sesji, użycie wcześniej wydanego tokenu do odczytu i zapisu, zachowanie zamówień, niedozwolone zmiany statusu przez zwykłego użytkownika oraz przywrócenie przez administratora. Nie zmieniaj rzeczywistych kont w produkcji podczas testów.

## Ustalenia przed implementacją

- Projekt TechniShop nie ma obecnie gałęzi testowej Supabase. Docelowa implementacja wymaga testów w izolowanym środowisku przed wdrożeniem. Nie wykonywano zmian na produkcji.
- W kodzie panelu administratora istnieje lokalny fallback uwierzytelniania oparty na `localStorage` i kodzie dostępnym w przeglądarce. Nie może on stanowić podstawy dostępu ani przywracania kont; uprawnienia administratora muszą być sprawdzane po stronie zaufanego serwera i bazy. Należy oddzielnie usunąć taki fallback i przetestować działanie panelu.
- Wdrożona funkcja `send-order-email` ma włączoną weryfikację JWT, ale w odczytanym kodzie nie sprawdza stanu konta, wersji JWT ani powiązania użytkownika z zamówieniem i przyjmuje adres odbiorcy z żądania. Dostęp do tej funkcji musi zostać objęty projektem blokowania kont oraz osobnym przeglądem nadużyć. Nie testowano wysyłania wiadomości.
- W projekcie jest jeden administrator; przed testami i uruchomieniem procesu przywracania potrzebna jest bezpieczna procedura odzyskiwania dostępu bez polegania na dezaktywowanym koncie.
