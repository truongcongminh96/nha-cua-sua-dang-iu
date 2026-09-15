import * as THREE from 'three';

export type Surface = 'wood' | 'cloth' | 'paper' | 'plaster' | 'ceramic' | 'leaf' | 'metal' | 'fur';
const materials = new Map<string, THREE.MeshStandardMaterial>();
const textures = new Map<Surface, THREE.CanvasTexture>();
function texture(kind: Surface) {
  if (textures.has(kind)) return textures.get(kind)!;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f5f1e8'; ctx.fillRect(0, 0, 256, 256);
  let seed = 471;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 7500; i++) {
    const x = random() * 256, y = random() * 256;
    ctx.fillStyle = `rgba(75,58,38,${random() * (kind === 'wood' ? .09 : .045)})`;
    ctx.fillRect(x, y, kind === 'wood' ? random() * 70 + 10 : 1, 1);
  }
  if (kind === 'cloth' || kind === 'fur') {
    for (let i = 0; i < 256; i += 3) {
      ctx.fillStyle = 'rgba(90,75,60,.055)'; ctx.fillRect(i, 0, 1, 256); ctx.fillRect(0, i, 256, 1);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(kind === 'wood' ? 2 : 3, kind === 'wood' ? 2 : 3);
  textures.set(kind, map); return map;
}
export function mat(color: THREE.ColorRepresentation, surface: Surface = 'plaster') {
  const key = `${color}:${surface}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({
    color, map: texture(surface), roughness: surface === 'ceramic' ? .27 : surface === 'metal' ? .35 : .91,
    metalness: surface === 'metal' ? .65 : 0,
    bumpMap: ['wood', 'cloth', 'fur', 'paper'].includes(surface) ? texture(surface) : null,
    bumpScale: surface === 'wood' ? .025 : .008,
  }));
  return materials.get(key)!;
}
export const palette = {
  wood: '#bf9266', lightWood: '#d6b487', darkWood: '#785b43', wall: '#eee8d5', sage: '#94a58a',
  moss: '#60765a', cream: '#f5edd9', blue: '#889ba4', orange: '#cf926a', paper: '#fff5dc',
};
