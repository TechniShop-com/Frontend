import { Product } from '../types';

export interface Hotspot3D {
  id: number;
  position: [number, number, number];
  title: string;
  desc: string;
}

export interface Product3DConfig {
  modelUrl: string;
  productType: 'apparel';
  label: string;
  defaultColor: string;
  supportedColors: string[];
  hotspots: Hotspot3D[];
}

export const DEFAULT_APPAREL_HOTSPOTS: Hotspot3D[] = [
  {
    id: 1,
    position: [0.3, 0.4, 0.25],
    title: 'Haftowane Logo Techni',
    desc: 'Precyzyjny haft maszynowy odporny na pranie i ścieranie.',
  },
  {
    id: 2,
    position: [-0.35, 0.1, 0.2],
    title: 'Bawełna Czesana Premium',
    desc: 'Miękka dzianina o podwyższonej gramaturze zapewniająca trwałość.',
  },
  {
    id: 3,
    position: [0, 0.85, 0.1],
    title: 'Wzmocniony Kołnierz',
    desc: 'Elastyczny ściągacz z dodatkiem elastanu utrzymujący kształt.',
  },
  {
    id: 4,
    position: [0.6, -0.1, 0.0],
    title: 'Podwójne Szwy',
    desc: 'Wzmocnione przeszycia na rękawach i u dołu odzieży.',
  },
];

const COMPATIBLE_APPAREL_IDS = new Set([
  'hoodie-1',
  'polo-women',
  'polo-men',
  'tee-women',
  'tee-men',
]);

export const getProduct3DConfig = (product?: Product | null): Product3DConfig | null => {
  if (!product) return null;

  const normalizedId = product.id.toLowerCase();
  const normalizedTitle = product.title.toLowerCase();

  const isAccessory =
    normalizedTitle.includes('plecak') ||
    normalizedTitle.includes('butelka') ||
    normalizedTitle.includes('czapka') ||
    normalizedId.includes('backpack') ||
    normalizedId.includes('thermo') ||
    normalizedId.includes('cap');

  if (isAccessory) {
    return null;
  }

  const isApparel =
    COMPATIBLE_APPAREL_IDS.has(normalizedId) ||
    normalizedTitle.includes('t-shirt') ||
    normalizedTitle.includes('koszulka') ||
    normalizedTitle.includes('bluza');

  if (!isApparel) {
    return null;
  }

  return {
    modelUrl: '/model.glb',
    productType: 'apparel',
    label: 'Interaktywny Podgląd 3D Odzieży Techni',
    defaultColor: product.colors[0] || 'Fioletowa',
    supportedColors:
      product.colors.length > 0 ? product.colors : ['Fioletowa', 'Czarna', 'Biała', 'Szara'],
    hotspots: DEFAULT_APPAREL_HOTSPOTS,
  };
};

export const hasProduct3DModel = (product?: Product | null): boolean => {
  return getProduct3DConfig(product) !== null;
};
