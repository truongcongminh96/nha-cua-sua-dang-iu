import * as THREE from 'three';
import { PetModel } from './PetModel';
import { PetAnimation } from './PetAnimation';
import { PetBehavior, seededRandom, type BehaviorChoice } from './PetBehavior';
import { Navigation, type RouteStep } from './Navigation';
import type { PetDefinition, PetState, BehaviorContext, Position } from './types';

export const stateLabels: Record<PetState, string> = { sleep: '蜷在软软的地方做梦', wake: '刚刚醒来，伸了个懒腰', stretch: '伸一个小小的懒腰', walk: '轻手轻脚地四处逛逛', climb: '小爪子抓稳，慢慢往上爬', glide: '借一点风，轻轻滑翔', jump: '轻轻一跃', inspect: '这里闻起来有点不一样', eat: '抱着一小块水果', groom: '认真地梳理毛毛', idle: '什么也没想，只是发会儿呆' };
export class Pet {
  readonly model = new PetModel();
  readonly animation = new PetAnimation(this.model);
  private behavior: PetBehavior;
  state: PetState = 'idle';
  current: string;
  private stateTime = 0;
  private duration = 6;
  private previous: PetState = 'wake';
  private route: RouteStep[] = [];
  private destination?: BehaviorChoice;
  private from = new THREE.Vector3();
  private to = new THREE.Vector3();
  private interest?: string;
  private footstep = 0;
  constructor(readonly definition: PetDefinition, private navigation: Navigation, private event: (id: string, state: PetState) => void, private stepSound: () => void) {
    this.current = definition.start; this.model.root.position.fromArray(navigation.nodes.get(this.current)!.position);
    this.model.root.rotation.y = -.3; this.behavior = new PetBehavior(seededRandom(definition.seed));
  }
  interestedIn(position: Position) { this.interest = this.navigation.nearest(position).id; if (this.state === 'sleep') { this.state = 'wake'; this.stateTime = 0; this.duration = 2.5; } else if (!this.route.length) this.duration = Math.min(this.duration, this.stateTime + 2.5); }
  /** A gentle pat: a sleeping pet wakes; an idle one stretches happily. A walking pet keeps its route. */
  pat() {
    if (this.route.length) return;
    if (this.state === 'sleep') this.enter('wake', 2.4); else this.enter('stretch', 2.2);
  }
  private enter(state: PetState, duration: number) {
    this.previous = this.state; this.state = state; this.duration = duration; this.stateTime = 0;
    this.event(this.current, state);
  }
  private beginRouteStep() {
    const step = this.route[0];
    this.from.copy(this.model.root.position); this.to.fromArray(step.target.position);
    const speed = step.motion === 'glide' ? 1.25 : step.motion === 'jump' ? 1.8 : this.definition.speed;
    this.enter(step.motion, Math.max(.55, this.from.distanceTo(this.to) / speed));
  }
  update(dt: number, elapsed: number, context: Pick<BehaviorContext, 'time' | 'rain'>) {
    this.stateTime += dt;
    const progress = Math.min(this.stateTime / this.duration, 1);
    if (this.route.length) {
      const eased = this.state === 'walk' || this.state === 'climb' ? progress - Math.sin(progress * Math.PI * 2) * .025 : progress * progress * (3 - 2 * progress);
      this.model.root.position.lerpVectors(this.from, this.to, eased);
      if (this.state === 'jump' || this.state === 'glide') this.model.root.position.y += Math.sin(progress * Math.PI) * (this.state === 'glide' ? .23 : .32);
      const heading = Math.atan2(this.to.x - this.from.x, this.to.z - this.from.z);
      const delta = Math.atan2(Math.sin(heading - this.model.root.rotation.y), Math.cos(heading - this.model.root.rotation.y));
      this.model.root.rotation.y += delta * (1 - Math.exp(-dt * 7));
      this.footstep += dt;
      if (this.footstep > .3 && this.state === 'walk') { this.footstep = 0; this.stepSound(); }
    }
    this.animation.update(this.state, dt, elapsed, progress);
    if (progress < 1) return;
    if (this.route.length) {
      this.current = this.route.shift()!.target.id; this.model.root.position.copy(this.to);
      if (this.route.length) this.beginRouteStep();
      else if (this.destination) { this.enter(this.destination.state, this.destination.duration); this.destination = undefined; }
      return;
    }
    if (this.state === 'sleep') { this.enter('wake', 2.4); return; }
    if (this.state === 'wake') { this.enter('stretch', 2.8); return; }
    const reachable = [...this.navigation.nodes.values()].filter(node => node.id === this.current || this.navigation.route(this.current, node.id).length);
    const choice = this.behavior.choose(reachable, { ...context, current: this.current, previous: this.state === 'stretch' ? this.previous : this.state, userInterest: this.interest });
    this.interest = undefined; this.destination = choice; this.route = this.navigation.route(this.current, choice.target.id);
    if (this.route.length) this.beginRouteStep(); else { this.enter(choice.state, choice.duration); this.destination = undefined; }
  }
}
