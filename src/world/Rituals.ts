import * as THREE from 'three';

type PuffKind = 'steam' | 'heart';
interface Puff { sprite: THREE.Sprite; kind: PuffKind; age: number; life: number; velocity: THREE.Vector3; phase: number; size: number }

function spriteTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
  draw(canvas.getContext('2d')!);
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; return map;
}

/** Small, short-lived sprites for rituals: tea steam that curls upward and hearts that float off Mochi. */
export class Puffs {
  readonly group = new THREE.Group();
  private puffs: Puff[] = [];
  private textures: Record<PuffKind, THREE.Texture>;
  private emitters: { kind: PuffKind; position: THREE.Vector3; until: number; timer: number; every: number }[] = [];
  private clock = 0;
  constructor() {
    this.group.userData.ignoreRaycast = true;
    this.textures = {
      steam: spriteTexture(ctx => {
        const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        glow.addColorStop(0, 'rgba(255,252,244,.75)'); glow.addColorStop(1, 'rgba(255,252,244,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
      }),
      heart: spriteTexture(ctx => {
        ctx.fillStyle = '#b23a2b'; ctx.beginPath();
        ctx.moveTo(32, 54); ctx.bezierCurveTo(4, 36, 8, 10, 32, 22); ctx.bezierCurveTo(56, 10, 60, 36, 32, 54); ctx.fill();
      }),
    };
  }
  /** Emit continuously from a point for a while (steam above a cup). */
  emit(kind: PuffKind, position: THREE.Vector3, seconds: number, every = .35) {
    this.emitters.push({ kind, position: position.clone(), until: this.clock + seconds, timer: 0, every });
  }
  burst(kind: PuffKind, position: THREE.Vector3, count: number) { for (let i = 0; i < count; i++) this.spawn(kind, position, i); }
  private spawn(kind: PuffKind, position: THREE.Vector3, index = 0) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.textures[kind], transparent: true, depthWrite: false, opacity: 0 }));
    sprite.position.copy(position).add(new THREE.Vector3((Math.random() - .5) * .06, 0, (Math.random() - .5) * .06));
    sprite.userData.ignoreRaycast = true; this.group.add(sprite);
    const steam = kind === 'steam';
    this.puffs.push({
      sprite, kind, age: -index * .12, life: steam ? 2.6 : 1.6, phase: Math.random() * Math.PI * 2, size: steam ? .09 : .07,
      velocity: steam ? new THREE.Vector3(0, .16, 0) : new THREE.Vector3((Math.random() - .5) * .25, .42, (Math.random() - .5) * .25),
    });
  }
  update(dt: number, reducedMotion: boolean) {
    this.clock += dt;
    for (const emitter of this.emitters) {
      emitter.timer -= dt;
      if (emitter.timer <= 0) { emitter.timer = emitter.every; this.spawn(emitter.kind, emitter.position); }
    }
    this.emitters = this.emitters.filter(emitter => emitter.until > this.clock);
    for (const puff of this.puffs) {
      puff.age += dt;
      if (puff.age < 0) continue;
      const t = puff.age / puff.life, motion = reducedMotion ? .25 : 1;
      puff.sprite.position.addScaledVector(puff.velocity, dt * motion);
      if (puff.kind === 'steam') puff.sprite.position.x += Math.sin(puff.age * 2.4 + puff.phase) * .0018 * motion;
      const grow = puff.kind === 'steam' ? 1 + t * 2.2 : 1 + Math.sin(Math.min(t * 4, 1) * Math.PI / 2) * .4;
      puff.sprite.scale.setScalar(puff.size * grow);
      puff.sprite.material.opacity = Math.sin(Math.min(t, 1) * Math.PI) * (puff.kind === 'steam' ? .55 : .95);
    }
    for (const puff of this.puffs.filter(p => p.age >= p.life)) { this.group.remove(puff.sprite); puff.sprite.material.dispose(); }
    this.puffs = this.puffs.filter(p => p.age < p.life);
  }
}

/** Distinct days the house was visited, kept on this device; the plum branch blossoms one flower per day. */
export function recordVisit(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined, today: string) {
  let saved: unknown = [];
  try { saved = JSON.parse(storage?.getItem('sua-house-visits') ?? '[]'); } catch { /* Start a fresh count. */ }
  let days = Array.isArray(saved) ? saved.filter((day): day is string => typeof day === 'string') : [];
  if (!days.includes(today)) days.push(today);
  days = days.slice(-60);
  try { storage?.setItem('sua-house-visits', JSON.stringify(days)); } catch { /* Still counts this visit. */ }
  return days.length;
}
