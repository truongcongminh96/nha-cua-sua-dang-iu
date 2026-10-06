import * as THREE from 'three';
export interface InteractableDefinition {
  id: string; label: string; object: THREE.Object3D; focus: THREE.Vector3;
  kind: 'book' | 'memory' | 'pet' | 'action'; quoteIds?: string[]; open?: (value: number) => void;
  turn?: (value: number) => void;
  /** Actions run in place (pour tea, toggle a lantern) instead of opening a reading view. */
  act?: () => void;
}
export class InteractableRegistry {
  readonly entries: InteractableDefinition[] = [];
  register(definition: InteractableDefinition) { this.entries.push(definition); definition.object.traverse(o => { o.userData.interactionId = definition.id; }); }
  get(id: string) { return this.entries.find(entry => entry.id === id); }
  hit(ray: THREE.Raycaster, scene: THREE.Scene) {
    // Nearest opaque geometry occludes interaction: books cannot be clicked through walls.
    const hits = ray.intersectObjects(scene.children, true);
    for (const hit of hits) {
      if (hit.object.userData.ignoreRaycast || !(hit.object instanceof THREE.Mesh)) continue;
      if (hit.object.userData.interactionId) return this.get(hit.object.userData.interactionId);
      const material = hit.object.material as THREE.Material;
      if (!material.transparent || material.opacity > .8) return undefined;
    }
  }
}
