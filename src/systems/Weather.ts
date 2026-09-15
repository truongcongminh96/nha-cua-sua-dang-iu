import * as THREE from 'three';
export type WeatherMode = 'sunny' | 'rain';
export class Weather {
  mode: WeatherMode = 'sunny';
  private rain: THREE.LineSegments;
  private drops: THREE.Points;
  private amount = 0;
  constructor(scene: THREE.Scene) {
    const positions = new Float32Array(100 * 6);
    for (let i = 0; i < 100; i++) { const x = -.98 + Math.random() * 3.35, y = 1.45 + Math.random() * 1.97; positions.set([x, y, -3.21, x - .015, y - .1, -3.21], i * 6); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#d5e4e6', transparent: true, opacity: 0, depthWrite: false }));
    this.rain.userData.ignoreRaycast = true; scene.add(this.rain);
    const dropPositions = new Float32Array(36 * 3);
    for (let i = 0; i < 36; i++) dropPositions.set([-.98 + Math.random() * 3.35, 1.45 + Math.random() * 1.97, -3.2], i * 3);
    const dropGeo = new THREE.BufferGeometry(); dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPositions, 3));
    this.drops = new THREE.Points(dropGeo, new THREE.PointsMaterial({ color: '#e0e9df', size: .022, transparent: true, opacity: 0, depthWrite: false }));
    this.drops.userData.ignoreRaycast = true; scene.add(this.drops);
  }
  toggle() { this.mode = this.mode === 'sunny' ? 'rain' : 'sunny'; return this.mode; }
  update(dt: number, reducedMotion: boolean) {
    this.amount = THREE.MathUtils.damp(this.amount, this.mode === 'rain' ? 1 : 0, 1.3, dt);
    (this.rain.material as THREE.LineBasicMaterial).opacity = this.amount * .43;
    (this.drops.material as THREE.PointsMaterial).opacity = this.amount * .6;
    this.rain.visible = this.drops.visible = this.amount > .005;
    if (!this.rain.visible || reducedMotion) return;
    const positions = this.rain.geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 2) {
      let y = positions.getY(i) - dt * (.9 + (i % 7) * .11); if (y < 1.47) y = 3.42;
      positions.setY(i, y); positions.setY(i + 1, Math.max(1.42, y - .1));
    }
    positions.needsUpdate = true;
  }
}
