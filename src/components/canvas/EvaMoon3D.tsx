import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EvaState } from '../../types/eva';

interface EvaMoon3DProps {
  state: EvaState;
  audioLevel: number;
  entranceProgress?: number;
}

// 1. Apple Intelligence Siri Liquid Morphing Vertex Shader
const AppleSiriOrbVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uDistortion;

  // Simplex-style 3D Perlin Noise for Liquid Morphing
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
    
    // Liquid morph displacement offset
    float noise = snoise(position * 1.5 + vec3(uTime * 0.8));
    vec3 newPos = position + normal * noise * uDistortion;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

// 2. Apple Intelligence Iridescent Siri Colors Fragment Shader
const AppleSiriOrbFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorBlue;
  uniform vec3 uColorPurple;
  uniform vec3 uColorMagenta;
  uniform vec3 uColorCyan;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel Glass Rim Light
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.5);

    // Organic Siri Fluid RGB Color Swirl
    float swirl1 = sin(vWorldPosition.x * 2.5 + uTime * 1.8) * cos(vWorldPosition.y * 2.5 + uTime * 1.4);
    float swirl2 = cos(vWorldPosition.z * 3.0 + uTime * 2.0);

    vec3 liquidColor = mix(uColorBlue, uColorPurple, 0.5 + 0.5 * swirl1);
    liquidColor = mix(liquidColor, uColorMagenta, 0.5 + 0.5 * swirl2);
    liquidColor = mix(liquidColor, uColorCyan, fresnel);

    // Inner Glass Glow Specular Sparkle
    vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
    float spec = pow(max(0.0, dot(reflect(-lightDir, normal), viewDir)), 16.0);
    vec3 finalColor = liquidColor + vec3(spec * 0.4);

    gl_FragColor = vec4(finalColor, min(1.0, fresnel * 1.2 + 0.75) * uIntensity);
  }
`;

export const EvaMoon3D: React.FC<EvaMoon3DProps> = ({
  state,
  audioLevel,
  entranceProgress = 1.0,
}) => {
  const orbGroupRef = useRef<THREE.Group>(null!);
  const siriOrbMeshRef = useRef<THREE.Mesh>(null!);
  const siriMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  const auraRing1Ref = useRef<THREE.Mesh>(null!);
  const auraRing2Ref = useRef<THREE.Mesh>(null!);
  const auraRing3Ref = useRef<THREE.Mesh>(null!);

  // Apple Siri Iridescent Color Palette per State
  const stateConfig = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          distortion: 0.18,
          intensity: 1.0,
          colorBlue: new THREE.Color('#3b82f6'),
          colorPurple: new THREE.Color('#a855f7'),
          colorMagenta: new THREE.Color('#f43f5e'),
          colorCyan: new THREE.Color('#38bdf8')
        };
      case 'thinking':
        return {
          distortion: 0.28,
          intensity: 1.25,
          colorBlue: new THREE.Color('#8b5cf6'),
          colorPurple: new THREE.Color('#ec4899'),
          colorMagenta: new THREE.Color('#f43f5e'),
          colorCyan: new THREE.Color('#06b6d4')
        };
      case 'speaking':
        return {
          distortion: 0.22,
          intensity: 1.15,
          colorBlue: new THREE.Color('#06b6d4'),
          colorPurple: new THREE.Color('#3b82f6'),
          colorMagenta: new THREE.Color('#c084fc'),
          colorCyan: new THREE.Color('#60a5fa')
        };
      case 'idle':
      default:
        return {
          distortion: 0.10,
          intensity: 0.85,
          colorBlue: new THREE.Color('#3b82f6'),
          colorPurple: new THREE.Color('#8b5cf6'),
          colorMagenta: new THREE.Color('#ec4899'),
          colorCyan: new THREE.Color('#38bdf8')
        };
    }
  }, [state]);

  // Render Loop
  useFrame((stateCtx, delta) => {
    const time = stateCtx.clock.getElapsedTime();
    const { distortion, intensity, colorBlue, colorPurple, colorMagenta, colorCyan } = stateConfig;

    // 1. APPLE SIRI ORB: Floating Physics & Scale Lerp
    if (orbGroupRef.current) {
      const floatY = Math.sin(time * 1.6) * 0.12;
      orbGroupRef.current.position.y = THREE.MathUtils.lerp(orbGroupRef.current.position.y, floatY, 0.05);

      const audioPulse = state === 'speaking' ? 1.0 + audioLevel * 0.18 : 1.0;
      const targetScale = entranceProgress * audioPulse;
      orbGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (siriOrbMeshRef.current) {
      siriOrbMeshRef.current.rotation.y += 0.2 * delta;
      siriOrbMeshRef.current.rotation.z += 0.1 * delta;
    }

    // Shader Uniform Updates
    if (siriMaterialRef.current) {
      siriMaterialRef.current.uniforms.uTime.value = time;
      
      const currentDistortion = siriMaterialRef.current.uniforms.uDistortion.value;
      const targetDistortion = distortion + (state === 'speaking' ? audioLevel * 0.15 : 0);
      siriMaterialRef.current.uniforms.uDistortion.value = THREE.MathUtils.lerp(currentDistortion, targetDistortion, 0.05);

      const currentIntensity = siriMaterialRef.current.uniforms.uIntensity.value;
      siriMaterialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(currentIntensity, intensity, 0.05);

      siriMaterialRef.current.uniforms.uColorBlue.value.lerp(colorBlue, 0.05);
      siriMaterialRef.current.uniforms.uColorPurple.value.lerp(colorPurple, 0.05);
      siriMaterialRef.current.uniforms.uColorMagenta.value.lerp(colorMagenta, 0.05);
      siriMaterialRef.current.uniforms.uColorCyan.value.lerp(colorCyan, 0.05);
    }

    // 2. SIRI EXPANDING LIQUID WAVE PULSES
    const animatePulse = (mesh: THREE.Mesh | null, timeOffset: number) => {
      if (!mesh) return;
      const cycle = ((time + timeOffset) * 1.5) % 2.5;
      const scaleProgress = 1.0 + (cycle / 2.5) * 1.6;
      const alpha = Math.max(0, 1.0 - cycle / 2.5);

      mesh.scale.set(scaleProgress, scaleProgress, scaleProgress);
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha * 0.45;
    };

    animatePulse(auraRing1Ref.current, 0);
    animatePulse(auraRing2Ref.current, 0.8);
    animatePulse(auraRing3Ref.current, 1.6);
  });

  return (
    <group ref={orbGroupRef} position={[0, 0.1, 0]}>
      {/* AUTHENTIC APPLE INTELLIGENCE 3D SIRI LIQUID GLASS ORB */}
      <mesh ref={siriOrbMeshRef}>
        <icosahedronGeometry args={[1.75, 64]} />
        <shaderMaterial
          ref={siriMaterialRef}
          vertexShader={AppleSiriOrbVertexShader}
          fragmentShader={AppleSiriOrbFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uDistortion: { value: 0.10 },
            uIntensity: { value: 0.85 },
            uColorBlue: { value: new THREE.Color('#3b82f6') },
            uColorPurple: { value: new THREE.Color('#8b5cf6') },
            uColorMagenta: { value: new THREE.Color('#ec4899') },
            uColorCyan: { value: new THREE.Color('#38bdf8') }
          }}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* APPLE SIRI EXPANDING AURA PULSE RINGS */}
      <mesh ref={auraRing1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.78, 1.82, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={auraRing2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.78, 1.82, 64]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={auraRing3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.78, 1.82, 64]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};
