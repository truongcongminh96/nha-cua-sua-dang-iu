import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { Room } from '../src/world/Room';
import { InteractableRegistry } from '../src/systems/Interactable';
import { batchStaticMeshes } from '../src/world/optimize';
import { Pet } from '../src/pet/Pet';
import { Navigation } from '../src/pet/Navigation';
import { affordances, navigationLinks, pets } from '../src/data/environment';
import { leaf } from '../src/world/primitives';

// A minimal canvas substitute lets geometry, occlusion, and animation be checked without a GPU.
const context = new Proxy({}, { get: (_target, key) => key === 'createLinearGradient' || key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
Object.defineProperty(globalThis, 'document', { value: { createElement: () => ({ width: 256, height: 256, getContext: () => context }) }, configurable: true });

test('curved foliage has finite geometry and remains visible from both sides', () => {
  const root = new THREE.Group(), foliage = leaf(root, [1, 1, 1], [0, 0, 0], '#94a58a');
  for (const attribute of ['position', 'normal', 'uv']) {
    assert.ok(Array.from(foliage.geometry.getAttribute(attribute).array).every(Number.isFinite), attribute);
  }
  root.updateMatrixWorld(true);
  for (const side of [-1, 1]) {
    const ray = new THREE.Raycaster(new THREE.Vector3(.2, side * 2, .2), new THREE.Vector3(0, -side, 0));
    assert.ok(ray.intersectObject(foliage).length > 0, `Leaf disappeared from side ${side}`);
  }
});

test('reduced motion holds foliage still without changing their rest poses', () => {
  const room = new Room(new THREE.Scene(), new InteractableRegistry());
  room.update(17, false);
  assert.ok(room.ambient.some(part => part.object.rotation[part.axis] !== part.base));
  room.update(18, true);
  for (const part of room.ambient) assert.equal(part.object.rotation[part.axis], part.base);
  room.update(24, true);
  for (const part of room.ambient) assert.equal(part.object.rotation[part.axis], part.base);
});

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

test('furniture leaves the entire reading page clear, including its header and corners', () => {
  const scene = new THREE.Scene(), registry = new InteractableRegistry(), room = new Room(scene, registry);
  for (const entry of registry.entries.filter(e => e.kind === 'book')) {
    room.showQuote(entry.focus, 'Page', 'Note', true, entry.object.rotation.y);
    scene.updateMatrixWorld(true);
    const ownObjects = new Set<THREE.Object3D>(); entry.object.traverse(object => ownObjects.add(object));
    const offset = new THREE.Vector3(.2, 7, 5.2), direction = offset.clone().normalize().negate();
    for (const x of [-.54, 0, .54]) for (const y of [-.37, 0, .37]) {
      const target = room.quoteSurface.localToWorld(new THREE.Vector3(x, y, 0));
      const ray = new THREE.Raycaster(target.clone().add(offset), direction, 0, offset.length() - .01);
      const occluders = ray.intersectObjects(scene.children, true).filter(hit => {
        if (ownObjects.has(hit.object) || hit.object === room.quoteSurface || hit.object.userData.ignoreRaycast) return false;
        const material = (hit.object as THREE.Mesh).material as THREE.Material;
        return material && !material.transparent;
      });
      assert.equal(occluders.length, 0, `${entry.id}: page area ${x}, ${y} is behind furniture`);
    }
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


test('remodeled furniture supports every elevated pet landing without embedding the pet', () => {
  const scene = new THREE.Scene(); new Room(scene, new InteractableRegistry());
  scene.updateMatrixWorld(true);
  for (const id of ['sofa', 'shelf-low', 'shelf-high', 'window', 'desk', 'pet-shelf', 'perch', 'cushion']) {
    const anchor = affordances.find(a => a.id === id)!;
    const point = new THREE.Vector3(...anchor.position);
    const ray = new THREE.Raycaster(point.clone().add(new THREE.Vector3(0, .18, 0)), new THREE.Vector3(0, -1, 0), 0, .28);
    const hit = ray.intersectObjects(scene.children, true).find(h => !h.object.userData.ignoreRaycast);
    assert.ok(hit, `${id} has no supporting furniture`);
    assert.ok(Math.abs(hit.point.y - point.y) < .065, `${id} contact is ${hit.point.y}, expected near ${point.y}`);
  }
});
