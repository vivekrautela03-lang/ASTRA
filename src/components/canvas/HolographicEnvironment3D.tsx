import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ReflectiveFloorShader } from './EvaShaders';

interface HolographicEnvironment3DProps {
  entranceProgress: number;
}

export const HolographicEnvironment3D: React.FC<HolographicEnvironment3DProps> = ({ entranceProgress }) => {
  const floorMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const nodesGroupRef = useRef<THREE.Group>(null!);

  const floorMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: ReflectiveFloorShader.vertexShader,
      fragmentShader: ReflectiveFloorShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(ReflectiveFloorShader.uniforms),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((stateCtx) => {
    const time = stateCtx.clock.getElapsedTime();

    if (floorMaterialRef.current) {
      floorMaterialRef.current.uniforms.uTime.value = time;
    }

    if (nodesGroupRef.current) {
      nodesGroupRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group position={[0, -1.8, 0]}>
      {/* Reflective Ground Grid Emitter Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[16, 16, 32, 32]} />
      </mesh>

      {/* Floating Geometric Node Lattice */}
      <group ref={nodesGroupRef} position={[0, 1.5, -2]}>
        {[
          [-3, 1, -1], [3, 2, -2], [-2, -1, 1], [2.5, -0.5, -1],
          [0, 3, -3], [-3.5, -2, -2], [3.5, -1.5, -1.5]
        ].map((pos, idx) => (
          <mesh key={idx} position={pos as [number, number, number]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.3 * entranceProgress} wireframe />
          </mesh>
        ))}
      </group>

      {/* Emitter Base Rim Light Ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.6 * entranceProgress} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};
