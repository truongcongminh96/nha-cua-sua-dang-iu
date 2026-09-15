import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { Room } from '../src/world/Room';
import { InteractableRegistry } from '../src/systems/Interactable';
import { batchStaticMeshes } from '../src/world/optimize';
import { Pet } from '../src/pet/Pet';
import { Navigation } from '../src/pet/Navigation';
import { affordances, navigationLinks, pets } from '../src/data/environment';

// A minimal canvas substitute lets geometry, occlusion, and animation be checked without a GPU.
const context = new Proxy({}, { get: (_target, key) => key === 'createLinearGradient' || key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
Object.defineProperty(globalThis, 'document', { value: { createElement: () => ({ width: 256, height: 256, getContext: () => context }) }, configurable: true });

test('static batching retains every animated leaf and book, and cuts static draw calls', () => {
  const scene = new THREE.Scene(), registry = new InteractableRegistry(), room = new Room(scene, registry);
  const count = () => { let n = 0; scene.traverse(o => { if (o instanceof THREE.Mesh) n++; }); return n; };
  const before = count();
  for (const part of room.ambient) batchStaticMeshes(part.object, []);
  batchStaticMeshes(room.root, [room.quoteGroup, ...room.ambient.map(a => a.object), ...registry.entries.map(i => i.object)]);
  assert.ok(count() < before * .65, `Expected substantial batching: ${before} → ${count()}`);
  for (const entry of registry.entries) assert.ok(scene.getObjectById(entry.object.id), entry.id);
  for (const leaf of room.ambient) assert.ok(scene.getObjectById(leaf.object.id));
  console.log(`Scene meshes: ${before} → ${count()} after batching.`);
});

test('every healing book is physically readable from its focus camera', () => {
  const scene = new THREE.Scene(), registry = new InteractableRegistry(), room = new Room(scene, registry);
  batchStaticMeshes(room.root, [room.quoteGroup, ...room.ambient.map(a => a.object), ...registry.entries.map(i => i.object)]);
  for (const entry of registry.entries.filter(e => e.kind === 'book')) {
    const target = entry.focus.clone().add(new THREE.Vector3(0, .12, 0));
    const eye = entry.focus.clone().add(new THREE.Vector3(.2, 7, 5.2));
    scene.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(eye, target.clone().sub(eye).normalize());
    const hit = registry.hit(ray, scene);
    assert.equal(hit?.id, entry.id, `${entry.id} is occluded from its reading camera`);
  }
});

test('all five books can be selected from an allowed room viewing angle', () => {
  const scene = new THREE.Scene(), registry = new InteractableRegistry(); new Room(scene, registry);
  scene.updateMatrixWorld(true);
  for (const entry of registry.entries.filter(e => e.kind === 'book')) {
    const target = entry.focus.clone().add(new THREE.Vector3(0, .12, 0));
    const visible = [.12, .65, 1.34].some(angle => [.63, 1.13].some(polar => {
      const eye = new THREE.Vector3().setFromSphericalCoords(17, polar, angle).add(new THREE.Vector3(0, 1.5, 0));
      const ray = new THREE.Raycaster(eye, target.clone().sub(eye).normalize());
      return registry.hit(ray, scene)?.id === entry.id;
    }));
    assert.ok(visible, `${entry.id} cannot be selected from the orbit camera`);
  }
});

test('autonomous pet completes long sessions without invalid coordinates or stuck routes', () => {
  const nav = new Navigation(affordances, navigationLinks), observed = new Set<string>();
  const pet = new Pet(pets[0], nav, (_anchor, state) => observed.add(state), () => {});
  for (let i = 0; i < 24000; i++) {
    if (i % 1400 === 0) pet.interestedIn(affordances[(i / 1400) % affordances.length | 0].position);
    pet.update(.05, i * .05, { time: i < 12000 ? 'day' : 'night', rain: i > 16000 });
    assert.ok(pet.model.root.position.toArray().every(Number.isFinite));
    assert.ok(pet.model.root.position.y >= .2 && pet.model.root.position.y < 4);
  }
  for (const state of ['sleep', 'wake', 'stretch', 'walk', 'climb', 'inspect', 'eat', 'glide', 'idle']) assert.ok(observed.has(state), `Missing autonomous behavior: ${state}`);
});
