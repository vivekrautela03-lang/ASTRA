import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EvaState } from '../../types/eva';

interface EvaMoon3DProps {
  state: EvaState;
  audioLevel: number;
  entranceProgress?: number;
}

// 1. Golden Mechanical Orb Vertex Shader
const GoldenOrbVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uDistortion;

  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float noise = snoise(position * 1.5 + vec3(uTime * 0.8));
    vec3 newPos = position + normal * noise * uDistortion;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

// 2. Golden Mechanical Metallic Fragment Shader
const GoldenOrbFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorGold;
  uniform vec3 uColorBronze;
  uniform vec3 uColorAmber;
  uniform vec3 uColorGlow;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.5);

    float swirl1 = sin(vWorldPosition.x * 2.5 + uTime * 1.8) * cos(vWorldPosition.y * 2.5 + uTime * 1.4);
    float swirl2 = cos(vWorldPosition.z * 3.0 + uTime * 2.0);

    vec3 goldenColor = mix(uColorGold, uColorBronze, 0.5 + 0.5 * swirl1);
    goldenColor = mix(goldenColor, uColorAmber, 0.5 + 0.5 * swirl2);
    goldenColor = mix(goldenColor, uColorGlow, fresnel);

    vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
    float spec = pow(max(0.0, dot(reflect(-lightDir, normal), viewDir)), 16.0);
    vec3 finalColor = goldenColor + vec3(spec * 0.5);

    gl_FragColor = vec4(finalColor, min(1.0, fresnel * 1.2 + 0.78) * uIntensity);
  }
`;

export const EvaMoon3D: React.FC<EvaMoon3DProps> = ({
  state,
  audioLevel,
  entranceProgress = 1.0,
}) => {
  const orbGroupRef = useRef<THREE.Group>(null!);
  const goldenOrbMeshRef = useRef<THREE.Mesh>(null!);
  const goldenMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  const mechanicalRing1Ref = useRef<THREE.Mesh>(null!);
  const mechanicalRing2Ref = useRef<THREE.Mesh>(null!);
  const mechanicalRing3Ref = useRef<THREE.Mesh>(null!);

  const stateConfig = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          distortion: 0.18,
          intensity: 1.1,
          rotSpeed: 0.8,
          colorGold: new THREE.Color('#f59e0b'),
          colorBronze: new THREE.Color('#d97706'),
          colorAmber: new THREE.Color('#fbbf24'),
          colorGlow: new THREE.Color('#38bdf8')
        };
      case 'thinking':
        return {
          distortion: 0.28,
          intensity: 1.25,
          rotSpeed: 1.5,
          colorGold: new THREE.Color('#fbbf24'),
          colorBronze: new THREE.Color('#b45309'),
          colorAmber: new THREE.Color('#fef08a'),
          colorGlow: new THREE.Color('#a855f7')
        };
      case 'speaking':
        return {
          distortion: 0.22,
          intensity: 1.2,
          rotSpeed: 1.1,
          colorGold: new THREE.Color('#f59e0b'),
          colorBronze: new THREE.Color('#d97706'),
          colorAmber: new THREE.Color('#fef08a'),
          colorGlow: new THREE.Color('#fbbf24')
        };
      case 'idle':
      default:
        return {
          distortion: 0.10,
          intensity: 0.9,
          rotSpeed: 0.3,
          colorGold: new THREE.Color('#d97706'),
          colorBronze: new THREE.Color('#b45309'),
          colorAmber: new THREE.Color('#f59e0b'),
          colorGlow: new THREE.Color('#fbbf24')
        };
    }
  }, [state]);

  useFrame((stateCtx, delta) => {
    const time = stateCtx.clock.getElapsedTime();
    const { distortion, intensity, rotSpeed, colorGold, colorBronze, colorAmber, colorGlow } = stateConfig;

    if (orbGroupRef.current) {
      const floatY = Math.sin(time * 1.6) * 0.12;
      orbGroupRef.current.position.y = THREE.MathUtils.lerp(orbGroupRef.current.position.y, floatY, 0.05);

      const audioPulse = state === 'speaking' ? 1.0 + audioLevel * 0.22 : 1.0;
      const targetScale = entranceProgress * audioPulse;
      orbGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (goldenOrbMeshRef.current) {
      goldenOrbMeshRef.current.rotation.y += rotSpeed * delta;
      goldenOrbMeshRef.current.rotation.z += (rotSpeed * 0.5) * delta;
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

    if (goldenMaterialRef.current) {
      goldenMaterialRef.current.uniforms.uTime.value = time;

      const currentDistortion = goldenMaterialRef.current.uniforms.uDistortion.value;
      const targetDistortion = distortion + (state === 'speaking' ? audioLevel * 0.18 : 0);
      goldenMaterialRef.current.uniforms.uDistortion.value = THREE.MathUtils.lerp(currentDistortion, targetDistortion, 0.05);

      const currentIntensity = goldenMaterialRef.current.uniforms.uIntensity.value;
      goldenMaterialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(currentIntensity, intensity, 0.05);

      goldenMaterialRef.current.uniforms.uColorGold.value.lerp(colorGold, 0.05);
      goldenMaterialRef.current.uniforms.uColorBronze.value.lerp(colorBronze, 0.05);
      goldenMaterialRef.current.uniforms.uColorAmber.value.lerp(colorAmber, 0.05);
      goldenMaterialRef.current.uniforms.uColorGlow.value.lerp(colorGlow, 0.05);
    }
  });

  return (
    <group ref={orbGroupRef} position={[0, 0.1, 0]}>
      {/* GOLDEN MECHANICAL ORB CORE */}
      <mesh ref={goldenOrbMeshRef}>
        <icosahedronGeometry args={[1.75, 64]} />
        <shaderMaterial
          ref={goldenMaterialRef}
          vertexShader={GoldenOrbVertexShader}
          fragmentShader={GoldenOrbFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uDistortion: { value: 0.10 },
            uIntensity: { value: 0.9 },
            uColorGold: { value: new THREE.Color('#d97706') },
            uColorBronze: { value: new THREE.Color('#b45309') },
            uColorAmber: { value: new THREE.Color('#f59e0b') },
            uColorGlow: { value: new THREE.Color('#fbbf24') }
          }}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* GOLDEN MECHANICAL CHAKRA RINGS */}
      <mesh ref={mechanicalRing1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.05, 0.02, 16, 100]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.75} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={mechanicalRing2Ref} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.25, 0.015, 16, 100]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={mechanicalRing3Ref} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[2.4, 2.44, 64]} />
        <meshBasicMaterial color="#d97706" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};
