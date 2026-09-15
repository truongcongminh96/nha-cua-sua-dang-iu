import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
export class AssetCache<T> {
  private cache = new Map<string, Promise<T>>();
  get(key: string, loader: () => Promise<T>) {
    if (!this.cache.has(key)) this.cache.set(key, loader().catch(error => { this.cache.delete(key); throw error; }));
    return this.cache.get(key)!;
  }
  clear() { this.cache.clear(); }
}
export class TextureLoader {
  private cache = new AssetCache<THREE.Texture>();
  private loader = new THREE.TextureLoader();
  load(url: string, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) { return this.cache.get(`${url}:${colorSpace}`, async () => { const texture = await this.loader.loadAsync(url); texture.colorSpace = colorSpace; return texture; }); }
}
export class AnimationLoader {
  create(object: THREE.Object3D, clips: THREE.AnimationClip[]) {
    const mixer = new THREE.AnimationMixer(object);
    const actions = new Map(clips.map(clip => [clip.name, mixer.clipAction(clip)]));
    return { mixer, actions, dispose: () => { mixer.stopAllAction(); mixer.uncacheRoot(object); } };
  }
}
export class AssetLoader {
  private loader = new GLTFLoader();
  private cache = new AssetCache<GLTF>();
  readonly textures = new TextureLoader();
  readonly animations = new AnimationLoader();
  private draco?: DRACOLoader;
  constructor(dracoDecoderPath?: string) { if (dracoDecoderPath) { this.draco = new DRACOLoader().setDecoderPath(dracoDecoderPath); this.loader.setDRACOLoader(this.draco); } }
  async model(url: string) { const gltf = await this.cache.get(url, () => this.loader.loadAsync(url)); return { scene: clone(gltf.scene), animations: gltf.animations }; }
  dispose() { this.draco?.dispose(); this.cache.clear(); }
}
