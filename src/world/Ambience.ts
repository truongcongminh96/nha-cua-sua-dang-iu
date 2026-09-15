import * as THREE from 'three';
import type { TimeMode } from '../systems/TimeOfDay';
export class Ambience {
  private dust: THREE.Points;
  private star: THREE.Line;
  private starTimer = 75 + Math.random() * 60;
  private starProgress = 0;
  private starActive = false;
  constructor(scene: THREE.Scene, private discover: (id: string) => void) {
    const positions = new Float32Array(65 * 3);
    for (let i = 0; i < 65; i++) positions.set([(Math.random() - .5) * 6.2, .5 + Math.random() * 2.5, (Math.random() - .5) * 5], i * 3);
    const textureCanvas = document.createElement('canvas'); textureCanvas.width = textureCanvas.height = 32;
    const ctx = textureCanvas.getContext('2d')!, glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16); glow.addColorStop(0, '#fff7da'); glow.addColorStop(1, '#fff7da00'); ctx.fillStyle = glow; ctx.fillRect(0, 0, 32, 32);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#fff5d7', size: .028, transparent: true, opacity: .45, map: new THREE.CanvasTexture(textureCanvas), depthWrite: false }));
    this.dust.userData.ignoreRaycast = true; scene.add(this.dust);
    const starGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.22, .09, 0), new THREE.Vector3(0, 0, 0)]);
    this.star = new THREE.Line(starGeo, new THREE.LineBasicMaterial({ color: '#fff0bd', transparent: true, opacity: 0 }));
    this.star.position.set(0, 2.8, -3.4); this.star.userData.ignoreRaycast = true; scene.add(this.star);
    // Tiny stars remain behind the glass, within the actual window opening.
    const starPositions = new Float32Array(23 * 3);
    for (let i = 0; i < 23; i++) starPositions.set([-.93 + Math.random() * 3.2, 2.5 + Math.random() * .85, -3.43], i * 3);
    const starPoints = new THREE.BufferGeometry(); starPoints.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.nightStars = new THREE.Points(starPoints, new THREE.PointsMaterial({ color: '#f7eac4', size: .024, transparent: true, opacity: 0, depthWrite: false })); this.nightStars.userData.ignoreRaycast = true; scene.add(this.nightStars);
  }
  private nightStars: THREE.Points;
  update(dt: number, elapsed: number, mode: TimeMode, rain: boolean, reducedMotion: boolean) {
    const nightMaterial = this.nightStars.material as THREE.PointsMaterial;
    nightMaterial.opacity = THREE.MathUtils.damp(nightMaterial.opacity, mode === 'night' && !rain ? .8 : 0, 1.2, dt);
    const positions = this.dust.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      if (reducedMotion) break;
      positions.setX(i, positions.getX(i) + Math.sin(elapsed * .2 + i) * dt * .015);
      let y = positions.getY(i) + dt * .008; if (y > 3.25) y = .6; positions.setY(i, y);
    }
    positions.needsUpdate = !reducedMotion;
    (this.dust.material as THREE.PointsMaterial).opacity = mode === 'night' ? .16 : .4;
    if (mode === 'night' && !rain) this.starTimer -= dt;
    if (this.starTimer <= 0 && !this.starActive && !reducedMotion) { this.starActive = true; this.starProgress = 0; this.starTimer = 130 + Math.random() * 160; this.discover('shooting-star'); }
    if (this.starActive) {
      this.starProgress += dt / 1.6;
      this.star.position.set(-.5 + this.starProgress * 2, 3.24 - this.starProgress * .67, -3.4);
      (this.star.material as THREE.LineBasicMaterial).opacity = Math.sin(Math.min(1, this.starProgress) * Math.PI) * .9;
      if (this.starProgress >= 1) this.starActive = false;
    }
  }
}
