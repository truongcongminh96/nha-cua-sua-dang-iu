import * as THREE from 'three';
import type { Room } from '../world/Room';
export type TimeMode = 'day' | 'golden' | 'night';
export const timePresets = {
  day: { background: '#f6f2e9', ambient: '#faf6ed', sky: '#daddd2', sun: '#fff4df', sunPower: 2.8, fill: 1.65, lamp: .08, bulb: .1, position: [-3, 8, -5], status: '今天，小屋有一点阳光。', label: '日光' },
  golden: { background: '#ebe3d5', ambient: '#f3e1c8', sky: '#e9c69e', sun: '#ffdbac', sunPower: 3.15, fill: 1.35, lamp: .28, bulb: .5, position: [-4, 5, -6], status: '把日落，留在这里一会儿。', label: '黄昏' },
  night: { background: '#252522', ambient: '#c3c6c6', sky: '#353d3a', sun: '#b5d7ee', sunPower: .45, fill: .72, lamp: 3.4, bulb: 2.1, position: [1, 7, -5], status: '夜深了，有一盏灯在等你。', label: '夜晚' },
} as const;
export function localTimeMode(hour = new Date().getHours()): TimeMode { return hour >= 18 || hour < 6 ? 'night' : hour >= 16 ? 'golden' : 'day'; }
export class TimeOfDay {
  mode: TimeMode = localTimeMode();
  readonly sunlight = new THREE.DirectionalLight('#fff4df', 3);
  readonly ambient = new THREE.HemisphereLight('#faf6ed', '#b7a78d', 1.65);
  private bounce = new THREE.DirectionalLight('#f7e4c1', .7);
  private color = new THREE.Color();
  constructor(private scene: THREE.Scene, private room: Room) {
    scene.background = new THREE.Color(timePresets[this.mode].background);
    this.sunlight.position.set(-3, 8, -5); this.sunlight.castShadow = true;
    this.sunlight.shadow.mapSize.set(2048, 2048); this.sunlight.shadow.camera.left = -7; this.sunlight.shadow.camera.right = 7;
    this.sunlight.shadow.camera.top = 7; this.sunlight.shadow.camera.bottom = -7; this.sunlight.shadow.camera.near = .5; this.sunlight.shadow.camera.far = 24;
    this.sunlight.shadow.normalBias = .025; this.sunlight.shadow.bias = -.00025; this.sunlight.shadow.radius = 4;
    this.bounce.position.set(5, 4, 8); scene.add(this.sunlight, this.ambient, this.bounce);
    this.update(100, 0);
  }
  set(mode: TimeMode) { this.mode = mode; }
  update(dt: number, elapsed: number, rain = false) {
    const preset = timePresets[this.mode], blend = 1 - Math.exp(-dt * 1.4);
    (this.scene.background as THREE.Color).lerp(this.color.set(preset.background), blend);
    this.ambient.color.lerp(this.color.set(rain ? '#bdced3' : preset.ambient), blend);
    this.ambient.intensity = THREE.MathUtils.lerp(this.ambient.intensity, preset.fill * (rain ? .8 : 1), blend);
    this.sunlight.color.lerp(this.color.set(preset.sun), blend);
    this.sunlight.intensity = THREE.MathUtils.lerp(this.sunlight.intensity, preset.sunPower * (rain ? .27 : 1), blend);
    this.sunlight.position.lerp(new THREE.Vector3(...preset.position), blend);
    this.sunlight.position.x += Math.sin(elapsed * .018) * .0004;
    this.bounce.intensity = THREE.MathUtils.lerp(this.bounce.intensity, this.mode === 'night' ? .16 : .5, blend);
    for (const material of this.room.windows) { material.color.lerp(this.color.set(preset.sky), blend); material.emissive.copy(material.color); }
    for (const material of this.room.bulbs) material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, preset.bulb + (rain ? .3 : 0), blend);
    for (const light of this.room.lamps) light.intensity = THREE.MathUtils.lerp(light.intensity, (preset.lamp + (rain ? .8 : 0)) * (1 + Math.sin(elapsed * 1.3) * .015), blend);
  }
}
