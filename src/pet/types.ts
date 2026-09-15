export type PetInteractionCapability = 'sleepable' | 'climbable' | 'eatable' | 'watchable' | 'inspectable' | 'walkable' | 'jumpable' | 'landable';
export type PetState = 'sleep' | 'wake' | 'stretch' | 'walk' | 'climb' | 'glide' | 'jump' | 'inspect' | 'eat' | 'groom' | 'idle';
export type Position = [number, number, number];
export interface WorldAffordance { id: string; position: Position; capabilities: PetInteractionCapability[]; label: string }
export interface NavigationLink { from: string; to: string; motion: 'walk' | 'climb' | 'glide' | 'jump'; bidirectional?: boolean }
export interface PetDefinition { id: string; name: string; start: string; speed: number; seed: number }
export interface BehaviorContext { time: 'day' | 'golden' | 'night'; rain: boolean; current: string; previous: PetState; userInterest?: string }
