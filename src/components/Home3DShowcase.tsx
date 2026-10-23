import React, { useState } from 'react';
import { Product3DViewer } from './Product3DViewer';
import { Sparkles, ArrowRight, Check, ShoppingBag, Eye, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';

export const Home3DShowcase: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState('Biała');
  const [addedNotice, setAddedNotice] = useState(false);

  const featuredProduct = MOCK_PRODUCTS[4] || MOCK_PRODUCTS[0];

  const handleAddToCart = () => {
    addToCart(featuredProduct, selectedColor, 'M');
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#0F172A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-purple-500/20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Oficjalna Koszulka Techni Zdalni 3D</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Zobacz Koszulkę Techni Zdalni w 360°
            </h2>
            <p className="text-sm text-purple-200/90 font-medium leading-relaxed">
              Sprawdź oryginalny nadruk Techni Zdalni na piersi oraz autorską grafikę 3D School that makes a difference na plecach.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 text-xs font-medium">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
              <div className="w-7 h-7 rounded-xl bg-purple-500/30 flex items-center justify-center shrink-0 text-yellow-300 font-bold">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Widok Przód i Tył (360°)</span>
                <span className="text-purple-200/70 text-[11px]">Przełączaj kamerę między logotypem na piersi a grafiką na plecach</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
              <div className="w-7 h-7 rounded-xl bg-purple-500/30 flex items-center justify-center shrink-0 text-yellow-300 font-bold">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Dynamiczna Zmiana Koloru Dzianiny</span>
                <span className="text-purple-200/70 text-[11px]">Biały oryginał, Królewski Fiolet, Głęboka Czerń i Szary</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 p-4 rounded-2xl space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-200">Wybrany wariant 3D:</span>
              <span className="font-extrabold text-white uppercase">{selectedColor}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <ShoppingBag className="w-4 h-4 text-yellow-300" />
                <span>KUP KOSZULKĘ 3D ({featuredProduct.price.toFixed(2)} zł)</span>
              </button>

              <Link
                to={`/product/${featuredProduct.id}`}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
                title="Przejdź do karty produktu"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {addedNotice && (
              <div className="bg-emerald-500/90 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 anim-wiggle">
                <Check className="w-4 h-4" />
                <span>Dodano koszulkę Techni z podglądu 3D do koszyka!</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 h-[450px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
          <Product3DViewer
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            availableColors={['Biała', 'Fioletowa', 'Czarna', 'Szara']}
            height="h-full"
            autoRotateDefault={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Home3DShowcase;
