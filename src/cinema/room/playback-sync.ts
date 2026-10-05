export interface PlaybackState { type: 'PLAY' | 'PAUSE' | 'SEEK' | 'SYNC'; eventId: string; sequence: number; epoch: string; time: number; playing: boolean; advancing: boolean; sentAt: number; senderId: string }
export type Action = 'PLAY' | 'PAUSE' | 'SEEK';
export function isState(value: unknown): value is PlaybackState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return ['PLAY', 'PAUSE', 'SEEK', 'SYNC'].includes(String(s.type)) && typeof s.eventId === 'string' && typeof s.epoch === 'string' && typeof s.senderId === 'string' && typeof s.sequence === 'number' && Number.isSafeInteger(s.sequence) && s.sequence >= 0 && typeof s.time === 'number' && Number.isFinite(s.time) && s.time >= 0 && typeof s.sentAt === 'number' && Number.isFinite(s.sentAt) && typeof s.playing === 'boolean' && typeof s.advancing === 'boolean';
}
export function correction(current: number, target: number, playing: boolean): { seek?: number; rate: number } {
  const drift = target - current;
  if (Math.abs(drift) < .3) return { rate: 1 };
  if (!playing || Math.abs(drift) > 1) return { seek: Math.max(0, target), rate: 1 };
  return { rate: drift > 0 ? 1.03 : .97 };
}
export function projectedTime(state: PlaybackState, now: number, offset: number, duration: number): number {
  const elapsed = state.advancing && state.playing ? Math.max(0, Math.min(6, (now + offset - state.sentAt) / 1000)) : 0;
  return Math.min(Number.isFinite(duration) ? duration : Infinity, state.time + elapsed);
}
export class EventOrder {
  private epoch = ''; private sequence = -1; private retired = new Set<string>();
  accept(state: PlaybackState): boolean {
    if (this.retired.has(state.epoch)) return false;
    if (state.epoch !== this.epoch) {
      if (this.epoch) this.retired.add(this.epoch);
      if (this.retired.size > 20) this.retired.delete(this.retired.values().next().value!);
      this.epoch = state.epoch; this.sequence = -1;
    }
    if (state.sequence <= this.sequence) return false;
    this.sequence = state.sequence; return true;
  }
}
