import { supabase } from '../supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { EventOrder, isState, type Action, type PlaybackState } from './playback-sync';
import type { Room, Member } from './repository';
import type { VideoPlayer } from '../components/VideoPlayer';
export const reactions = ['❤️', '😂', '😭', '😮', '👍'] as const;
interface Presence { userId: string; memberId: string; tabId: string; displayName: string; joinedAt: string }
interface Request { id: string; action: Action; time: number; senderId: string; sourceRevision: number }
export class RoomRealtime {
  private channel: RealtimeChannel;
  private tabId = crypto.randomUUID();
  private epoch = crypto.randomUUID();
  private sequence = 0;
  private order = new EventOrder();
  private seen = new Set<string>();
  private seenReactions = new Set<string>();
  private interval?: ReturnType<typeof setInterval>;
  private abort = new AbortController();
  private online: Presence[] = [];
  private offset = 0;
  private bestRtt = Infinity;
  private pings = new Map<string, number>();
  private connected = false;
  private leader = '';
  private lastReaction = 0;
  private publishing = false;
  private requestBusy = false;
  private lastPublished = 0;
  private disposed = false;
  onPresence: (online: string[], ready: boolean) => void = () => {};
  onChat: () => void = () => {};
  onMovie: () => void = () => {};
  onConnection: (ready: boolean) => void = () => {};
  constructor(private room: Room, private member: Member, private player: VideoPlayer) {
    if (!supabase) throw new Error('setup');
    this.channel = supabase.channel(`cinema:${room.id}`, { config: { private: true, broadcast: { self: false, ack: true }, presence: { key: this.tabId } } });
    this.channel.on('presence', { event: 'sync' }, () => this.presence());
    this.channel.on('broadcast', { event: 'request' }, ({ payload }) => void this.requestReceived(payload));
    this.channel.on('broadcast', { event: 'state' }, ({ payload }) => {
      if ((payload?.sourceRevision ?? 0) === (this.room.video_revision ?? 0) && isState(payload) && payload.senderId === this.leader && this.order.accept(payload) && !this.authority) this.player.apply(payload, this.offset);
    });
    this.channel.on('broadcast', { event: 'snapshot' }, () => { if (this.authority) void this.publish('SYNC'); });
    this.channel.on('broadcast', { event: 'ping' }, ({ payload }) => {
      if (this.authority && typeof payload?.id === 'string') void this.send('pong', { id: payload.id, hostTime: Date.now(), senderId: this.tabId });
    });
    this.channel.on('broadcast', { event: 'pong' }, ({ payload }) => {
      const start = this.pings.get(payload?.id);
      if (start === undefined || payload.senderId !== this.leader || !Number.isFinite(payload.hostTime)) return;
      this.pings.delete(payload.id); const end = Date.now(); const rtt = end - start;
      if (rtt < this.bestRtt) { this.bestRtt = rtt; this.offset = payload.hostTime - (start + end) / 2; }
      void this.send('snapshot', { senderId: this.tabId });
    });
    // Re-fetch persisted rows instead of trusting arbitrary client-sent chat payloads.
    this.channel.on('broadcast', { event: 'chat' }, () => this.onChat());
    this.channel.on('broadcast', { event: 'movie' }, () => this.onMovie());
    this.channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      if (!reactions.includes(payload?.emoji) || typeof payload?.id !== 'string' || this.seenReactions.has(payload.id)) return;
      this.remember(this.seenReactions, payload.id); this.player.reaction(payload.emoji);
    });
    this.player.onAction = (action, time) => this.control(action, time);
    this.player.onReady = () => this.snapshot();
    this.player.onAdvance = () => { if (this.authority && !this.publishing && Date.now() - this.lastPublished > 250) void this.publish('SYNC'); };
    window.addEventListener('offline', () => {
      this.connected = false; this.player.setInteractive(false); this.onConnection(false);
      supabase?.realtime.disconnect();
    }, { signal: this.abort.signal });
    window.addEventListener('online', () => {
      if (!this.disposed) { this.bestRtt = Infinity; this.pings.clear(); supabase?.realtime.connect(); }
    }, { signal: this.abort.signal });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.snapshot(); }, { signal: this.abort.signal });
  }
  updateRoom(room: Room) {
    if (this.room.host_id === room.host_id) return;
    Object.assign(this.room, room); this.presence();
  }
  get connectionReady() { return this.connected; }
  get authority() { return this.connected && this.member.user_id === this.room.host_id && this.leader === this.tabId; }
  get ready() { return this.connected && Boolean(this.leader); }
  async connect() {
    if (!supabase) return;
    await supabase.realtime.setAuth();
    if (this.disposed) return;
    this.channel.subscribe(async status => {
      if (this.disposed) return;
      this.connected = status === 'SUBSCRIBED'; this.onConnection(this.connected);
      if (this.connected) {
        await this.channel.track({ userId: this.member.user_id, memberId: this.member.id, tabId: this.tabId, displayName: this.member.display_name, joinedAt: new Date().toISOString() });
        this.presence(); this.onChat(); this.snapshot();
      } else { this.player.setInteractive(false); this.onPresence([], false); }
    });
    this.interval = setInterval(() => {
      if (this.authority) void this.publish('SYNC'); else if (this.ready) this.snapshot();
    }, 3000);
  }
  private presence() {
    const rows = Object.values(this.channel.presenceState<Presence>()).flat();
    this.online = rows.filter(p => typeof p.tabId === 'string' && typeof p.userId === 'string');
    const hosts = this.online.filter(p => p.userId === this.room.host_id).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt) || a.tabId.localeCompare(b.tabId));
    const leader = hosts[0]?.tabId ?? '';
    if (leader !== this.leader) {
      this.leader = leader; this.bestRtt = Infinity; this.offset = 0; this.pings.clear();
      this.epoch = crypto.randomUUID(); this.sequence = 0;
      this.snapshot();
    }
    this.player.setInteractive(this.ready); this.onPresence([...new Set(this.online.map(p => p.userId))], this.ready);
  }
  private remember(set: Set<string>, id: string) { set.add(id); if (set.size > 200) set.delete(set.values().next().value!); }
  private async send(event: string, payload: unknown) {
    if (!this.connected || this.disposed) return;
    const result = await this.channel.send({ type: 'broadcast', event, payload });
    if (result !== 'ok' && !this.disposed) { this.onConnection(false); this.player.setInteractive(false); }
  }
  snapshot() {
    if (!this.ready) return;
    if (this.authority) { void this.publish('SYNC'); return; }
    if (this.pings.size >= 5) this.pings.clear();
    const id = crypto.randomUUID(); this.pings.set(id, Date.now());
    void this.send('ping', { id }); void this.send('snapshot', { senderId: this.tabId });
  }
  control(action: Action, time: number) {
    if (!this.ready || !Number.isFinite(time) || time < 0) return;
    const request: Request = { id: crypto.randomUUID(), action, time, senderId: this.tabId, sourceRevision: this.room.video_revision ?? 0 };
    if (this.authority) void this.requestReceived(request); else void this.send('request', request);
  }
  private requests: Request[] = [];
  private async requestReceived(value: unknown) {
    if (!this.authority || !value || typeof value !== 'object') return;
    const r = value as Request;
    if (r.sourceRevision !== (this.room.video_revision ?? 0) || !['PLAY','PAUSE','SEEK'].includes(r.action) || typeof r.id !== 'string' || !this.online.some(p => p.tabId === r.senderId) || !Number.isFinite(r.time) || r.time < 0 || this.seen.has(r.id) || this.requests.length >= 20) return;
    this.remember(this.seen, r.id); this.requests.push(r);
    if (this.requestBusy) return;
    this.requestBusy = true;
    try {
      while (this.requests.length && this.authority && !this.disposed) {
        const next = this.requests.shift()!; this.publishing = true;
        await this.player.local(next.action, next.time);
        this.publishing = false; await this.publish(next.action);
      }
    } finally { this.requestBusy = false; this.publishing = false; }
  }
  private async publish(type: PlaybackState['type']) {
    if (!this.authority || this.disposed) return;
    const v = this.player.video; this.lastPublished = Date.now();
    const state: PlaybackState = { type, eventId: crypto.randomUUID(), epoch: this.epoch, sequence: ++this.sequence, time: v.currentTime, playing: !v.paused && !v.ended, advancing: !v.paused && !v.ended && v.readyState >= 3 && !v.seeking, sentAt: Date.now(), senderId: this.tabId };
    await this.send('state', { ...state, sourceRevision: this.room.video_revision ?? 0 });
  }
  react(emoji: string) {
    if (!this.connected || !reactions.includes(emoji as typeof reactions[number]) || Date.now() - this.lastReaction < 500) return;
    this.lastReaction = Date.now(); const id = crypto.randomUUID(); this.remember(this.seenReactions, id); this.player.reaction(emoji);
    void this.send('reaction', { id, emoji });
  }
  destroy() {
    this.disposed = true; this.connected = false; this.abort.abort(); clearInterval(this.interval); this.requests = []; this.pings.clear();
    this.player.onAction = () => {}; this.player.onReady = () => {}; this.player.onAdvance = () => {};
    void supabase?.removeChannel(this.channel);
  }
}
