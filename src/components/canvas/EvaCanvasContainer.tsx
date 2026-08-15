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
        dpr={[1, 2]} // High-DPI support
      >
        {/* Low-Intensity Ambient Lighting for Deep Space Shadow Contrast */}
        <ambientLight intensity={0.25} color="#001122" />

        {/* Directional Sunlight Light Source Positioned Above / Front-Left casting crater rim shadows */}
        <directionalLight position={[4.5, 5.0, 4.5]} intensity={2.4} color="#00e1ff" />
        <directionalLight position={[-4.5, -3.0, -3.0]} intensity={0.6} color="#0033aa" />
        <pointLight position={[0, 0, 4.5]} intensity={1.2} color="#00ffff" />

        {/* 3D Orbit Controls — Allows User to Drag, Rotate, Pan & Zoom 3D Moon 360 Degrees */}
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
