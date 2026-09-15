import type { WorldAffordance, PetState, BehaviorContext, PetInteractionCapability } from './types';
export interface BehaviorChoice { target: WorldAffordance; state: PetState; duration: number }
interface BehaviorRule { capability: PetInteractionCapability; state: PetState; weight: number; duration: [number, number] }
const rules: BehaviorRule[] = [
  { capability: 'sleepable', state: 'sleep', weight: 1.6, duration: [22, 42] },
  { capability: 'watchable', state: 'idle', weight: 2.3, duration: [9, 18] },
  { capability: 'eatable', state: 'eat', weight: 1.2, duration: [7, 12] },
  { capability: 'inspectable', state: 'inspect', weight: 2.6, duration: [5, 10] },
  { capability: 'climbable', state: 'groom', weight: 1, duration: [7, 13] },
  { capability: 'jumpable', state: 'idle', weight: 1.4, duration: [6, 13] },
];
export function seededRandom(seed: number) { let value = seed; return () => { value = (value * 16807) % 2147483647; return value / 2147483647; }; }
export class PetBehavior {
  constructor(private random: () => number = Math.random) {}
  choose(affordances: WorldAffordance[], context: BehaviorContext): BehaviorChoice {
    const options = affordances.flatMap(target => rules.filter(r => target.capabilities.includes(r.capability)).map(rule => {
      let weight = rule.weight;
      if (rule.state === context.previous) weight *= .28;
      if (target.id === context.current) weight *= .18;
      if (rule.state === 'sleep') weight *= context.time === 'day' ? 2.5 : .4; // Sugar gliders are nocturnal.
      if (context.rain && (rule.state === 'sleep' || rule.capability === 'watchable')) weight *= 2;
      if (target.id === context.userInterest && rule.state !== 'sleep') weight *= 16;
      return { target, rule, weight };
    }));
    if (!options.length) throw new Error('A pet needs at least one usable furniture capability.');
    let draw = this.random() * options.reduce((sum, o) => sum + o.weight, 0);
    const option = options.find(o => (draw -= o.weight) <= 0) ?? options.at(-1)!;
    return { target: option.target, state: option.rule.state, duration: option.rule.duration[0] + this.random() * (option.rule.duration[1] - option.rule.duration[0]) };
  }
}
