import * as THREE from 'three';

export const EvaParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uEntranceProgress: { value: 0 }, // 0.0 (dark) -> 1.0 (fully active)
    uAudioLevel: { value: 0 },
    uState: { value: 0 }, // 0: idle, 1: thinking, 2: speaking
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorCore: { value: new THREE.Color('#00ffff') },
    uColorAura: { value: new THREE.Color('#9d4edd') },
    uColorEyes: { value: new THREE.Color('#ffffff') },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uEntranceProgress;
    uniform float uAudioLevel;
    uniform float uState;
    uniform vec2 uMouse;

    attribute vec3 aTargetPosition;
    attribute float aParticleType; // 0: body particle, 1: eye particle, 2: ring particle

    varying vec3 vPosition;
    varying float vParticleType;
    varying float vAlpha;
    varying float vDisplacement;

    // Simplex 3D Noise function
    vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + D.xxx;
      vec3 x2 = x0 - i2 + D.yyy;
      vec3 x3 = x0 - D.zzz;

      i = mod(i, 289.0 );
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

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
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vParticleType = aParticleType;
      
      // 1. Entrance Assembly Interpolation
      float entranceFactor = smoothstep(0.0, 1.0, uEntranceProgress);
      vec3 startPos = vec3(position.x * 3.0, position.y - 4.0, position.z * 3.0);
      vec3 currentPos = mix(startPos, aTargetPosition, entranceFactor);

      // Height ignition Threshold (feet to head illumination)
      float heightThreshold = (uEntranceProgress - 0.2) / 0.8;
      float heightAlpha = smoothstep(0.0, 0.2, heightThreshold - (aTargetPosition.y + 2.0) / 4.0);

      // 2. Procedural Breathing & Audio Noise Deformation
      float speed = uTime * (0.8 + uState * 0.6);
      float noise1 = snoise(currentPos * 1.8 + vec3(speed * 0.3));
      float noise2 = snoise(currentPos * 3.5 - vec3(speed * 0.6)) * 0.5;

      vDisplacement = (noise1 + noise2) * (0.05 + uAudioLevel * 0.15);
      vec3 displacedPos = currentPos + vec3(vDisplacement);

      // Mouse Parallax Influence
      displacedPos.x += uMouse.x * 0.2 * (displacedPos.y + 2.0) * 0.2;
      displacedPos.y += uMouse.y * 0.2;

      vPosition = displacedPos;
      
      // Eyes activate last with maximum brightness
      if (aParticleType == 1.0) {
        float eyeAlpha = smoothstep(0.8, 1.0, uEntranceProgress);
        vAlpha = eyeAlpha * (0.9 + sin(uTime * 4.0) * 0.1);
      } else {
        vAlpha = heightAlpha * (0.4 + sin(uTime * 2.0 + currentPos.y) * 0.3 + uAudioLevel * 0.4);
      }

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      
      // Size attenuation based on distance and particle type
      float pSize = (aParticleType == 1.0 ? 0.09 : 0.055) + uAudioLevel * 0.03;
      gl_PointSize = (pSize / -mvPosition.z) * 15.0;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uAudioLevel;
    uniform float uState;
    uniform vec3 uColorCore;
    uniform vec3 uColorAura;
    uniform vec3 uColorEyes;

    varying vec3 vPosition;
    varying float vParticleType;
    varying float vAlpha;
    varying float vDisplacement;

    void main() {
      // Circular point particle shape with soft edge blur
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float pointAlpha = smoothstep(0.5, 0.05, dist);

      vec3 finalColor = uColorCore;

      if (vParticleType == 1.0) {
        // Deep Cyan-White Eye Nodes
        finalColor = mix(uColorCore, uColorEyes, 0.85) * 1.8;
      } else if (vParticleType == 2.0) {
        // Orbiting Neural Ring Particles
        finalColor = mix(uColorCore, uColorAura, sin(uTime * 2.0 + vPosition.y) * 0.5 + 0.5);
      } else {
        // Body Particles with Fresnel rim shading
        float mixFactor = sin(vDisplacement * 10.0 + uTime) * 0.5 + 0.5;
        finalColor = mix(uColorCore, uColorAura, mixFactor);
      }

      // Audio and Thinking state brightness boost
      float intensity = 1.0 + uAudioLevel * 0.8 + (uState == 1.0 ? 0.4 : 0.0);
      finalColor *= intensity;

      gl_FragColor = vec4(finalColor, vAlpha * pointAlpha);
    }
  `
};

export const ReflectiveFloorShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorGrid: { value: new THREE.Color('#00f0ff') },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorGrid;

    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      // Concentric circular emitter rings on floor
      float dist = length(vUv - vec2(0.5));
      float ring = sin(dist * 50.0 - uTime * 2.0) * 0.5 + 0.5;
      ring = pow(ring, 12.0);

      // Radial fade out towards outer edge
      float fade = smoothstep(0.5, 0.05, dist);

      vec3 color = uColorGrid * ring * 1.5;
      float alpha = ring * fade * 0.45;

      gl_FragColor = vec4(color, alpha);
    }
  `
};
