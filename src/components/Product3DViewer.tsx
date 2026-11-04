import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Float } from '@react-three/drei';
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
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Hotspot3D, OFFICIAL_TSHIRT_HOTSPOTS } from '../config/model3dConfig';

export const getColorHex = (colorName?: string): string => {
  if (!colorName) return '#FFFFFF';
  const c = colorName.toLowerCase();
  if (c.includes('biał') || c.includes('white') || c.includes('orygina')) return '#FFFFFF';
  if (c.includes('fiolet') || c.includes('purple')) return '#5B21B6';
  if (c.includes('czarn') || c.includes('black')) return '#18181B';
  if (c.includes('szar') || c.includes('gray') || c.includes('grey')) return '#94A3B8';
  if (c.includes('czerwon') || c.includes('red')) return '#DC2626';
  if (c.includes('niebiesk') || c.includes('blue')) return '#2563EB';
  if (c.includes('zielon') || c.includes('green')) return '#059669';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#FFFFFF';
};

const isDarkColorHex = (hex: string): boolean => {
  const color = new THREE.Color(hex);
  const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return lum < 0.42;
};

interface ModelProps {
  modelUrl: string;
  color: string;
  wireframe: boolean;
  showHotspots: boolean;
  hotspots: Hotspot3D[];
  activeHotspot: number | null;
  setActiveHotspot: (id: number | null) => void;
}

const Model: React.FC<ModelProps> = ({
  modelUrl,
  color,
  wireframe,
  showHotspots,
  hotspots,
  activeHotspot,
  setActiveHotspot,
}) => {
  const { scene } = useGLTF(modelUrl);

  const { clonedScene, clonedMaterials } = useMemo(() => {
    const root = scene.clone(true);
    const materialsList: THREE.MeshStandardMaterial[] = [];

    root.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat) => {
              const clonedMat = (mat as THREE.MeshStandardMaterial).clone();
              materialsList.push(clonedMat);
              return clonedMat;
            });
          } else {
            const clonedMat = (mesh.material as THREE.MeshStandardMaterial).clone();
            materialsList.push(clonedMat);
            mesh.material = clonedMat;
          }
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });

    return { clonedScene: root, clonedMaterials: materialsList };
  }, [scene]);

  useEffect(() => {
    return () => {
      clonedMaterials.forEach((mat) => {
        mat.dispose();
      });
    };
  }, [clonedMaterials]);

  useEffect(() => {
    const mainHex = getColorHex(color);
    const mainColorObj = new THREE.Color(mainHex);
    const isDarkFabric = isDarkColorHex(mainHex);

    const hsl = { h: 0, s: 0, l: 0 };
    mainColorObj.getHSL(hsl);
    const ribColorObj = new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0.08, hsl.l - 0.05));
    const typographyColorObj = new THREE.Color(isDarkFabric ? '#F8FAFC' : '#18181F');

    clonedMaterials.forEach((m) => {
      const matName = (m.name || '').toLowerCase();
      m.wireframe = wireframe;

      if (matName.includes('techni_print_artwork')) {
        m.color.set('#FFFFFF');
        m.roughness = 0.42;
        m.metalness = 0.08;
      } else if (matName.includes('techni_print_typography')) {
        m.color.copy(typographyColorObj);
        m.roughness = 0.55;
        m.metalness = 0.02;
      } else if (matName.includes('ribana') || matName.includes('rib')) {
        m.color.copy(ribColorObj);
        m.roughness = 0.86;
        m.metalness = 0.02;
      } else {
        m.color.copy(mainColorObj);
        m.roughness = 0.82;
        m.metalness = 0.03;
      }

      m.needsUpdate = true;
    });
  }, [clonedMaterials, color, wireframe]);

  return (
    <group>
      <primitive object={clonedScene} scale={2.2} position={[0, 0.05, 0]} />

      {showHotspots &&
        hotspots.map((hs) => {
          const isActive = activeHotspot === hs.id;
          return (
            <Html key={hs.id} position={hs.position} center distanceFactor={10}>
              <div className="relative group z-30">
                <button
                  type="button"
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
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-9 w-60 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-purple-500/30 text-xs space-y-1 z-40 anim-fade-in pointer-events-auto">
                    <div className="font-extrabold text-purple-300 flex items-center justify-between">
                      <span>{hs.title}</span>
                      <button
                        type="button"
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
    <div className="flex flex-col items-center gap-2 font-bold text-xs text-purple-900 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-purple-200 text-center min-w-[210px]">
      <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
      <span>Wczytywanie koszulki 3D Techni...</span>
      <span className="text-[10px] text-slate-500 font-normal">Inicjalizacja materiałów i warstw nadruku</span>
    </div>
  </Html>
);

interface ViewerErrorBoundaryProps {
  fallbackImageUrl?: string;
  productTitle?: string;
  children: React.ReactNode;
}

interface ViewerErrorBoundaryState {
  hasError: boolean;
}

class ViewerErrorBoundary extends React.Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2]">
          {this.props.fallbackImageUrl ? (
            <img
              src={this.props.fallbackImageUrl}
              alt={this.props.productTitle || 'Podgląd produktu'}
              className="w-48 h-48 object-cover rounded-2xl border border-[#EBE6DD] mb-3 shadow-sm"
            />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          )}
          <p className="text-xs font-extrabold text-slate-800">
            Nie udało się załadować widoku 3D
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Wyświetlamy standardowy podgląd produktu.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface Product3DViewerProps {
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  availableColors?: string[];
  height?: string;
  autoRotateDefault?: boolean;
  modelUrl?: string;
  hotspots?: Hotspot3D[];
  fallbackImageUrl?: string;
  productTitle?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  selectedColor = 'Biała',
  onColorChange,
  availableColors = ['Biała', 'Fioletowa', 'Czarna', 'Szara'],
  height = 'h-[460px]',
  autoRotateDefault = true,
  modelUrl = '/model.glb',
  hotspots = OFFICIAL_TSHIRT_HOTSPOTS,
  fallbackImageUrl,
  productTitle,
}) => {
  const [color, setColor] = useState(selectedColor);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [wireframe, setWireframe] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<'front' | 'back' | 'free'>('free');

  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleColorSelect = (c: string) => {
    setColor(c);
    if (onColorChange) onColorChange(c);
  };

  const setCameraAngle = (view: 'front' | 'back') => {
    if (!controlsRef.current) return;
    setAutoRotate(false);
    setActiveView(view);
    const controls = controlsRef.current;
    const distance = 2.65;
    if (view === 'front') {
      controls.object.position.set(0, 0.1, distance);
    } else {
      controls.object.position.set(0, 0.1, -distance);
    }
    controls.target.set(0, 0.05, 0);
    controls.update();
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setActiveView('free');
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isFullscreen
          ? 'h-screen bg-slate-950 p-4 flex flex-col'
          : `${height} rounded-3xl overflow-hidden bg-gradient-to-b from-[#EDE9FE] via-[#FAF7F2] to-[#E2DDD3] border border-[#EBE6DD] shadow-inner`
      }`}
    >
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full border border-purple-200 shadow-xs pointer-events-auto">
          <button
            type="button"
            onClick={() => setCameraAngle('front')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'front'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-purple-50'
            }`}
          >
            Przód (Logo)
          </button>
          <button
            type="button"
            onClick={() => setCameraAngle('back')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'back'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-purple-50'
            }`}
          >
            Tył (Grafika 3D)
          </button>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E7E2D8] shadow-xs pointer-events-auto">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Kolor:
          </span>
          {availableColors.map((c) => {
            const isSelected = color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleColorSelect(c)}
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-purple-600 scale-110 shadow-sm'
                    : 'border-slate-300 hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: getColorHex(c) }}
                title={`Zmień kolor na ${c}`}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full h-full flex-1 relative">
        <ViewerErrorBoundary fallbackImageUrl={fallbackImageUrl} productTitle={productTitle}>
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.1, 2.75], fov: 44 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={1.15} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.35}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-5, 4, -6]} intensity={1.1} />
            <pointLight position={[0, 1, -3]} intensity={0.6} />

            <Suspense fallback={<LoadingFallback />}>
              <Float
                speed={autoRotate ? 1.2 : 0}
                rotationIntensity={autoRotate ? 0.1 : 0}
                floatIntensity={autoRotate ? 0.12 : 0}
              >
                <Model
                  modelUrl={modelUrl}
                  color={color}
                  wireframe={wireframe}
                  showHotspots={showHotspots}
                  hotspots={hotspots}
                  activeHotspot={activeHotspot}
                  setActiveHotspot={setActiveHotspot}
                />
              </Float>
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              minDistance={1.5}
              maxDistance={5.0}
              autoRotate={autoRotate}
              autoRotateSpeed={2.0}
              maxPolarAngle={Math.PI / 1.65}
              minPolarAngle={Math.PI / 6}
            />
          </Canvas>
        </ViewerErrorBoundary>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[10px] font-bold text-slate-600 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E7E2D8] hidden md:flex items-center space-x-1.5 pointer-events-auto">
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>Obracaj 360° • Centralny logotyp z przodu i chromowany splot 3D z tyłu</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E2D8] shadow-md pointer-events-auto ml-auto">
          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              setActiveView('free');
            }}
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
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              showHotspots
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50'
            }`}
            title="Pokaż/Ukryj punkty informacyjne"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Detale</span>
          </button>

          <button
            type="button"
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
            type="button"
            onClick={resetCamera}
            className="p-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer"
            title="Resetuj widok kamery"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
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
