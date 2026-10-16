import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCw,
  Layers,
  Info,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Loader2,
  Eye
} from 'lucide-react';

export const getColorHex = (colorName?: string): string => {
  if (!colorName) return '#6D28D9';
  const c = colorName.toLowerCase();
  if (c.includes('fiolet') || c.includes('purple')) return '#6D28D9';
  if (c.includes('czarn') || c.includes('black')) return '#1E1B4B';
  if (c.includes('biał') || c.includes('white')) return '#F8FAFC';
  if (c.includes('szar') || c.includes('gray') || c.includes('grey')) return '#64748B';
  if (c.includes('czerwon') || c.includes('red')) return '#DC2626';
  if (c.includes('niebiesk') || c.includes('blue')) return '#2563EB';
  if (c.includes('zielon') || c.includes('green')) return '#059669';
  if (c.includes('żółt') || c.includes('yellow')) return '#D97706';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#6D28D9';
};

interface ModelProps {
  color: string;
  wireframe: boolean;
  showHotspots: boolean;
  activeHotspot: number | null;
  setActiveHotspot: (id: number | null) => void;
}

const Model: React.FC<ModelProps> = ({
  color,
  wireframe,
  showHotspots,
  activeHotspot,
  setActiveHotspot,
}) => {
  const { scene } = useGLTF('/model.glb');
  const clonedScene = React.useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const mainHex = getColorHex(color);
    const mainColorObj = new THREE.Color(mainHex);

    const hsl = { h: 0, s: 0, l: 0 };
    mainColorObj.getHSL(hsl);
    const ribColorObj = new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0.05, hsl.l - 0.08));

    clonedScene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const newMaterials = materials.map((mat) => {
            const m = (mat as THREE.MeshStandardMaterial).clone();
            m.wireframe = wireframe;

            const matName = (m.name || '').toLowerCase();
            if (matName.includes('ribana') || matName.includes('rib')) {
              m.color = ribColorObj;
            } else {
              m.color = mainColorObj;
            }
            m.roughness = 0.65;
            m.metalness = 0.05;
            m.needsUpdate = true;
            return m;
          });

          mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });
  }, [clonedScene, color, wireframe]);

  const hotspots = [
    {
      id: 1,
      position: [0, 0.4, 0.28] as [number, number, number],
      title: 'Haftowany Logotyp Techni',
      desc: 'Precyzyjny haft z nici odpornych na spranie i blaknięcie.',
    },
    {
      id: 2,
      position: [0, 1.25, -0.05] as [number, number, number],
      title: 'Podwójny Kaptur Premium',
      desc: 'Gramatura 380g/m² ze sznurkami i bawełnianą podszewką.',
    },
    {
      id: 3,
      position: [0.75, 0.35, 0.0] as [number, number, number],
      title: 'Wzmocnione Ściągacze',
      desc: 'Dzianina Ribana z dodatkiem elastanu zapobiega rozciąganiu.',
    },
    {
      id: 4,
      position: [0, -0.45, 0.3] as [number, number, number],
      title: 'Kieszeń Kangurka',
      desc: 'Pojemna kieszeń przednia ze wzmocnionymi szwami przy krawędziach.',
    },
  ];

  return (
    <group>
      <primitive object={clonedScene} scale={1.8} position={[0, -0.5, 0]} />

      {showHotspots &&
        hotspots.map((hs) => {
          const isActive = activeHotspot === hs.id;
          return (
            <Html key={hs.id} position={hs.position} center distanceFactor={12}>
              <div className="relative group z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(isActive ? null : hs.id);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-lg cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white scale-125 ring-4 ring-purple-300'
                      : 'bg-white/90 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-300 hover:scale-110'
                  }`}
                  title={hs.title}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                {isActive && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-9 w-56 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-purple-500/30 text-xs space-y-1 z-40 anim-fade-in pointer-events-auto">
                    <div className="font-extrabold text-purple-300 flex items-center justify-between">
                      <span>{hs.title}</span>
                      <button
                        onClick={() => setActiveHotspot(null)}
                        className="text-slate-400 hover:text-white text-[10px] ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">{hs.desc}</p>
                  </div>
                )}
              </div>
            </Html>
          );
        })}
    </group>
  );
};

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="flex flex-col items-center gap-2 font-bold text-xs text-purple-900 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-purple-200 text-center min-w-[200px]">
      <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
      <span>Wczytywanie modelu 3D...</span>
      <span className="text-[10px] text-slate-500 font-normal">Przygotowywanie materiałów i tekstur</span>
    </div>
  </Html>
);

interface Product3DViewerProps {
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  availableColors?: string[];
  height?: string;
  autoRotateDefault?: boolean;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  selectedColor = 'Fioletowa',
  onColorChange,
  availableColors = ['Fioletowa', 'Czarna', 'Szara', 'Biała'],
  height = 'h-[460px]',
  autoRotateDefault = true,
}) => {
  const [color, setColor] = useState(selectedColor);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [wireframe, setWireframe] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  const handleColorSelect = (c: string) => {
    setColor(c);
    if (onColorChange) onColorChange(c);
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen bg-slate-950 p-4 flex flex-col' : `${height} rounded-3xl overflow-hidden bg-gradient-to-b from-[#F5F2EC] via-[#FAF7F2] to-[#ECE7DC] border border-[#EBE6DD] shadow-inner`}`}
    >
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-200/80 shadow-xs pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
            Interaktywne Studio 3D
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E7E2D8] shadow-xs pointer-events-auto">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Kolor 3D:
          </span>
          {availableColors.map((c) => {
            const isSelected = color === c;
            return (
              <button
                key={c}
                onClick={() => handleColorSelect(c)}
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-purple-600 scale-110 shadow-sm' : 'border-slate-300 hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: getColorHex(c) }}
                title={`Zmień kolor na ${c}`}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full h-full flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.95} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.6} color="#c084fc" />
          <pointLight position={[0, -2, 2]} intensity={0.4} color="#f472b6" />

          <Suspense fallback={<LoadingFallback />}>
            <Center top>
              <Float speed={autoRotate ? 1.5 : 0} rotationIntensity={autoRotate ? 0.2 : 0} floatIntensity={autoRotate ? 0.2 : 0}>
                <Model
                  color={color}
                  wireframe={wireframe}
                  showHotspots={showHotspots}
                  activeHotspot={activeHotspot}
                  setActiveHotspot={setActiveHotspot}
                />
              </Float>
            </Center>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            minDistance={1.8}
            maxDistance={5.5}
            autoRotate={autoRotate}
            autoRotateSpeed={2.5}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[10px] font-bold text-slate-500 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E7E2D8] hidden md:flex items-center space-x-1.5 pointer-events-auto">
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>Przeciągnij myszką, aby obrócić 360° • Kółko myszy do zoomu</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E2D8] shadow-md pointer-events-auto ml-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              autoRotate
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
            title={autoRotate ? 'Zatrzymaj automatyczną rotację' : 'Włącz automatyczną rotację'}
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Rotacja</span>
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              showHotspots
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50'
            }`}
            title="Pokaż/Ukryj punkty informacyjne"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Punkty</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              wireframe
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50'
            }`}
            title="Tryb siatki 3D (Wireframe)"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Siatka</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer"
            title="Resetuj widok kamery"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer"
            title="Pełny ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
