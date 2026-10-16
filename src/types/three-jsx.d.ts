import * as React from 'react';

declare module '@react-three/fiber' {
  export const Canvas: React.FC<any>;
  export const useFrame: (callback: (state: any, delta: number) => void, renderPriority?: number) => void;
  export const useThree: (selector?: (state: any) => any) => any;
  export const useLoader: (loader: any, input: any, extensions?: any) => any;
  export const extend: (objects: any) => void;
  export type ThreeElements = Record<string, any>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      mesh: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      [elemName: string]: any;
    }
  }
}
