import React, { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NebulaOrbProps, OrbState } from './types';
import { isWebGLAvailable, prefersReducedMotion } from '../../lib/audioUtils';

/**
 * 3D Nebula Inner Scene with procedural shaders, dynamic chromatic rings, and particle clouds
 */
interface NebulaSceneProps {
  state: OrbState;
  speed: number;
  colorFrom: string;
  colorTo: string;
  levelRef?: React.MutableRefObject<number>;
  reducedMotion: boolean;
}

const NebulaScene: React.FC<NebulaSceneProps> = ({
  state,
  speed,
  colorFrom,
  colorTo,
  levelRef,
  reducedMotion
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const coreMeshRef = useRef<THREE.Mesh>(null!);
  const outerRing1Ref = useRef<THREE.Mesh>(null!);
  const outerRing2Ref = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Parse custom colors into Three.js Color objects
  const statePalette = useMemo(() => {
    const from = new THREE.Color(colorFrom);
    const to = new THREE.Color(colorTo);

    let palette = {
      core: from,
      emissive: to,
      accent: new THREE.Color('#22d3ee'),
      glowIntensity: 1.0,
      rotationMult: 1.0,
      particleSpeed: 1.0
    };

    switch (state) {
      case 'connecting':
        palette = {
          core: new THREE.Color('#38bdf8'),
          emissive: new THREE.Color('#818cf8'),
          accent: new THREE.Color('#c084fc'),
          glowIntensity: 0.8,
          rotationMult: 1.4,
          particleSpeed: 1.2
        };
        break;
      case 'listening':
        palette = {
          core: new THREE.Color('#8b5cf6'),
          emissive: new THREE.Color('#d946ef'),
          accent: new THREE.Color('#06b6d4'),
          glowIntensity: 1.4,
          rotationMult: 1.8,
          particleSpeed: 1.6
        };
        break;
      case 'thinking':
        palette = {
          core: new THREE.Color('#a855f7'),
          emissive: new THREE.Color('#ec4899'),
          accent: new THREE.Color('#f59e0b'),
          glowIntensity: 1.3,
          rotationMult: 2.2,
          particleSpeed: 2.0
        };
        break;
      case 'speaking':
        palette = {
          core: new THREE.Color('#d946ef'),
          emissive: new THREE.Color('#8b5cf6'),
          accent: new THREE.Color('#38bdf8'),
          glowIntensity: 1.6,
          rotationMult: 1.5,
          particleSpeed: 1.8
        };
        break;
      case 'error':
        palette = {
          core: new THREE.Color('#f43f5e'),
          emissive: new THREE.Color('#e11d48'),
          accent: new THREE.Color('#fda4af'),
          glowIntensity: 0.9,
          rotationMult: 0.6,
          particleSpeed: 0.5
        };
        break;
      case 'disabled':
        palette = {
          core: new THREE.Color('#64748b'),
          emissive: new THREE.Color('#334155'),
          accent: new THREE.Color('#94a3b8'),
          glowIntensity: 0.2,
          rotationMult: 0.1,
          particleSpeed: 0.1
        };
        break;
      case 'idle':
      default:
        palette = {
          core: from,
          emissive: to,
          accent: new THREE.Color('#22d3ee'),
          glowIntensity: 0.9,
          rotationMult: 0.8,
          particleSpeed: 0.8
        };
        break;
    }

    return palette;
  }, [state, colorFrom, colorTo]);

  // Particle cloud generation
  const particleCount = 120;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return [pos];
  }, [particleCount]);

  useFrame((stateCtx, delta) => {
    if (reducedMotion) return;

    const time = stateCtx.clock.getElapsedTime();
    const currentAudioLevel = levelRef ? levelRef.current : 0;
    const effSpeed = speed * statePalette.rotationMult;

    // Organic floating hovering motion
    if (groupRef.current) {
      const floatY = Math.sin(time * 1.5 * effSpeed) * 0.08;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.08);

      // Audio-reactive dynamic scale
      const audioScaleMultiplier = (state === 'listening' || state === 'speaking')
        ? 1.0 + currentAudioLevel * 0.25
        : (state === 'thinking' ? 1.0 + Math.sin(time * 6) * 0.05 : 1.0);
      
      const targetScale = audioScaleMultiplier;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    }

    // Core sphere rotation
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += 0.8 * effSpeed * delta;
      coreMeshRef.current.rotation.x += 0.4 * effSpeed * delta;
    }

    // Chromatic gimbal rings
    if (outerRing1Ref.current) {
      outerRing1Ref.current.rotation.z += 1.1 * effSpeed * delta;
      outerRing1Ref.current.rotation.x = Math.sin(time * effSpeed * 0.9) * 0.4;
    }

    if (outerRing2Ref.current) {
      outerRing2Ref.current.rotation.z -= 0.9 * effSpeed * delta;
      outerRing2Ref.current.rotation.y = Math.cos(time * effSpeed * 0.8) * 0.4;
    }

    // Orbiting particle cloud
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.3 * statePalette.particleSpeed * delta;
      particlesRef.current.rotation.x = Math.sin(time * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Chromatic Nebula Core Sphere */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[1.35, 36, 36]} />
        <meshPhysicalMaterial
          color={statePalette.core}
          emissive={statePalette.emissive}
          emissiveIntensity={statePalette.glowIntensity * (state === 'speaking' ? 1.4 : 0.8)}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.35}
          ior={1.45}
        />
      </mesh>

      {/* 2. Inner Bioluminescent Plasma Halo */}
      <mesh>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial
          color={statePalette.accent}
          transparent
          opacity={state === 'disabled' ? 0.05 : 0.22}
          wireframe
        />
      </mesh>

      {/* 3. Nebula Gimbal Ring 1 */}
      <mesh ref={outerRing1Ref}>
        <torusGeometry args={[1.85, 0.022, 16, 64]} />
        <meshStandardMaterial
          color={statePalette.accent}
          emissive={statePalette.accent}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Nebula Gimbal Ring 2 */}
      <mesh ref={outerRing2Ref}>
        <torusGeometry args={[2.05, 0.018, 16, 64]} />
        <meshStandardMaterial
          color={statePalette.emissive}
          emissive={statePalette.emissive}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 5. Orbiting Starlight Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color={statePalette.accent}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

/**
 * Fallback 2D Canvas / CSS Nebula Orb when WebGL is unsupported
 */
const FallbackNebulaOrb: React.FC<{
  size: number;
  state?: OrbState;
  colorFrom: string;
  colorTo: string;
  levelRef?: React.MutableRefObject<number>;
}> = ({ size, colorFrom, colorTo, levelRef }) => {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      const audio = levelRef ? levelRef.current : 0;
      setPulse(1 + audio * 0.2);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [levelRef]);

  return (
    <div
      className="relative flex items-center justify-center rounded-full overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `scale(${pulse})`,
        transition: 'transform 0.08s ease-out'
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse"
        style={{
          background: `radial-gradient(circle at center, ${colorTo} 0%, ${colorFrom} 60%, transparent 80%)`
        }}
      />
      <div
        className="relative w-3/4 h-3/4 rounded-full shadow-[0_0_30px_rgba(217,70,239,0.5)] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`
        }}
      >
        <div className="w-1/2 h-1/2 rounded-full bg-white/20 blur-sm animate-ping" />
      </div>
    </div>
  );
};

/**
 * Main NebulaOrb Component
 */
export const NebulaOrb: React.FC<NebulaOrbProps> = ({
  state = 'idle',
  size = 184,
  speed = 1,
  colorFrom = '#8b5cf6',
  colorTo = '#d946ef',
  levelRef,
  className = '',
  onClick,
  interactive = true
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    setIsReducedMotion(prefersReducedMotion());
  }, []);

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative flex items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      role={interactive ? 'button' : 'img'}
      aria-label={`Astra Nebula Orb, state: ${state}`}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={(e) => {
        if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false
          }}
          dpr={[1, 2]}
          className="w-full h-full pointer-events-none"
        >
          <ambientLight intensity={0.7} color="#e0e7ff" />
          <directionalLight position={[3, 4, 3]} intensity={1.8} color="#c084fc" />
          <directionalLight position={[-3, -2, -2]} intensity={0.9} color="#38bdf8" />
          <pointLight position={[0, 0, 3.5]} intensity={1.2} color="#f472b6" />

          <Suspense fallback={null}>
            <NebulaScene
              state={state}
              speed={speed}
              colorFrom={colorFrom}
              colorTo={colorTo}
              levelRef={levelRef}
              reducedMotion={isReducedMotion}
            />
          </Suspense>
        </Canvas>
      ) : (
        <FallbackNebulaOrb
          size={size}
          state={state}
          colorFrom={colorFrom}
          colorTo={colorTo}
          levelRef={levelRef}
        />
      )}
    </div>
  );
};
