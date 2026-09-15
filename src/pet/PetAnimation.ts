import * as THREE from 'three';
import type { PetState } from './types';
import type { PetModel } from './PetModel';
export class PetAnimation {
  private wingSpread = 0;
  private sleepAmount = 0;
  constructor(private model: PetModel) {}
  update(state: PetState, dt: number, elapsed: number, progress: number) {
    const moving = ['walk', 'climb', 'jump'].includes(state), m = this.model;
    this.wingSpread = THREE.MathUtils.damp(this.wingSpread, state === 'glide' ? 1 : 0, 8, dt);
    this.sleepAmount = THREE.MathUtils.damp(this.sleepAmount, state === 'sleep' ? 1 : 0, 3, dt);
    const breath = Math.sin(elapsed * (state === 'sleep' ? 1.7 : 2.8));
    m.body.scale.y = 1 + breath * .017 - this.sleepAmount * .16;
    m.body.position.y = .19 + (moving ? Math.sin(elapsed * 13) * .013 : 0) - this.sleepAmount * .052;
    m.body.rotation.x = THREE.MathUtils.damp(m.body.rotation.x, state === 'climb' ? -.65 : state === 'glide' ? -.12 : state === 'stretch' ? .16 * Math.sin(progress * Math.PI) : 0, 6, dt);
    m.head.rotation.y = THREE.MathUtils.damp(m.head.rotation.y, state === 'inspect' ? Math.sin(elapsed * 3) * .26 : state === 'idle' ? Math.sin(elapsed * .7) * .22 : 0, 5, dt);
    m.head.rotation.x = THREE.MathUtils.damp(m.head.rotation.x, state === 'inspect' ? .18 + Math.sin(elapsed * 9) * .03 : state === 'eat' ? .15 + Math.sin(elapsed * 8) * .065 : this.sleepAmount * .16, 5, dt);
    const blink = (elapsed % 5.9) < .12;
    for (const eye of m.eyes) eye.scale.y = .054 * (this.sleepAmount > .8 || blink ? .07 : 1);
    for (let i = 0; i < m.legs.length; i++) {
      const leg = m.legs[i], isFront = i % 2 === 1;
      leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, moving ? Math.sin(elapsed * (state === 'climb' ? 9 : 13) + (i === 0 || i === 3 ? 0 : Math.PI)) * .47 : state === 'groom' && isFront ? -1 + Math.sin(elapsed * 9) * .32 : state === 'eat' && isFront ? -.9 : state === 'stretch' ? -.45 * Math.sin(progress * Math.PI) : 0, 10, dt);
      leg.rotation.z = THREE.MathUtils.damp(leg.rotation.z, this.wingSpread * (i < 2 ? -1.05 : 1.05), 10, dt);
    }
    for (let i = 0; i < m.tail.length; i++) {
      m.tail[i].rotation.y = Math.sin(elapsed * 1.6 - i * .35) * .065 + this.sleepAmount * .21;
      m.tail[i].rotation.x = -.065 + (moving ? .08 : 0) + Math.sin(elapsed * .8 + i * .5) * .012;
    }
    for (let i = 0; i < m.wings.length; i++) { m.wings[i].scale.x = .04 + this.wingSpread * .17; m.wings[i].position.x = (i === 0 ? -1 : 1) * (.16 + this.wingSpread * .08); }
    m.ears.forEach((ear, i) => ear.rotation.x = Math.sin(elapsed * .65 + i) * .07 + (state === 'inspect' ? .1 : 0));
    m.fruit.visible = state === 'eat';
  }
}
