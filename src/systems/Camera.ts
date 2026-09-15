import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export class CameraRig {
  readonly camera: THREE.OrthographicCamera;
  readonly controls: OrbitControls;
  private home = new THREE.Vector3(10, 9, 13);
  private homeTarget = new THREE.Vector3(0, 1.5, 0);
  private transition?: { position: THREE.Vector3; target: THREE.Vector3; zoom: number };
  private saved?: { position: THREE.Vector3; target: THREE.Vector3; zoom: number };
  private baseExtent = 6.05;
  private aspect = 1.5;
  focused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 100);
    this.camera.position.copy(this.home);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(this.homeTarget);
    this.controls.enableDamping = true; this.controls.dampingFactor = .055; this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI * .2; this.controls.maxPolarAngle = Math.PI * .405;
    this.controls.minAzimuthAngle = .12; this.controls.maxAzimuthAngle = 1.34;
    this.controls.minZoom = .75; this.controls.maxZoom = 1.8;
    this.controls.rotateSpeed = .46; this.controls.zoomSpeed = .7; this.controls.update();
  }
  resize(width: number, height: number) {
    const aspect = width / height;
    this.aspect = aspect;
    this.baseExtent = aspect < .8 ? 5.7 / aspect : aspect < 1.3 ? 6.4 : 5.05;
    this.camera.left = -this.baseExtent * aspect; this.camera.right = this.baseExtent * aspect;
    this.camera.top = this.baseExtent; this.camera.bottom = -this.baseExtent; this.camera.updateProjectionMatrix();
  }
  focus(target: THREE.Vector3, paper = false) {
    if (!this.focused) this.saved = { position: this.camera.position.clone(), target: this.controls.target.clone(), zoom: this.camera.zoom };
    this.focused = true; this.controls.enabled = false;
    const offset = paper ? new THREE.Vector3(.2, 7, 5.2) : new THREE.Vector3(3.4, 4.4, 7);
    const extent = paper ? Math.max(.58, .46 / this.aspect) : Math.max(1, .75 / this.aspect);
    this.transition = { position: target.clone().add(offset), target: target.clone(), zoom: this.baseExtent / extent };
  }
  back() {
    this.focused = false;
    this.transition = this.saved ?? { position: this.home.clone(), target: this.homeTarget.clone(), zoom: 1 };
    this.saved = undefined;
  }
  reset() { this.saved = undefined; this.focused = false; this.transition = { position: this.home.clone(), target: this.homeTarget.clone(), zoom: 1 }; }
  update(dt: number) {
    if (this.transition) {
      const speed = 1 - Math.exp(-dt * 3.8);
      this.camera.position.lerp(this.transition.position, speed); this.controls.target.lerp(this.transition.target, speed);
      this.camera.zoom = THREE.MathUtils.lerp(this.camera.zoom, this.transition.zoom, speed); this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.controls.target);
      if (this.camera.position.distanceTo(this.transition.position) < .005 && Math.abs(this.camera.zoom - this.transition.zoom) < .005) {
        this.transition = undefined; this.controls.enabled = !this.focused;
      }
    } else if (!this.focused) this.controls.update();
  }
  dispose() { this.controls.dispose(); }
}
