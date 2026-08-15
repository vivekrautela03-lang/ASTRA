import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EvaState } from '../../types/eva';

interface EvaHologram3DProps {
  state: EvaState;
  audioLevel: number;
  entranceProgress: number;
}

export const EvaHologram3D: React.FC<EvaHologram3DProps> = ({
  state,
  audioLevel,
  entranceProgress,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const chestCoreRef = useRef<THREE.Mesh>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const hudPlanesRef = useRef<THREE.Group>(null!);
  const orbRef = useRef<THREE.Mesh>(null!);
  const pedestalRef = useRef<THREE.Group>(null!);

  // 1. Generate 3D Holographic Wireframe Grid Materials
  const cyanWireframeMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00f0ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
  }, []);

  const coreGlowMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00ffff'),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
  }, []);

  const hudGlassMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00f0ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }, []);

  // Frame Render Loop (3D Animation & Action Performance)
  useFrame((stateCtx) => {
    const time = stateCtx.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle breathing posture
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.05 - 0.2;
    }

    // Pedestal Base Grid Rotation
    if (pedestalRef.current) {
      pedestalRef.current.rotation.y = time * 0.3;
    }

    // Chest Core Energy Pulse
    if (chestCoreRef.current) {
      const pulse = 1.0 + Math.sin(time * 4) * 0.2 + audioLevel * 0.5;
      chestCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Mode Action Animations
    if (state === 'thinking') {
      // Rapid core pulse & arms inward
      if (leftArmRef.current) leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.4, 0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.4, 0.1);
      if (hudPlanesRef.current) hudPlanesRef.current.visible = false;
      if (orbRef.current) orbRef.current.visible = false;
    } else if (state === 'executing') {
      // WORKING MODE: Arms forward interacting with floating 3D HUD planes
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8 + Math.sin(time * 5) * 0.05, 0.1);
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, 0.3, 0.1);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8 + Math.cos(time * 5) * 0.05, 0.1);
        rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.3, 0.1);
      }
      if (hudPlanesRef.current) {
        hudPlanesRef.current.visible = true;
        hudPlanesRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      }
      if (orbRef.current) orbRef.current.visible = false;
    } else if (state === 'speaking') {
      // EXPLANATION MODE: One arm raised holding floating 3D crystal orb
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.9, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.5, 0.1);
      }
      if (orbRef.current) {
        orbRef.current.visible = true;
        orbRef.current.rotation.y = time * 2;
        orbRef.current.position.y = 0.6 + Math.sin(time * 3) * 0.05;
      }
      if (hudPlanesRef.current) hudPlanesRef.current.visible = false;
    } else {
      // IDLE MODE: Default relaxed posture
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.2, 0.1);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2, 0.1);
      }
      if (hudPlanesRef.current) hudPlanesRef.current.visible = false;
      if (orbRef.current) orbRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={entranceProgress}>
      {/* 1. 3D CONCENTRIC NEON GRID PEDESTAL BASE */}
      <group ref={pedestalRef} position={[0, -1.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.25, 32]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 1.85, 32]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.4, 2.45, 32]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
      </group>

      {/* 2. 3D FEMALE HUMANOID WIREFRAME GRID BODY (NO 2D FACE, PURE 3D GRID MESH) */}

      {/* HEAD: Holographic Geodesic Grid Sphere */}
      <group position={[0, 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 16, 16]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>

        {/* Glowing Forehead Eye Reticle Node */}
        <mesh position={[0, 0.05, 0.36]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <primitive object={coreGlowMat} attach="material" />
        </mesh>
      </group>

      {/* NECK */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.18, 12]} />
        <primitive object={cyanWireframeMat} attach="material" />
      </mesh>

      {/* TORSO / CHEST: Holographic Wireframe Grid Cylinder */}
      <group position={[0, 0.35, 0]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.32, 0.85, 16]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>

        {/* BRIGHT GLOWING CHEST CORE REACTOR NODE */}
        <mesh ref={chestCoreRef} position={[0, 0.15, 0.38]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <primitive object={coreGlowMat} attach="material" />
        </mesh>

        {/* Orbiting Chest Energy Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 8, 32]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
      </group>

      {/* HIPS / LOWER TORSO */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.45, 16]} />
        <primitive object={cyanWireframeMat} attach="material" />
      </mesh>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.52, 0.65, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        {/* Arm Tube */}
        <mesh position={[-0.12, -0.45, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.09, 0.07, 0.8, 12]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        {/* Hand Node */}
        <mesh position={[-0.22, -0.9, 0]}>
          <octahedronGeometry args={[0.07]} />
          <primitive object={coreGlowMat} attach="material" />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.52, 0.65, 0]}>
        {/* Shoulder */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        {/* Arm Tube */}
        <mesh position={[0.12, -0.45, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.09, 0.07, 0.8, 12]} />
          <primitive object={cyanWireframeMat} attach="material" />
        </mesh>
        {/* Hand Node */}
        <mesh position={[0.22, -0.9, 0]}>
          <octahedronGeometry args={[0.07]} />
          <primitive object={coreGlowMat} attach="material" />
        </mesh>
      </group>

      {/* FLOATING 3D HUD GLASS SCREENS (ACTIVE IN WORKING MODE) */}
      <group ref={hudPlanesRef} position={[0, 0.4, 0.7]} visible={false}>
        <mesh position={[-0.6, 0, 0]} rotation={[0, 0.3, 0]}>
          <planeGeometry args={[0.7, 0.45]} />
          <primitive object={hudGlassMat} attach="material" />
        </mesh>
        <mesh position={[0.6, 0, 0]} rotation={[0, -0.3, 0]}>
          <planeGeometry args={[0.7, 0.45]} />
          <primitive object={hudGlassMat} attach="material" />
        </mesh>
      </group>

      {/* FLOATING 3D CRYSTAL ORB (ACTIVE IN EXPLANATION MODE) */}
      <mesh ref={orbRef} position={[0.6, 0.6, 0.5]} visible={false}>
        <icosahedronGeometry args={[0.14, 2]} />
        <primitive object={coreGlowMat} attach="material" />
      </mesh>
    </group>
  );
};
