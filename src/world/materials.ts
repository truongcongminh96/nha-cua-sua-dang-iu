import * as THREE from 'three';

export type Surface = 'wood' | 'cloth' | 'paper' | 'plaster' | 'ceramic' | 'leaf' | 'metal' | 'fur';
const materials = new Map<string, THREE.MeshStandardMaterial>();
const textures = new Map<Surface, THREE.CanvasTexture>();

function texture(kind: Surface) {
  if (textures.has(kind)) return textures.get(kind)!;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  // Neutral albedo preserves the palette; texture should describe the surface, not recolor it.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  let seed = 471;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  if (kind === 'wood') {
    for (let row = 0; row < 128; row++) {
      const y = row * 2, phase = random() * Math.PI * 2;
      ctx.strokeStyle = `rgba(81,62,41,${.025 + random() * .055})`;
      ctx.lineWidth = .4 + random() * .65;
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 8) {
        const grain = y + Math.sin(x / 48 + phase) * 1.3 + Math.sin(x / 17 + phase) * .35;
        if (x === 0) ctx.moveTo(x, grain); else ctx.lineTo(x, grain);
      }
      ctx.stroke();
    }
  } else if (kind === 'cloth') {
    for (let i = 0; i < 256; i += 2) {
      ctx.fillStyle = i % 4 ? 'rgba(88,79,62,.055)' : 'rgba(88,79,62,.025)';
      ctx.fillRect(i, 0, .7, 256); ctx.fillRect(0, i, 256, .7);
    }
  } else if (kind === 'paper') {
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(99,86,65,${random() * .035})`;
      ctx.fillRect(random() * 256, random() * 256, 1 + random() * 3, .5);
    }
  } else if (kind === 'leaf') {
    ctx.strokeStyle = 'rgba(74,98,54,.09)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(128, 256); ctx.stroke();
    for (let y = 24; y < 240; y += 28) {
      ctx.beginPath(); ctx.moveTo(128, y); ctx.lineTo(38, y + 30);
      ctx.moveTo(128, y); ctx.lineTo(218, y + 30); ctx.stroke();
    }
  } else if (kind === 'metal') {
    for (let y = 0; y < 256; y++) {
      ctx.fillStyle = `rgba(66,69,65,${random() * .04})`;
      ctx.fillRect(0, y, 256, .5);
    }
  } else {
    for (let i = 0; i < 3500; i++) {
      ctx.fillStyle = `rgba(80,72,59,${random() * (kind === 'plaster' ? .06 : .025)})`;
      ctx.fillRect(random() * 256, random() * 256, 1, 1);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(kind === 'wood' || kind === 'leaf' ? 1 : 4, kind === 'wood' ? 2 : kind === 'leaf' ? 1 : 4);
  map.anisotropy = 4;
  textures.set(kind, map);
  return map;
}

// Shared materials remain batchable. Distinct roughness prevents every object looking like clay.
export const surfaceProfiles: Record<Surface, { roughness: number; metalness: number; bumpScale: number }> = {
  wood: { roughness: .72, metalness: 0, bumpScale: .009 },
  cloth: { roughness: 1, metalness: 0, bumpScale: .012 },
  paper: { roughness: .96, metalness: 0, bumpScale: .003 },
  plaster: { roughness: .98, metalness: 0, bumpScale: .006 },
  ceramic: { roughness: .38, metalness: 0, bumpScale: .001 },
  leaf: { roughness: .67, metalness: 0, bumpScale: 0 },
  metal: { roughness: .4, metalness: .65, bumpScale: .002 },
  fur: { roughness: 1, metalness: 0, bumpScale: .007 },
};

export function mat(color: THREE.ColorRepresentation, surface: Surface = 'plaster') {
  const key = `${color}:${surface}`;
  if (!materials.has(key)) {
    const profile = surfaceProfiles[surface];
    materials.set(key, new THREE.MeshStandardMaterial({
      color, map: texture(surface), ...profile,
      bumpMap: profile.bumpScale ? texture(surface) : null,
    }));
  }
  return materials.get(key)!;
}

export const palette = {
  wood: '#a99a7c',
  lightWood: '#d8ccb4',
  darkWood: '#484237',
  wall: '#f0eadf',
  cream: '#e8e0ce',
  paper: '#f6f2e9',
  ink: '#292923',
  sage: '#89927b',
  moss: '#596650',
  blue: '#999b91',
  terracotta: '#b23a2b',
  orange: '#b89b72',
};
