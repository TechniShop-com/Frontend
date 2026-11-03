import { Product } from '../types';

/**
 * Normalizacja tekstu: małe litery, usunięcie polskich znaków diakrytycznych,
 * usunięcie znaków interpunkcyjnych i wielokrotnych spacji.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Odległość Damerau-Levenshteina
 * Uwzględnia wstawienie, usunięcie, zamianę oraz zamianę sąsiednich znaków (transpozycję).
 */
export const damerauLevenshteinDistance = (a: string, b: string): number => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];

  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        matrix[i - 1][j] + 1, // usunięcie
        matrix[i][j - 1] + 1, // wstawienie
        matrix[i - 1][j - 1] + cost // zamiana
      );

      // Transpozycja (np. "ul" <-> "lu" w "bulzka" vs "bluzka")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        min = Math.min(min, matrix[i - 2][j - 2] + 1);
      }

      matrix[i][j] = min;
    }
  }

  return matrix[al][bl];
};

/**
 * Popularne synonimy, potoczne nazwy i częste zniekształcenia w e-commerce
 */
const SYNONYMS_MAP: Record<string, string> = {
  bulzka: 'bluza',
  bluzka: 'bluza',
  bluzy: 'bluza',
  bluz: 'bluza',
  hoodi: 'hoodie',
  hoody: 'hoodie',
  kangurka: 'hoodie',
  sweter: 'bluza',
  koszula: 'koszulka',
  koszulki: 'koszulka',
  koszulek: 'koszulka',
  tshirt: 't-shirt',
  tshirty: 't-shirt',
  koszulka: 'polo',
  polowka: 'polo',
  plecaki: 'plecak',
  plecaczek: 'plecak',
  plack: 'plecak',
  plekac: 'plecak',
  butelki: 'butelka',
  butelka: 'termiczna',
  termos: 'butelka',
  bidon: 'butelka',
  czapki: 'czapka',
  czapa: 'czapka',
  daszek: 'czapka',
  snapback: 'czapka',
  kobiety: 'women',
  kobieta: 'women',
  damska: 'women',
  damskie: 'women',
  dziewczyna: 'women',
  mezczyzni: 'men',
  mezczyzna: 'men',
  meska: 'men',
  meskie: 'men',
  chlopak: 'men',
  szkola: 'techni schools',
  szkoly: 'techni schools',
  zdalni: 'techni zdalni',
  zdalne: 'techni zdalni',
};

/**
 * Kluczowe słowa w sklepie używane do podpowiedzi w przypadku literówek
 */
const CANONICAL_KEYWORDS = [
  'bluza',
  'hoodie',
  'koszulka',
  'polo',
  't-shirt',
  'plecak',
  'butelka',
  'czapka',
  'męskie',
  'damskie',
  'unisex',
  'techni schools',
  'techni zdalni',
];

export interface FuzzySearchResult {
  results: Product[];
  suggestedCorrection?: string;
  hasFuzzyMatch: boolean;
}

/**
 * Wyszukuje produkty z tolerancją literówek, synonimów i odmian
 */
export const searchProductsFuzzy = (products: Product[], rawQuery: string): FuzzySearchResult => {
  const normalizedQuery = normalizeText(rawQuery);
  if (!normalizedQuery) {
    return { results: [], hasFuzzyMatch: false };
  }

  const queryTokens = normalizedQuery.split(' ').filter((w) => w.length > 0);
  let bestSuggestedCorrection: string | undefined;
  let hasFuzzyOrSynonym = false;

  // Sprawdzamy czy któreś ze słów zapytania pasuje do synonimów
  const expandedTokens: string[] = [];
  for (const token of queryTokens) {
    expandedTokens.push(token);
    if (SYNONYMS_MAP[token]) {
      const canonical = SYNONYMS_MAP[token];
      expandedTokens.push(normalizeText(canonical));
      bestSuggestedCorrection = canonical;
      hasFuzzyOrSynonym = true;
    }
  }

  // Punktacja produktów
  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of products) {
    const normTitle = normalizeText(product.title);
    const normDesc = normalizeText(product.description);
    const normBrand = normalizeText(product.brand.replace('_', ' '));
    const normGender = normalizeText(
      product.gender === 'WOMEN' ? 'kobiety damskie' : product.gender === 'MEN' ? 'mezczyzni meskie' : 'unisex damskie meskie'
    );
    const normColors = normalizeText(product.colors.join(' '));

    const productWords = [
      ...normTitle.split(' '),
      ...normDesc.split(' '),
      ...normBrand.split(' '),
      ...normGender.split(' '),
      ...normColors.split(' '),
    ].filter((w) => w.length > 0);

    let productScore = 0;
    let matchedTokensCount = 0;

    for (const qWord of queryTokens) {
      let wordMatched = false;

      // 1. Dokładne dopasowanie podciągu w tytule (najwyższy priorytet)
      if (normTitle.includes(qWord)) {
        productScore += 100;
        wordMatched = true;
      } else if (normDesc.includes(qWord)) {
        productScore += 50;
        wordMatched = true;
      } else if (normBrand.includes(qWord) || normGender.includes(qWord) || normColors.includes(qWord)) {
        productScore += 60;
        wordMatched = true;
      }

      // 2. Dopasowanie przez synonim
      if (!wordMatched && SYNONYMS_MAP[qWord]) {
        const synonymWord = normalizeText(SYNONYMS_MAP[qWord]);
        if (normTitle.includes(synonymWord)) {
          productScore += 80;
          wordMatched = true;
        } else if (normDesc.includes(synonymWord) || normGender.includes(synonymWord)) {
          productScore += 45;
          wordMatched = true;
        }
      }

      // 3. Dopasowanie rozmyte (Fuzzy Match / literówki)
      if (!wordMatched && qWord.length >= 3) {
        // Dopuszczalna odległość: 1 dla 3-6 znaków, 2 dla 7+ znaków
        const maxDist = qWord.length <= 6 ? 1 : 2;

        let bestDistanceForWord = Infinity;
        let matchedCanonicalWord = '';

        for (const pWord of productWords) {
          if (pWord.length < 3) continue;

          // Porównanie z całym słowem produktu
          const dist = damerauLevenshteinDistance(qWord, pWord);
          if (dist <= maxDist && dist < bestDistanceForWord) {
            bestDistanceForWord = dist;
            matchedCanonicalWord = pWord;
          }

          // Sprawdzenie podciągów (np. wpisano "bulzk", a słowo to "bluzka")
          if (pWord.length > qWord.length) {
            for (let i = 0; i <= pWord.length - qWord.length; i++) {
              const sub = pWord.substring(i, i + qWord.length);
              const subDist = damerauLevenshteinDistance(qWord, sub);
              if (subDist <= maxDist && subDist < bestDistanceForWord) {
                bestDistanceForWord = subDist;
                matchedCanonicalWord = pWord;
              }
            }
          }
        }

        if (bestDistanceForWord <= maxDist) {
          const fuzzyPoints = 40 - bestDistanceForWord * 10;
          productScore += fuzzyPoints;
          wordMatched = true;
          hasFuzzyOrSynonym = true;

          if (!bestSuggestedCorrection) {
            // Znajdź najbliższe słowo kanoniczne do zasugerowania
            const foundCanonical = CANONICAL_KEYWORDS.find(
              (kw) => normalizeText(kw) === matchedCanonicalWord || damerauLevenshteinDistance(qWord, normalizeText(kw)) <= maxDist
            );
            bestSuggestedCorrection = foundCanonical || matchedCanonicalWord;
          }
        }
      }

      if (wordMatched) {
        matchedTokensCount++;
      }
    }

    // Dodaj produkt tylko, jeśli przynajmniej jedno słowo zapytania zostało dopasowane
    if (productScore > 0 && matchedTokensCount > 0) {
      scoredProducts.push({ product, score: productScore });
    }
  }

  // Posortuj od najlepiej dopasowanych
  scoredProducts.sort((a, b) => b.score - a.score);

  return {
    results: scoredProducts.map((sp) => sp.product),
    suggestedCorrection: bestSuggestedCorrection,
    hasFuzzyMatch: hasFuzzyOrSynonym,
  };
};
