import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Batch static geometry by material while preserving all interactive and animated hierarchies. */
export function batchStaticMeshes(root: THREE.Object3D, preserved: THREE.Object3D[]) {
  root.updateMatrixWorld(true);
  const protectedObjects = new Set<THREE.Object3D>();
  for (const object of preserved) object.traverse(child => protectedObjects.add(child));
  const batches = new Map<THREE.Material, THREE.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || protectedObjects.has(object) || Array.isArray(object.material)) return;
    if (!object.visible || object.material.transparent) return;
    const batch = batches.get(object.material) ?? []; batch.push(object); batches.set(object.material, batch);
  });
  const inverse = root.matrixWorld.clone().invert();
  for (const [material, meshes] of batches) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
      if (geometry.index) { const expanded = geometry.toNonIndexed(); geometry.dispose(); return expanded; }
      return geometry;
    });
    const geometry = mergeGeometries(geometries);
    geometries.forEach(geo => geo.dispose());
    if (!geometry) continue;
    const combined = new THREE.Mesh(geometry, material); combined.castShadow = combined.receiveShadow = true;
    combined.name = 'static-material-batch';
    meshes.forEach(mesh => mesh.removeFromParent()); root.add(combined);
  }
}
