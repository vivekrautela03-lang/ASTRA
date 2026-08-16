import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EvaMoon3D } from './EvaMoon3D';
import type { EvaState } from '../../types/eva';

interface EvaCanvasContainerProps {
  state: EvaState;
  audioLevel: number;
  entranceProgress?: number;
  scrollProgress?: number;
}

export const EvaCanvasContainer: React.FC<EvaCanvasContainerProps> = ({
  state,
  audioLevel,
  entranceProgress = 1.0,
}) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}
      >
        {/* Warm Cinematic Ambient Lighting */}
        <ambientLight intensity={0.6} color="#fbbf24" />

        {/* Key Directional Golden Light Source */}
        <directionalLight position={[4.5, 5.0, 4.5]} intensity={2.2} color="#f59e0b" />
        <directionalLight position={[-4.5, -3.0, -3.0]} intensity={0.8} color="#b45309" />
        <pointLight position={[0, 0, 4.5]} intensity={1.5} color="#fef08a" />

        {/* 3D Orbit Controls */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          enableRotate={true}
          autoRotate={false}
          maxDistance={12}
          minDistance={3}
        />

        <Suspense fallback={null}>
          <EvaMoon3D
            state={state}
            audioLevel={audioLevel}
            entranceProgress={entranceProgress}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
