import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, type Surface } from './materials';
const geometry = new Map<string, THREE.BufferGeometry>();
export type Parent = THREE.Object3D;
export function box(parent: Parent, size: number[], pos: number[], color: string, radius = .04, surface: Surface = 'plaster') {
  const key = `b${size.join(',')}:${radius}`;
  if (!geometry.has(key)) geometry.set(key, new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(radius, ...size.map(x => x / 2))));
  const mesh = new THREE.Mesh(geometry.get(key), mat(color, surface)); mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function ball(parent: Parent, scale: number[], pos: number[], color: string, surface: Surface = 'plaster') {
  if (!geometry.has('sphere')) geometry.set('sphere', new THREE.SphereGeometry(1, 20, 14));
  const mesh = new THREE.Mesh(geometry.get('sphere'), mat(color, surface)); mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.position.set(pos[0], pos[1], pos[2]); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
/** A pointed, cupped leaf with a raised midrib; shared geometry keeps foliage inexpensive. */
export function leaf(parent: Parent, size: number[], pos: number[], color: string) {
  if (!geometry.has('leaf')) {
    const shape = new THREE.PlaneGeometry(2, 2, 12, 18);
    const vertices = shape.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), z = vertices.getY(i), taper = Math.pow(Math.sin((z + 1) * Math.PI / 2), .72);
      vertices.setXYZ(i, x * taper, .07 * taper * (1 - x * x) - .08 * z * z, z);
    }
    shape.computeVertexNormals(); geometry.set('leaf', shape);
  }
  const key = `${color}:leaf-double`;
  // A dedicated double-sided material is necessary for the visible underside of swaying leaves.
  let material = leafMaterials.get(key);
  if (!material) { material = mat(color, 'leaf').clone(); material.side = THREE.DoubleSide; leafMaterials.set(key, material); }
  const mesh = new THREE.Mesh(geometry.get('leaf'), material);
  mesh.scale.set(size[0], size[1], size[2]); mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
const leafMaterials = new Map<string, THREE.MeshStandardMaterial>();
export function cylinder(parent: Parent, r1: number, r2: number, height: number, pos: number[], color: string, surface: Surface = 'plaster') {
  const key = `c${r1},${r2},${height}`;
  if (!geometry.has(key)) geometry.set(key, new THREE.CylinderGeometry(r1, r2, height, 24));
  const mesh = new THREE.Mesh(geometry.get(key), mat(color, surface)); mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function tube(parent: Parent, points: number[][], radius: number, color: string, surface: Surface = 'plaster') {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number, number, number])));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, radius, 7, false), mat(color, surface));
  mesh.castShadow = true; parent.add(mesh); return mesh;
}
export function group(parent: Parent, position: number[], rotationY = 0) {
  const result = new THREE.Group(); result.position.set(position[0], position[1], position[2]); result.rotation.y = rotationY; parent.add(result); return result;
}
export function canvasPlane(parent: Parent, width: number, height: number, draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.round(1024 * height / width);
  draw(canvas.getContext('2d')!, canvas);
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map, transparent: true, roughness: 1, side: THREE.DoubleSide }));
  parent.add(mesh); return mesh;
}
