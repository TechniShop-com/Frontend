import { Product } from '../types';

export interface Hotspot3D {
  id: number;
  position: [number, number, number];
  title: string;
  desc: string;
}

export interface Product3DConfig {
  modelUrl: string;
  productType: 'tshirt';
  label: string;
  defaultColor: string;
  supportedColors: string[];
  hotspots: Hotspot3D[];
}

export const OFFICIAL_TSHIRT_HOTSPOTS: Hotspot3D[] = [
  {
    id: 1,
    position: [0, 0.24, 0.33],
    title: 'Logotyp Techni Zdalni (Przód)',
    desc: 'Centralny nadruk na klatce piersiowej z fioletowym logotypem TECHNI oraz kontrastową typografią ZDALNI.',
  },
  {
    id: 2,
    position: [0, 0.05, -0.3],
    title: 'Grafika 3D "School that makes a difference" (Tył)',
    desc: 'Autorska grafika na plecach z metalicznym splotem 3D oraz sygnaturą Technikum | TECHNI ZDALNI | Liceum.',
  },
  {
    id: 3,
    position: [0, 0.66, 0.16],
    title: 'Wzmocniony Kołnierz Ribana',
    desc: 'Elastyczny ściągacz o gęstym splocie Ribana utrzymujący właściwy kształt wokół szyi.',
  },
  {
    id: 4,
    position: [0.62, 0.18, 0.05],
    title: 'Dzianina Knit Cotton Jersey',
    desc: 'Miękka bawełna czesana o podwyższonej gramaturze z osobnymi warstwami materiału i nadruku.',
  },
];

const COMPATIBLE_TSHIRT_IDS = new Set(['tee-women', 'tee-men']);

export const getProduct3DConfig = (product?: Product | null): Product3DConfig | null => {
  if (!product) return null;

  const normalizedId = product.id.toLowerCase();
  const normalizedTitle = product.title.toLowerCase();

  const isExcludedCategory =
    normalizedTitle.includes('plecak') ||
    normalizedTitle.includes('butelka') ||
    normalizedTitle.includes('czapka') ||
    normalizedTitle.includes('bluza') ||
    normalizedTitle.includes('hoodie') ||
    normalizedTitle.includes('polo') ||
    normalizedId.includes('backpack') ||
    normalizedId.includes('thermo') ||
    normalizedId.includes('cap') ||
    normalizedId.includes('hoodie') ||
    normalizedId.includes('polo');

  if (isExcludedCategory) {
    return null;
  }

  const isCompatibleTShirt =
    COMPATIBLE_TSHIRT_IDS.has(normalizedId) ||
    normalizedTitle.includes('t-shirt') ||
    normalizedTitle.includes('koszulka techni');

  if (!isCompatibleTShirt) {
    return null;
  }

  return {
    modelUrl: '/model.glb',
    productType: 'tshirt',
    label: 'Oficjalny Model 3D Koszulki Techni Zdalni',
    defaultColor: product.colors[0] || 'Biała',
    supportedColors: product.colors.length > 0 ? product.colors : ['Biała', 'Fioletowa', 'Czarna', 'Szara'],
    hotspots: OFFICIAL_TSHIRT_HOTSPOTS,
  };
};

export const hasProduct3DModel = (product?: Product | null): boolean => {
  return getProduct3DConfig(product) !== null;
};
