import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { EvaState } from "../../types/eva";

export type AstraOrbState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "PROCESSING"
  | "ERROR"
  | "disabled"
  | EvaState;

export interface AstraOrbProps {
  size?: number;
  color?: string;
  state?: AstraOrbState;
  audioLevel?: number;
  interactive?: boolean;
  showStatusPill?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AstraOrb: React.FC<AstraOrbProps> = ({
  size = 460,
  color = "#00BFFF",
  state = "IDLE",
  audioLevel = 0,
  interactive = true,
  onClick,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const orbMeshRef = useRef<THREE.Mesh | null>(null);
  const audioLevelRef = useRef<number>(audioLevel);
  const stateRef = useRef<AstraOrbState>(state);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // BASE ORB COLOR
    const orbColor = new THREE.Color(color);

    // ORB GEOMETRY
    const geometry = new THREE.SphereGeometry(1.25, 128, 128);

    // ============================================
    // PROCEDURAL PLASMA FBM SHADER
    // ============================================
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: orbColor },
        uIntensity: { value: 1.8 },
        uSpeed: { value: 0.35 },
        uAudio: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uAudio;

        // Simplex / Perlin noise helpers
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
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

          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

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
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;

          float t = uTime * uSpeed;
          float displacement = snoise(position * 1.5 + vec3(t * 0.4)) * (0.08 + uAudio * 0.22);
          displacement += snoise(position * 3.2 - vec3(t * 0.8)) * (0.03 + uAudio * 0.12);

          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uSpeed;
        uniform float uAudio;

        // FBM 4 octaves
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f*f*(3.0-2.0*f);
          float n = p.x + p.y*57.0 + 113.0*p.z;
          return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                         mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
                     mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                         mix(hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
        }

        float fbm(vec3 p) {
          float f = 0.0;
          f += 0.5000 * noise(p); p = p * 2.02;
          f += 0.2500 * noise(p); p = p * 2.03;
          f += 0.1250 * noise(p); p = p * 2.01;
          f += 0.0625 * noise(p);
          return f / 0.9375;
        }

        void main() {
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = dot(viewDir, vNormal);
          fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
          float fresnelGlow = pow(fresnel, 2.5);

          float t = uTime * uSpeed * 0.5;
          vec3 p = vPosition * 2.0;

          // Multi-layer plasma energy ribbons
          float q = fbm(p + vec3(t, -t, t * 0.5));
          float r = fbm(p + 4.0 * q + vec3(0.0, t * 0.8, -t * 0.4));
          float plasma = fbm(p + 3.0 * r + vec3(-t * 0.6, 0.0, t * 0.7));

          // Color Gradient Map
          vec3 deepCore = uColor * 0.4;
          vec3 midPlasma = mix(uColor, vec3(0.38, 0.85, 1.0), plasma);
          vec3 rimHighlight = vec3(0.9, 0.98, 1.0) * fresnelGlow * 1.8;

          vec3 finalColor = mix(deepCore, midPlasma, r);
          finalColor += rimHighlight;
          finalColor *= (uIntensity + uAudio * 1.5);

          float alpha = clamp(fresnelGlow * 0.9 + plasma * 0.4 + 0.15, 0.0, 1.0);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    materialRef.current = material;

    const orb = new THREE.Mesh(geometry, material);
    orbMeshRef.current = orb;
    scene.add(orb);

    // ============================================
    // STARLIGHT PARTICLES
    // ============================================
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.45 + Math.random() * 0.95;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#63D8FF"),
      size: 0.025,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Dynamic Core Point Light
    const light = new THREE.PointLight(orbColor, 2.5, 10);
    light.position.set(0, 0, 0);
    lightRef.current = light;
    scene.add(light);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const currentAudio = audioLevelRef.current || 0;
      const currentState = String(stateRef.current).toUpperCase();

      material.uniforms.uTime.value = time;
      material.uniforms.uAudio.value = THREE.MathUtils.lerp(
        material.uniforms.uAudio.value,
        currentAudio,
        0.15
      );

      // State-specific behavior
      let targetSpeed = 0.35;
      let targetIntensity = 1.7;
      let targetColor = new THREE.Color(color);
      let targetParticleColor = new THREE.Color("#63D8FF");

      if (currentState.includes("LISTEN")) {
        targetSpeed = 0.65;
        targetIntensity = 2.2 + currentAudio * 1.5;
        targetColor = new THREE.Color("#00E5FF");
      } else if (currentState.includes("THINK") || currentState.includes("PROCESS")) {
        targetSpeed = 0.95;
        targetIntensity = 2.4;
        targetColor = new THREE.Color("#8A2BE2");
        targetParticleColor = new THREE.Color("#D8B4FE");
      } else if (currentState.includes("SPEAK")) {
        targetSpeed = 0.55;
        targetIntensity = 2.1 + currentAudio * 1.8;
        targetColor = new THREE.Color("#00BFFF");
      } else if (currentState.includes("ERROR")) {
        targetSpeed = 0.2;
        targetIntensity = 1.4;
        targetColor = new THREE.Color("#F43F5E");
        targetParticleColor = new THREE.Color("#FDA4AF");
      }

      material.uniforms.uSpeed.value = THREE.MathUtils.lerp(
        material.uniforms.uSpeed.value,
        targetSpeed,
        0.05
      );
      material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uIntensity.value,
        targetIntensity,
        0.08
      );
      material.uniforms.uColor.value.lerp(targetColor, 0.05);

      if (particlesRef.current) {
        (particlesRef.current.material as THREE.PointsMaterial).color.lerp(
          targetParticleColor,
          0.05
        );
      }

      // Smooth Organic Rotation
      orb.rotation.y = time * 0.08 * (targetSpeed / 0.35);
      orb.rotation.x = Math.sin(time * 0.2) * 0.08;

      // Particle Movement
      particles.rotation.y = time * 0.12 * (targetSpeed / 0.35);
      particles.rotation.x = time * 0.035;

      // Dynamic Breathing Light
      light.intensity =
        2.2 + Math.sin(time * 1.5) * 0.6 + currentAudio * 1.5;
      light.color.lerp(targetColor, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [size, color]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: interactive ? "pointer" : "default",
      }}
      className={`relative flex items-center justify-center select-none ${className}`}
    />
  );
};

export default AstraOrb;
