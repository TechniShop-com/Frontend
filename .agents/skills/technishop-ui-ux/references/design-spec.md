# TechniShop — wzorzec UI i UX

## Zakres i odtwarzanie

Punkt odniesienia: lokalny frontend TechniShop, stan dostępny 29.10.2026. To sklep z odzieżą i gadżetami społeczności Techni Schools i Techni Zdalni. Jest po polsku, ceny wyświetla w zł. Podstawowa estetyka: jasny, ciepły e-commerce z białymi kartami, wyrazistym fioletem, granatowym tekstem, dużymi zaokrągleniami oraz ciemnymi, fotograficznymi akcentami. Interfejs jest gęsty informacyjnie, ale uporządkowany w wyraźne bloki; inspiracje w kodzie to polskie sklepy odzieżowe i marketplace'y.

To dokumentacja rzeczywistego wzorca, a nie projekt nowej marki. Szczegóły różniące się między stronami rozstrzygaj na podstawie plików z `snapshot/`. Nie wszystkie zmienne kolorów w Tailwind są faktycznie dominujące: zielony i cyjan pełnią funkcje pomocnicze, fiolet jest głównym kolorem akcji.

## Fundament wizualny

### Kolory

| Zastosowanie | Wartość / odpowiednik Tailwind |
| --- | --- |
| Płótno strony | `#FAF7F2` |
| Karty | `#FFFFFF` |
| Nawigacja | `#EFECE4`, po scrollu 85% krycia i blur |
| Nawigacja: ramka / input | `#E2DDD3` / `#E4DFD5` |
| Stopka | `#F5F2EB`, ramka `#E7E2D8` |
| Ciepła ramka kart | `#EBE6DD`, także `#E7E2D8`, `#E3DDD2`, `#DDD8CD` |
| Dodatkowa jasna powierzchnia | `#FAF8F5`, `#F0ECE4`, `#F2EDE2` |
| Tekst główny | slate-900 / `#0F172A` |
| Tekst drugorzędny | slate-500/600; tekst mocny slate-700/800 |
| Główna akcja | purple-600, hover purple-700, active purple-800; biały tekst |
| Link / zaznaczenie | purple-700, jasne tło purple-50 |
| Sukces | emerald-600/700 na jasnym tle |
| Ostrzeżenie / gwiazdki | yellow-400/500 |
| Hero / brandowe tło | `#060e1e` z granatowym półprzezroczystym gradientem |

Zdefiniowane dodatkowo: `#8B5CF6` fiolet marki, `#1E293B` slate, `#10B981` zieleń, `#06B6D4` cyjan. Gradient logo przechodzi `#9333EA → #7C3AED → #4F46E5`, trzon `#A855F7 → #7C3AED → #3730A3`.

### Typografia i rytm

Inter, sans-serif; oryginał ładuje odmiany 300–900 przez Google Fonts. Nagłówki są zwarte, `font-black` lub `font-extrabold`, często `tracking-tight`. Tytuł strony ma zwykle 24–30 px (`text-2xl sm:text-3xl`), hero 30/48/60 px. Nagłówki sekcji przeważnie 24 px, tytuły kart 14–16 px, tekst pomocniczy 10–12 px. Etykiety marek i krótkie overline'y: 10 px, uppercase, bold/extrabold, `tracking-wider`. Kwoty w podsumowaniu często używają `font-mono` i mocnego fioletu. Mała typografia należy do oryginału; podczas rozbudowy zachowuj czytelność i dostępny kontrast, zamiast bezrefleksyjnie kopiować drobne napisy.

Stosuj marginesy wielokrotności 4 px: sekcje oddzielają 24–32 px, wnętrza kart 16–28 px, elementy formularzy 12–16 px. Główna szerokość `max-w-7xl` (~1280 px), koszyk `max-w-5xl` (~1024 px); wyśrodkuj, dodaj 16–24 px marginesu mobilnego. Panele i sekcje często `rounded-3xl` (24 px), pola i przyciski `rounded-xl` (12 px) lub `rounded-2xl` (16 px), pigułki `rounded-full`. Kontury ciepłe, 1 px; delikatne `shadow-xs`/`shadow-sm`; mocniejszy cień dla hero i wysuwanych paneli.

### Logo i ikony

`snapshot/components/Logo.tsx` zawiera kompletny wektor: geometryczne T w gradiencie fiolet–indygo, mały biały punkt, cień w fiolecie. Obok napis TECHNI ciemny, SHOP w jasnym fiołkowym gradiencie, mała fioletowa kropka; ciasny tracking `-0.04em`, font-black. Opcjonalnie podtytuł `Official Store` uppercase z dużym odstępem. Wariant jasny do ciemnego tła. Ikony pochodzą z lucide-react, zwykle 14–20 px, w kolorze fioletowym lub slate, bez osobnych wielobarwnych ilustracji.

## Komponenty i interakcje

- **Navbar:** przyklejony na górze, z paskiem promocyjnym, logo, linkami i bogatym menu produktów. Jest też wyszukiwarka, konto i koszyk z licznikiem. Menu kategorii ma ciepłe tło, zaokrąglony panel, podział kolumn, ikonografię i elementy promocyjne. Wyszukiwanie kieruje na `/products?search=...`; kategorie kierują na `/products?category=...`. Szczegóły i wariant mobilny w `components/Navbar.tsx`.
- **Hero:** szeroki fotograficzny karuzelowy banner, `rounded-3xl`, wysokość 530 px mobilnie, 620 px od `sm`, 680 px od `lg`. Zdjęcia `object-cover`, warstwy granatowych gradientów od lewej i od dołu, lewy blok tekstu z białym nagłówkiem i jasnofioletowym gradientem. Strzałki w ciemnych półprzezroczystych okręgach, dolne kropki we wspólnej ciemnej pigułce; automatyczna zmiana co 5 s, płynne zapętlenie. Oryginał ma 5 zdalnych zdjęć odzieży, których dokładne URL-e są w `HeroSlider.tsx`.
- **Trust strip:** biała obramowana karta z czterema ikonami i krótkimi tekstami korzyści, układ 2 kolumny na małym ekranie i 4 na średnim. Nie wymyślaj gwarancji ani terminów dostawy.
- **Karty produktu:** siatka 1/2/3/4 kolumny (domyślnie / sm / lg / xl). Obraz 3:4, `object-cover`, kremowe tło, zaokrąglone rogi; plakietka płci, serce, metka marki, na hover szybki wybór rozmiaru. Poniżej rating, kropki kolorów, tytuł, cena i fioletowy przycisk. Tytuł prowadzi do szczegółów, szybkie akcje nie powinny wyzwalać nawigacji karty. Gdy nie ma produktów, pokaż czytelny pusty stan.
- **Formularze i selektory:** kremowy input z ciepłym obramowaniem, 12 px promienia, padding ~12 px, wyraźna etykieta; zaznaczenie fioletową ramką i jasnym wypełnieniem. Rozmiary i kolory jako przyciski z wyróżnionym wybranym stanem. Ilość: minus, liczba, plus w wspólnym zaokrąglonym obramowaniu.
- **Koszyk drawer:** prawa szuflada `max-w-md`, ekranowy przyciemniony backdrop, stały nagłówek i stopka, przewijana lista, pasek postępu darmowej dostawy, miniatury, ilości, usuwanie, kod rabatowy, wyliczenie, przejście do kasy i do koszyka. Escape zamyka, tło podczas otwarcia nie przewija się. W nowych implementacjach dodaj pełną obsługę fokusu i przywróć poprzedni stan scrolla.
- **Toasty i stany:** drobny fioletowy toast na dole po prawej przy działaniach sklepu; ustawienia mają toast na górze. Ładowanie, błędy, pusty koszyk i brak wyników powinny mieć zrozumiałe komunikaty; nie sugeruj powodzenia przy niepowodzeniu.
- **Animacje:** w `index.css` są keyframes ruchu produktów (figure-8, skośne unoszenie, sway, 3D wobble), pulsujące gwiazdki, delikatne blob/glow i gradient shimmer. Przykładowe cykle 4.8–8.5 s, ease-in-out. Są charakterystyczne dla brandowych ilustracji, nie dla każdej karty. Dla `prefers-reduced-motion` wyłącz powtarzalny ruch i automatyczne przewijanie.

## Układy i ścieżki

1. `/`: hero, pasek korzyści, sekcja polecanych produktów w siatce, przejście do kolekcji. Karty zawierają szybkie dodawanie i ulubione; globalna nawigacja i stopka otaczają treść.
2. `/products`: katalog z kategoriami `kobiety`, `mezczyzni`, `akcesoria`, wyszukiwaniem z URL i sortowaniem domyślnym / cena rosnąco / cena malejąco. Wyniki, ładowanie i brak wyników opisano w `pages/ProductsPage.tsx`.
3. `/product/:id`: breadcrumbs; desktopowy grid 12 kolumn z dużym kwadratowym zdjęciem i benefitami po lewej, zakupem po prawej. Tytuł, cena, warianty, rozmiar, ilość, dodanie do koszyka i szybki zakup. Niżej zakładki: opis, parametry, rozmiary, opinie. Na telefonie stały dolny pasek z ceną, wariantem i CTA; zostaw miejsce pod nim. Źródłowe opinie i dane tabeli są przykładowe.
4. `/cart`: nagłówek z licznikiem i linkiem powrotu; pusty stan albo 12-kolumnowy grid `8 + 4` na dużym ekranie, lista produktów i pasek progu dostawy po lewej, sticky podsumowanie i kupon po prawej. Zawiera nazwę, warianty, obraz, cenę i kontrolę ilości. W źródle próg i ceny są przykładowe, wymagają konfiguracji.
5. `/checkout`: 12-kolumnowy układ formularza i podsumowania. Kolejne karty: dane odbiorcy, sposób dostawy, sposób płatności; zaznaczone opcje są fioletowe, pola zależą od metody. Po zamówieniu ekran potwierdzenia. Widoczne opcje InPost/BLIK itp. w referencji nie dowodzą integracji; unikaj fałszywego potwierdzenia płatności.
6. `/login` i `/register`: pełnoekranowy desktopowy podział — ciemny fotograficzny brand showcase po lewej (7/12), czysty jasny formularz po prawej (5/12); duży komunikat i małe benefity. Zakładki logowania i rejestracji, etykiety, przyciski, obsługa błędu. Na małych ekranach nacisk na formularz. Stopka ukryta.
7. `/settings` i `/account`: osobny pełnoekranowy layout bez zwykłej nawigacji i stopki, panel boczny `md:w-72 lg:w-80` z powrotem do sklepu, logo, sekcjami i profilem; zawartość obejmuje dane ogólne, bezpieczeństwo, preferencje oraz wybór avatara. Na telefonie panel i treść układają się pionowo.
8. Stopka sklepu: ciepły pas, cienka górna ramka, subtelna rozmyta fioletowa poświata, logo z podtytułem oraz wyrównane informacje o marce i copyright; na telefonie układ pionowy.

## Ton i treści

Język polski, bezpośredni, przyjazny społeczności szkolnej, energiczny i zwięzły. Produkty określane konkretnie: typ, linia, kolor, rozmiar, cena. Nagłówki krótkie i mocne; w przyciskach stosowane są zarówno tytułowe formy (`Przejdź do kolekcji`), jak i uppercase (`DODAJ DO KOSZYKA`, `PRZEJDŹ DO KASY`). Używaj spójnych polskich etykiet, waluty `zł` i informacji potrzebnych do decyzji. Unikaj wymyślonych opinii, ocen, korzyści, dostępności, terminów i promocji w prawdziwym sklepie.

## Reprodukcja i ograniczenia

Zachowaj proporcje, typografię, odstępy, elementy nawigacji i kolejność treści; dostosuj układ przy breakpointach Tailwind `sm=640`, `md=768`, `lg=1024`, `xl=1280`. Porównuj rzeczywisty wynik przy podobnych rozmiarach viewportu, włączając otwarty koszyk, puste stany, menu, selekcje, formularze i widok mobilny. Źródło może zawierać niespójności, martwe kontrolki, dane testowe i ograniczenia dostępności — implementuj zachowanie zgodne z intencją użytkownika, a nie kopiuj błędów.

Zdjęcia i awatary są zewnętrzne, stąd nie stanowią lokalnych assetów; odtworzenie identycznych ujęć zależy od dostępności i praw do nich. Zachowano kod SVG logo, CSS animacji oraz dokładne JSX klas i linków w `snapshot/`. Snapshot nie zawiera sekretów, backendu, bazy danych ani środowiska wykonawczego; trzeba podłączyć lub zamockować własne źródła danych. Projektowane w przyszłości panele admina, płatności i Paczkomaty nie są opisem ukończonej funkcjonalności.
