import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
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
  AlertTriangle,
} from 'lucide-react';
import { Hotspot3D, DEFAULT_APPAREL_HOTSPOTS } from '../config/model3dConfig';

export const getColorHex = (colorName?: string): string => {
  if (!colorName) return '#6D28D9';
  const c = colorName.toLowerCase();
  if (c.includes('fiolet') || c.includes('purple')) return '#6D28D9';
  if (c.includes('czarn') || c.includes('black')) return '#18181B';
  if (c.includes('biał') || c.includes('white')) return '#F8FAFC';
  if (c.includes('szar') || c.includes('gray') || c.includes('grey')) return '#94A3B8';
  if (c.includes('czerwon') || c.includes('red')) return '#DC2626';
  if (c.includes('niebiesk') || c.includes('blue')) return '#2563EB';
  if (c.includes('zielon') || c.includes('green')) return '#059669';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#6D28D9';
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
    const targetColor = new THREE.Color(getColorHex(color));
    clonedMaterials.forEach((m) => {
      m.color.copy(targetColor);
      m.wireframe = wireframe;
      m.roughness = 0.55;
      m.metalness = 0.08;
      m.needsUpdate = true;
    });
  }, [clonedMaterials, color, wireframe]);

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
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-9 w-56 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-purple-500/30 text-xs space-y-1 z-40 anim-fade-in pointer-events-auto">
                    <div className="font-extrabold text-purple-300 flex items-center justify-between">
                      <span>{hs.title}</span>
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        className="text-slate-400 hover:text-white text-[10px]"
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
    <div className="flex flex-col items-center gap-2 font-bold text-xs text-purple-800 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-purple-200 whitespace-nowrap">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      <span>Ładowanie modelu 3D...</span>
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
  selectedColor = 'Fioletowa',
  onColorChange,
  availableColors = ['Fioletowa', 'Czarna', 'Biała', 'Szara'],
  height = 'h-[450px]',
  autoRotateDefault = true,
  modelUrl = '/model.glb',
  hotspots = DEFAULT_APPAREL_HOTSPOTS,
  fallbackImageUrl,
  productTitle,
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

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
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
        <div className="inline-flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-200 shadow-xs pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span className="text-[11px] font-black text-purple-900 uppercase tracking-wider">
            Interaktywne Studio 3D (360°)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E7E2D8] shadow-xs pointer-events-auto">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">
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
                title={`Zmień kolor 3D na: ${c}`}
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
            camera={{ position: [0, 0.2, 3.2], fov: 45 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.5}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-5, 3, -5]} intensity={0.6} color="#C4B5FD" />
            <pointLight position={[0, -2, 2]} intensity={0.4} />

            <Suspense fallback={<LoadingFallback />}>
              <Center top>
                <Float
                  speed={autoRotate ? 1.5 : 0}
                  rotationIntensity={autoRotate ? 0.2 : 0}
                  floatIntensity={autoRotate ? 0.2 : 0}
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
        </ViewerErrorBoundary>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[10px] font-bold text-slate-600 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E7E2D8] hidden sm:block pointer-events-auto">
          Przeciągnij myszką, aby obrócić • Rolka przybliża • Kliknij znaczniki ✨
        </div>

        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E2D8] shadow-md pointer-events-auto ml-auto">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              autoRotate
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
            title={autoRotate ? 'Zatrzymaj automatyczną rotację' : 'Włącz automatyczną rotację'}
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden md:inline">Auto-Rotacja</span>
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
            <span className="hidden md:inline">Detale</span>
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
            <span className="hidden md:inline">Siatka</span>
          </button>

          <button
            type="button"
            onClick={resetCamera}
            className="p-2 rounded-xl text-xs font-bold bg-[#FAF7F2] text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-pointer"
            title="Resetuj kamerę"
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
