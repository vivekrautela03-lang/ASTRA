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

    // ORB SHADER MATERIAL
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: orbColor },
        uIntensity: { value: 1.7 },
        uSpeed: { value: 0.35 },
        uAudio: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uSpeed;
        uniform float uAudio;

        varying vec3 vPosition;
        varying vec3 vNormal;

        // 3D HASH
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.1));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        // 3D NOISE
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          return mix(
            mix(
              mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
              mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
              f.y
            ),
            mix(
              mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
              mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x),
              f.y
            ),
            f.z
          );
        }

        // FRACTAL BROWNIAN MOTION
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          float time = uTime * uSpeed;
          vec3 p = normalize(vPosition);

          // LARGE FLOWING ENERGY
          vec3 flow = p * 2.4;
          flow.x += sin(time * 0.7) * 0.7;
          flow.y += cos(time * 0.45) * 0.8;
          flow.z += time * 0.35;
          float large = fbm(flow);

          // SMALL ENERGY DETAILS
          vec3 detailPosition = p * (7.0 + uAudio * 3.0);
          detailPosition.x += time * 0.25;
          detailPosition.y -= time * 0.18;
          detailPosition.z += time * 0.35;
          float detail = fbm(detailPosition);

          // COMBINE
          float energy = large * 0.75 + detail * 0.35;

          // THIN ENERGY RIBBONS
          energy = smoothstep(0.48 - uAudio * 0.1, 0.70 + uAudio * 0.05, energy);

          // FRESNEL EDGE
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDirection), 0.0), 3.5);

          // INNER CORE
          float core = pow(max(0.0, 1.0 - length(vPosition)), 2.0);

          // FINAL ENERGY BRIGHTNESS
          float brightness = energy * (2.0 + uAudio * 1.5) + fresnel * 0.65 + core * (0.25 + uAudio * 0.4);

          // BLUE BASE
          vec3 finalColor = uColor * brightness * uIntensity;

          // CYAN HIGHLIGHTS
          vec3 cyan = vec3(0.15, 0.75, 1.0);
          finalColor += cyan * pow(energy, 3.5) * (1.8 + uAudio * 1.2);

          // EDGE GLOW
          finalColor += uColor * fresnel * 0.8;

          // ALPHA
          float alpha = brightness * 0.85;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
    materialRef.current = material;

    // CREATE ORB MESH
    const orb = new THREE.Mesh(geometry, material);
    orbMeshRef.current = orb;
    scene.add(orb);

    // 400 STARLIGHT PARTICLES
    const particleCount = 400;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x63d8ff,
      size: 0.018,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // INNER LIGHT
    const light = new THREE.PointLight(0x00bfff, 2.5, 6);
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

      // Smooth Rotation
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
        position: "relative",
        cursor: interactive ? "pointer" : "default",
      }}
      className={`select-none ${className}`}
      role="img"
      aria-label={`ASTRA Living AI Energy Orb - Status: ${state}`}
    />
  );
};

export default AstraOrb;
