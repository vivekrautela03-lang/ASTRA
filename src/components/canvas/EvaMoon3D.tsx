import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EvaState } from '../../types/eva';

interface EvaMoon3DProps {
  state: EvaState;
  audioLevel: number;
  entranceProgress?: number;
}

export const EvaMoon3D: React.FC<EvaMoon3DProps> = ({
  state,
  audioLevel,
  entranceProgress = 1.0,
}) => {
  const orbGroupRef = useRef<THREE.Group>(null!);
  const goldenCoreRef = useRef<THREE.Mesh>(null!);

  const mechanicalRing1Ref = useRef<THREE.Mesh>(null!);
  const mechanicalRing2Ref = useRef<THREE.Mesh>(null!);
  const mechanicalRing3Ref = useRef<THREE.Mesh>(null!);

  const stateColors = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          coreColor: '#f59e0b',
          emissiveColor: '#d97706',
          ringColor: '#38bdf8',
          rotSpeed: 1.2
        };
      case 'thinking':
        return {
          coreColor: '#fbbf24',
          emissiveColor: '#b45309',
          ringColor: '#c084fc',
          rotSpeed: 1.8
        };
      case 'speaking':
        return {
          coreColor: '#fef08a',
          emissiveColor: '#f59e0b',
          ringColor: '#fbbf24',
          rotSpeed: 1.4
        };
      case 'idle':
      default:
        return {
          coreColor: '#f59e0b',
          emissiveColor: '#78350f',
          ringColor: '#fbbf24',
          rotSpeed: 0.5
        };
    }
  }, [state]);

  useFrame((stateCtx, delta) => {
    const time = stateCtx.clock.getElapsedTime();
    const { rotSpeed } = stateColors;

    if (orbGroupRef.current) {
      const floatY = Math.sin(time * 1.6) * 0.12;
      orbGroupRef.current.position.y = THREE.MathUtils.lerp(orbGroupRef.current.position.y, floatY, 0.05);

      const audioPulse = state === 'speaking' ? 1.0 + audioLevel * 0.18 : 1.0;
      const targetScale = entranceProgress * audioPulse;
      orbGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (goldenCoreRef.current) {
      goldenCoreRef.current.rotation.y += rotSpeed * delta;
      goldenCoreRef.current.rotation.x += (rotSpeed * 0.4) * delta;
    }

    // Mechanical Chakra Ring Rotations
    if (mechanicalRing1Ref.current) {
      mechanicalRing1Ref.current.rotation.z += (rotSpeed * 1.2) * delta;
      mechanicalRing1Ref.current.rotation.x = Math.sin(time * 0.8) * 0.3;
    }
    if (mechanicalRing2Ref.current) {
      mechanicalRing2Ref.current.rotation.z -= (rotSpeed * 0.9) * delta;
      mechanicalRing2Ref.current.rotation.y = Math.cos(time * 0.8) * 0.3;
    }
    if (mechanicalRing3Ref.current) {
      mechanicalRing3Ref.current.rotation.z += (rotSpeed * 1.5) * delta;
    }
  });

  return (
    <group ref={orbGroupRef} position={[0, 0, 0]}>
      {/* 1. GOLDEN MECHANICAL CORE SPHERE */}
      <mesh ref={goldenCoreRef}>
        <icosahedronGeometry args={[1.65, 4]} />
        <meshStandardMaterial
          color={stateColors.coreColor}
          emissive={stateColors.emissiveColor}
          emissiveIntensity={state === 'speaking' ? 0.6 : 0.25}
          roughness={0.18}
          metalness={0.92}
          wireframe={false}
        />
      </mesh>

      {/* 2. INNER WIREFRAME ENERGY CAGE */}
      <mesh scale={[1.72, 1.72, 1.72]}>
        <icosahedronGeometry args={[1.65, 2]} />
        <meshBasicMaterial
          color={stateColors.ringColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 3. GOLDEN MECHANICAL CHAKRA RINGS */}
      <mesh ref={mechanicalRing1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.05, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      <mesh ref={mechanicalRing2Ref} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.25, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#b45309"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      <mesh ref={mechanicalRing3Ref} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[2.4, 2.45, 64]} />
        <meshBasicMaterial
          color={stateColors.ringColor}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
