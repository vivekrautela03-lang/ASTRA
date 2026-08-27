import { useEffect, useRef } from "react";
import * as THREE from "three";

export type AstraOrbState =
  | "IDLE"
  | "WAKING"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "PROCESSING"
  | "ERROR";

export interface AstraOrbProps {
  size?: number;
  color?: string;
  state?: AstraOrbState | string;
  audioLevel?: number;
  interactive?: boolean;
  showStatusPill?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function AstraOrb({
  size = 500,
  color = "#00BFFF",
  state = "IDLE",
  audioLevel = 0,
  onClick,
  className = ""
}: AstraOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioLevelRef = useRef<number>(audioLevel);
  const stateRef = useRef<AstraOrbState | string>(state);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ============================================
    // SCENE
    // ============================================

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

    camera.position.set(0, 0, 4);

    // ============================================
    // RENDERER
    // ============================================

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // ============================================
    // COLORS
    // ============================================

    const orbColor = new THREE.Color(color);

    // ============================================
    // ORB GEOMETRY
    // ============================================

    const geometry = new THREE.SphereGeometry(
      1.25,
      128,
      128
    );

    // ============================================
    // ORB SHADER
    // ============================================

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: {
          value: 0,
        },
        uColor: {
          value: orbColor,
        },
        uIntensity: {
          value: 1.7,
        },
        uSpeed: {
          value: 0.35,
        },
        uAudio: {
          value: 0.0,
        }
      },

      // ==========================================
      // VERTEX SHADER
      // ==========================================

      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      // ==========================================
      // FRAGMENT SHADER
      // ==========================================

      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uSpeed;
        uniform float uAudio;

        varying vec3 vPosition;
        varying vec3 vNormal;

        // ========================================
        // HASH
        // ========================================

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.1));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        // ========================================
        // 3D NOISE
        // ========================================

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          return mix(
            mix(
              mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x),
              f.y
            ),
            mix(
              mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x),
              f.y
            ),
            f.z
          );
        }

        // ========================================
        // FRACTAL BROWNIAN MOTION (6 OCTAVES)
        // ========================================

        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          vec3 shift = vec3(100.0);

          for (int i = 0; i < 6; ++i) {
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        // ========================================
        // MAIN
        // ========================================

        void main() {
          float time = uTime * uSpeed;
          vec3 p = normalize(vPosition);

          // --------------------------------------
          // LARGE FLOWING ENERGY
          // --------------------------------------

          vec3 flow = p * 2.4;
          flow.x += sin(time * 0.7) * 0.7;
          flow.y += cos(time * 0.45) * 0.8;
          flow.z += time * 0.35;

          float large = fbm(flow);

          // --------------------------------------
          // SMALL ENERGY DETAILS
          // --------------------------------------

          vec3 detailPosition = p * 7.0;
          detailPosition.x += time * 0.25;
          detailPosition.y -= time * 0.18;
          detailPosition.z += time * 0.35;

          float detail = fbm(detailPosition);

          // --------------------------------------
          // COMBINE
          // --------------------------------------

          float energy = large * 0.75 + detail * 0.35;

          // --------------------------------------
          // THIN ENERGY RIBBONS
          // --------------------------------------

          energy = smoothstep(0.48, 0.70, energy);

          // --------------------------------------
          // FRESNEL EDGE
          // --------------------------------------

          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(
            1.0 - max(dot(normalize(vNormal), viewDirection), 0.0),
            3.5
          );

          // --------------------------------------
          // INNER CORE
          // --------------------------------------

          float core = pow(
            max(0.0, 1.0 - length(vPosition)),
            2.0
          );

          // --------------------------------------
          // FINAL ENERGY
          // --------------------------------------

          float brightness =
            energy * (2.0 + uAudio * 1.8) +
            fresnel * (0.65 + uAudio * 0.8) +
            core * 0.25;

          // --------------------------------------
          // BLUE BASE
          // --------------------------------------

          vec3 finalColor =
            uColor *
            brightness *
            uIntensity;

          // --------------------------------------
          // CYAN HIGHLIGHTS
          // --------------------------------------

          vec3 cyan = vec3(0.15, 0.75, 1.0);
          finalColor += cyan * pow(energy, 3.5) * (1.8 + uAudio * 2.0);

          // --------------------------------------
          // EDGE GLOW
          // --------------------------------------

          finalColor += uColor * fresnel * (0.8 + uAudio * 0.5);

          // --------------------------------------
          // ALPHA
          // --------------------------------------

          float alpha = brightness * 0.85;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    // ============================================
    // CREATE ORB
    // ============================================

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // ============================================
    // PARTICLES
    // ============================================

    const particleCount = 400;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 0.35;
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
      color: 0x63D8FF,
      size: 0.018,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ============================================
    // INNER BLUE LIGHT
    // ============================================

    const light = new THREE.PointLight(0x00BFFF, 2.5, 6);
    light.position.set(0, 0, 0);
    scene.add(light);

    // ============================================
    // ANIMATION LOOP WITH STATE-REACTIVE LERP
    // ============================================

    const clock = new THREE.Clock();
    let animationFrame: number;

    function animate() {
      animationFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentAudio = audioLevelRef.current || 0;
      const currentState = String(stateRef.current || 'IDLE').toUpperCase();

      material.uniforms.uTime.value = time;
      material.uniforms.uAudio.value = THREE.MathUtils.lerp(
        material.uniforms.uAudio.value,
        currentAudio,
        0.15
      );

      // Target shader parameters based on Orb State Lifecycle
      let targetSpeed = 0.35;
      let targetIntensity = 1.7;
      let targetColor = new THREE.Color(color);
      let targetParticleColor = new THREE.Color(0x63D8FF);

      if (currentState === "WAKING") {
        targetSpeed = 0.65;
        targetIntensity = 2.4;
        targetColor = new THREE.Color("#00E5FF");
        targetParticleColor = new THREE.Color("#A5F3FC");
      } else if (currentState === "LISTENING") {
        targetSpeed = 0.50;
        targetIntensity = 2.0 + currentAudio * 1.6;
        targetColor = new THREE.Color("#00BFFF");
        targetParticleColor = new THREE.Color("#67E8F9");
      } else if (currentState === "THINKING" || currentState === "PROCESSING") {
        targetSpeed = 1.05;
        targetIntensity = 2.5;
        targetColor = new THREE.Color("#8A2BE2");
        targetParticleColor = new THREE.Color("#D8B4FE");
      } else if (currentState === "SPEAKING") {
        targetSpeed = 0.60;
        targetIntensity = 2.2 + currentAudio * 2.0;
        targetColor = new THREE.Color("#00BFFF");
        targetParticleColor = new THREE.Color("#63D8FF");
      } else if (currentState === "ERROR") {
        targetSpeed = 0.25;
        targetIntensity = 1.6;
        targetColor = new THREE.Color("#F43F5E");
        targetParticleColor = new THREE.Color("#FDA4AF");
      } else {
        // IDLE
        targetSpeed = 0.28;
        targetIntensity = 1.5;
        targetColor = new THREE.Color(color);
        targetParticleColor = new THREE.Color(0x63D8FF);
      }

      // Smooth lerp transitions
      material.uniforms.uSpeed.value = THREE.MathUtils.lerp(
        material.uniforms.uSpeed.value,
        targetSpeed,
        0.08
      );
      material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uIntensity.value,
        targetIntensity,
        0.08
      );
      material.uniforms.uColor.value.lerp(targetColor, 0.08);

      particleMaterial.color.lerp(targetParticleColor, 0.08);

      // Smooth orb rotation (faster during thinking/waking)
      const rotationSpeedMultiplier = material.uniforms.uSpeed.value / 0.35;
      orb.rotation.y = time * 0.08 * rotationSpeedMultiplier;
      orb.rotation.x = Math.sin(time * 0.2) * 0.08;

      // Particle movement
      particles.rotation.y = time * 0.12 * rotationSpeedMultiplier;
      particles.rotation.x = time * 0.035;

      // Breathing light
      light.intensity =
        2.2 +
        Math.sin(time * 1.5) * 0.6 +
        currentAudio * 1.8 +
        (currentState === "WAKING" ? 1.0 : 0);
      light.color.lerp(targetColor, 0.08);

      renderer.render(scene, camera);
    }

    animate();

    // ============================================
    // CLEANUP
    // ============================================

    return () => {
      cancelAnimationFrame(animationFrame);
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

  // ============================================
  // COMPONENT
  // ============================================

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
      }}
      className={className}
    />
  );
}

export { AstraOrb };
