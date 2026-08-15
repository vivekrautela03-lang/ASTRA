import * as THREE from 'three';

export interface LunarTextures {
  colorMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

/**
 * Photorealistic Real 3D Lunar Texture Generator (Smooth NASA LRO Lunar Globe)
 * Produces smooth photorealistic 2K lunar maps without jagged geometric displacement spikes.
 */
export function generateProceduralLunarTextures(): LunarTextures {
  const width = 2048;
  const height = 1024;
  
  const canvasColor = document.createElement('canvas');
  canvasColor.width = width;
  canvasColor.height = height;
  const ctxColor = canvasColor.getContext('2d')!;

  const canvasHeight = document.createElement('canvas');
  canvasHeight.width = width;
  canvasHeight.height = height;
  const ctxHeight = canvasHeight.getContext('2d')!;

  const canvasNormal = document.createElement('canvas');
  canvasNormal.width = width;
  canvasNormal.height = height;
  const ctxNormal = canvasNormal.getContext('2d')!;

  // 1. Photorealistic Base Lunar Tone Gradient (Dark Blue / Deep Space Cyan Tint)
  const bgGrad = ctxColor.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#001a36');
  bgGrad.addColorStop(0.5, '#003366');
  bgGrad.addColorStop(1, '#004c8c');
  ctxColor.fillStyle = bgGrad;
  ctxColor.fillRect(0, 0, width, height);

  ctxHeight.fillStyle = '#808080';
  ctxHeight.fillRect(0, 0, width, height);

  // 2. Photorealistic Lunar Maria Basins (Smooth Basalt Seas)
  const mariaBasins = [
    { x: 550, y: 380, rx: 260, ry: 190, opacity: 0.75 },  // Oceanus Procellarum
    { x: 880, y: 360, rx: 220, ry: 170, opacity: 0.80 },  // Mare Imbrium
    { x: 1320, y: 420, rx: 190, ry: 150, opacity: 0.70 }, // Mare Tranquillitatis
    { x: 1220, y: 300, rx: 160, ry: 130, opacity: 0.65 }, // Mare Serenitatis
    { x: 480, y: 650, rx: 200, ry: 140, opacity: 0.60 },  // Mare Nectaris
    { x: 1620, y: 450, rx: 190, ry: 130, opacity: 0.70 }   // Mare Crisium
  ];

  mariaBasins.forEach(m => {
    // Soft blended maria gradients (no harsh geometric edges)
    const gradC = ctxColor.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.rx);
    gradC.addColorStop(0, 'rgba(0, 12, 35, 0.85)');
    gradC.addColorStop(0.65, 'rgba(0, 25, 65, 0.55)');
    gradC.addColorStop(1, 'transparent');
    ctxColor.fillStyle = gradC;
    ctxColor.beginPath();
    ctxColor.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctxColor.fill();

    // Heightmap depression (smooth)
    const gradH = ctxHeight.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.rx);
    gradH.addColorStop(0, '#333333');
    gradH.addColorStop(0.7, '#666666');
    gradH.addColorStop(1, '#808080');
    ctxHeight.fillStyle = gradH;
    ctxHeight.beginPath();
    ctxHeight.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctxHeight.fill();
  });

  // 3. Photorealistic Lunar Impact Craters (Smooth Rim Shading)
  const seedCrater = (x: number, y: number, r: number, isMajor = false) => {
    // Soft radial crater shading
    const colorGrad = ctxColor.createRadialGradient(x, y, r * 0.1, x, y, r * 1.2);
    colorGrad.addColorStop(0, '#000e1f');
    colorGrad.addColorStop(0.6, '#0055a5');
    colorGrad.addColorStop(0.82, '#80d4ff'); // Crisp cyan rim peak
    colorGrad.addColorStop(1, 'transparent');

    ctxColor.fillStyle = colorGrad;
    ctxColor.beginPath();
    ctxColor.arc(x, y, r * 1.2, 0, Math.PI * 2);
    ctxColor.fill();

    // Smooth heightmap
    const heightGrad = ctxHeight.createRadialGradient(x, y, r * 0.2, x, y, r * 1.2);
    heightGrad.addColorStop(0, '#222222');
    heightGrad.addColorStop(0.75, '#dddddd');
    heightGrad.addColorStop(1, '#808080');

    ctxHeight.fillStyle = heightGrad;
    ctxHeight.beginPath();
    ctxHeight.arc(x, y, r * 1.2, 0, Math.PI * 2);
    ctxHeight.fill();

    // Tycho Ray Lines
    if (isMajor) {
      ctxColor.strokeStyle = 'rgba(170, 225, 255, 0.4)';
      ctxColor.lineWidth = 1.2;
      const rayCount = 18;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + (Math.random() * 0.1);
        const rayLen = r * (4 + Math.random() * 8);
        ctxColor.beginPath();
        ctxColor.moveTo(x, y);
        ctxColor.lineTo(x + Math.cos(angle) * rayLen, y + Math.sin(angle) * rayLen);
        ctxColor.stroke();
      }
    }
  };

  // Seed Major Craters (Tycho, Copernicus, Kepler, Aristarchus)
  seedCrater(750, 750, 55, true);  // Tycho
  seedCrater(850, 420, 48, true);  // Copernicus
  seedCrater(620, 410, 35, true);  // Kepler
  seedCrater(520, 340, 30, true);  // Aristarchus
  seedCrater(1400, 700, 42, false); // Stevinus
  seedCrater(1200, 250, 38, false); // Posidonius

  // Seed 300 Natural Craters across the surface
  for (let i = 0; i < 300; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const cr = 3 + Math.pow(Math.random(), 3) * 30;
    seedCrater(cx, cy, cr, false);
  }

  // 4. Smooth Normal Map via Sobel Filter (No geometric displacement spikes)
  const heightData = ctxHeight.getImageData(0, 0, width, height);
  const normalData = ctxNormal.createImageData(width, height);
  const hPixels = heightData.data;
  const nPixels = normalData.data;

  const getH = (x: number, y: number) => {
    const px = Math.min(width - 1, Math.max(0, x));
    const py = Math.min(height - 1, Math.max(0, y));
    return hPixels[(py * width + px) * 4] / 255.0;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const dx = (getH(x + 1, y) - getH(x - 1, y)) * 1.8;
      const dy = (getH(x, y + 1) - getH(x, y - 1)) * 1.8;

      const nz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + nz * nz);

      const nx = (-dx / len) * 0.5 + 0.5;
      const ny = (-dy / len) * 0.5 + 0.5;
      const nzNorm = (nz / len) * 0.5 + 0.5;

      nPixels[idx] = Math.floor(nx * 255);
      nPixels[idx + 1] = Math.floor(ny * 255);
      nPixels[idx + 2] = Math.floor(nzNorm * 255);
      nPixels[idx + 3] = 255;
    }
  }
  ctxNormal.putImageData(normalData, 0, 0);

  // 5. Convert to Three.js Textures
  const colorMap = new THREE.CanvasTexture(canvasColor);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;

  const normalMap = new THREE.CanvasTexture(canvasNormal);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvasHeight);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;

  return { colorMap, normalMap, roughnessMap };
}
