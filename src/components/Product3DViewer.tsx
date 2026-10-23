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

interface ModelProps {
  color: string;
  wireframe: boolean;
  showHotspots: boolean;
  activeHotspot: number | null;
  setActiveHotspot: (id: number | null) => void;
}

const createShirtTexture = (
  baseImage: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  hexColor: string
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  const width = baseImage.width || 2048;
  const height = baseImage.height || 2048;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.flipY = false;
    return fallback;
  }

  ctx.drawImage(baseImage as CanvasImageSource, 0, 0, width, height);

  const targetColor = new THREE.Color(hexColor);
  const tr = Math.round(targetColor.r * 255);
  const tg = Math.round(targetColor.g * 255);
  const tb = Math.round(targetColor.b * 255);

  const isWhiteShirt = tr > 245 && tg > 245 && tb > 245;
  const isDarkShirt = (tr * 0.299 + tg * 0.587 + tb * 0.114) < 110;

  if (!isWhiteShirt) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 244 && g > 244 && b > 244) {
        data[i] = tr;
        data[i + 1] = tg;
        data[i + 2] = tb;
      } else if (isDarkShirt && r < 55 && g < 55 && b < 55) {
        const y = Math.floor((i / 4) / width);
        const x = (i / 4) % width;
        const normX = x / width;
        const normY = y / height;

        const isFrontLogoText = normX > 0.16 && normX < 0.30 && normY > 0.72 && normY < 0.80;
        const isBackHeaderOrFooterText =
          (normX > 0.48 && normX < 0.68 && normY > 0.67 && normY < 0.71) ||
          (normX > 0.48 && normX < 0.68 && normY > 0.88 && normY < 0.93);

        if (isFrontLogoText || isBackHeaderOrFooterText) {
          data[i] = 248;
          data[i + 1] = 250;
          data[i + 2] = 252;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const Model: React.FC<ModelProps> = ({
  color,
  wireframe,
  showHotspots,
  activeHotspot,
  setActiveHotspot,
}) => {
  const { scene } = useGLTF('/model.glb');
  const clonedScene = React.useMemo(() => scene.clone(true), [scene]);
  const originalBaseImageRef = useRef<HTMLImageElement | HTMLCanvasElement | ImageBitmap | null>(null);

  useEffect(() => {
    const mainHex = getColorHex(color);
    const mainColorObj = new THREE.Color(mainHex);

    const hsl = { h: 0, s: 0, l: 0 };
    mainColorObj.getHSL(hsl);
    const ribColorObj = new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0.08, hsl.l - 0.06));

    clonedScene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const newMaterials = materials.map((mat) => {
            const m = (mat as THREE.MeshStandardMaterial).clone();
            m.wireframe = wireframe;

            const matName = (m.name || '').toLowerCase();
            if (m.map && m.map.image && !originalBaseImageRef.current) {
              originalBaseImageRef.current = m.map.image;
            }

            if (originalBaseImageRef.current && (matName.includes('jersey') || matName.includes('front_2708') || m.map)) {
              m.map = createShirtTexture(originalBaseImageRef.current, mainHex);
              m.color = new THREE.Color('#FFFFFF');
            } else if (matName.includes('ribana') || matName.includes('rib')) {
              m.color = ribColorObj;
            } else {
              m.color = mainColorObj;
            }

            m.roughness = 0.55;
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
      position: [-0.22, 0.42, 0.24] as [number, number, number],
      title: 'Logotyp Techni Zdalni (Przód)',
      desc: 'Oficjalny nadruk na lewej piersi wykonany trwałą metodą sitodruku HD.',
    },
    {
      id: 2,
      position: [0, 0.32, -0.26] as [number, number, number],
      title: 'Grafika 3D "School that makes a difference"',
      desc: 'Duży nadruk na plecach z metalicznym splotem 3D oraz sygnaturą Technikum i Liceum.',
    },
    {
      id: 3,
      position: [0, 0.88, 0.08] as [number, number, number],
      title: 'Wzmocniony Kołnierz Ribana',
      desc: 'Elastyczny ściągacz z dodatkiem elastanu utrzymujący idealny kształt przy szyi.',
    },
    {
      id: 4,
      position: [0.62, 0.35, 0.0] as [number, number, number],
      title: 'Bawełna Czesana 100% Jersey',
      desc: 'Miękka, przewiewna dzianina o podwyższonej gramaturze odporna na wielokrotne pranie.',
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
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-9 w-60 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-purple-500/30 text-xs space-y-1 z-40 anim-fade-in pointer-events-auto">
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
    <div className="flex flex-col items-center gap-2 font-bold text-xs text-purple-900 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-purple-200 text-center min-w-[210px]">
      <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
      <span>Wczytywanie koszulki 3D Techni...</span>
      <span className="text-[10px] text-slate-500 font-normal">Renderowanie tekstur i nadruków HD</span>
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
  selectedColor = 'Biała',
  onColorChange,
  availableColors = ['Biała', 'Fioletowa', 'Czarna', 'Szara'],
  height = 'h-[460px]',
  autoRotateDefault = true,
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

  const handleColorSelect = (c: string) => {
    setColor(c);
    if (onColorChange) onColorChange(c);
  };

  const setCameraAngle = (view: 'front' | 'back') => {
    if (!controlsRef.current) return;
    setAutoRotate(false);
    setActiveView(view);
    const controls = controlsRef.current;
    const distance = 2.8;
    if (view === 'front') {
      controls.object.position.set(0, 0.1, distance);
    } else {
      controls.object.position.set(0, 0.1, -distance);
    }
    controls.target.set(0, 0, 0);
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
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen bg-slate-950 p-4 flex flex-col' : `${height} rounded-3xl overflow-hidden bg-gradient-to-b from-[#EDE9FE] via-[#FAF7F2] to-[#E2DDD3] border border-[#EBE6DD] shadow-inner`}`}
    >
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full border border-purple-200 shadow-xs pointer-events-auto">
          <button
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
          camera={{ position: [0, 0.1, 3.0], fov: 45 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
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
            <Center top>
              <Float speed={autoRotate ? 1.4 : 0} rotationIntensity={autoRotate ? 0.15 : 0} floatIntensity={autoRotate ? 0.15 : 0}>
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
            minDistance={1.6}
            maxDistance={5.5}
            autoRotate={autoRotate}
            autoRotateSpeed={2.2}
            maxPolarAngle={Math.PI / 1.65}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-[10px] font-bold text-slate-600 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E7E2D8] hidden md:flex items-center space-x-1.5 pointer-events-auto">
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>Obracaj 360° • Zobacz nadruk z przodu i chromowany splot z tyłu</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E2D8] shadow-md pointer-events-auto ml-auto">
          <button
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
