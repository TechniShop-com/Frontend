import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'polo-1',
    title: 'Koszulka Polo Techni',
    description: 'Klasyczna koszulka polo z wyhaftowanym dyskretnym logo Techni. Wykonana w 100% z bawełny.',
    price: 79.99,
    brand: 'TECHNI_SCHOOLS',
    colors: ['Czarna', 'Biała', 'Fioletowa'],
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'polo-2',
    title: 'Koszulka Polo Techni Zdalni',
    description: 'Edycja dla uczniów zdalnych. Wygodny krój z bawełny pique.',
    price: 84.99,
    brand: 'TECHNI_ZDALNI',
    colors: ['Fioletowa', 'Czarna', 'Biała'],
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: 'https://images.unsplash.com/photo-1625910513413-7557161b4081?auto=format&fit=crop&w=600&q=80',
  }
];
