import { c } from '../copy';
import { mediaUrl, type VideoSource } from '../video/providers';
import { correction, projectedTime, type PlaybackState, type Action } from '../room/playback-sync';
export function timeLabel(time: number): string {
  const seconds = Number.isFinite(time) ? Math.max(0, Math.floor(time)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
export class VideoPlayer {
  readonly video: HTMLVideoElement;
  readonly el: HTMLElement;
  private abort = new AbortController();
  private hideTimer?: ReturnType<typeof setTimeout>;
  private loadTimer?: ReturnType<typeof setTimeout>;
  private message: HTMLElement;
  private latest?: { state: PlaybackState; offset: number };
  private interactive = true;
  private expectedEvents = new Set<string>();
  private reactionTimers = new Set<ReturnType<typeof setTimeout>>();
  onAction: (action: Action, time: number) => void = () => {};
  onReady: () => void = () => {};
  onAdvance: () => void = () => {};
  constructor(source: VideoSource) {
    this.el = document.createElement('section'); this.el.className = 'mc-player'; this.el.setAttribute('aria-label', c('activeVideo'));
    this.el.innerHTML = `<div class="mc-screen"><video playsinline preload="metadata"></video><div class="mc-video-message" role="status"></div><div class="mc-floating" aria-hidden="true"></div></div>
      <div class="mc-controls"><input class="mc-progress" type="range" min="0" max="0" step="0.1" value="0" aria-label="${c('progress')}" disabled>
      <div class="mc-control-row"><button data-action="PLAY" aria-label="${c('play')}"><i data-lucide="play"></i></button><button data-seek="-10" aria-label="${c('rewind')}"><i data-lucide="rotate-ccw"></i><small>10</small></button><button data-seek="10" aria-label="${c('forward')}"><i data-lucide="rotate-cw"></i><small>10</small></button><span class="mc-time">0:00 / 0:00</span><span class="mc-control-spacer"></span><button data-mute aria-label="${c('mute')}"><i data-lucide="volume-2"></i></button><input class="mc-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="${c('volume')}"><button data-fullscreen aria-label="${c('fullscreen')}"><i data-lucide="maximize"></i></button></div></div>
      <button class="mc-native" type="button">${c('native')}</button>`;
    this.video = this.el.querySelector('video')!; this.message = this.el.querySelector('.mc-video-message')!;
    const signal = this.abort.signal;
    const progress = this.el.querySelector<HTMLInputElement>('.mc-progress')!;
    const paint = () => {
      const duration = this.video.duration;
      progress.max = String(Number.isFinite(duration) ? duration : 0); progress.value = String(this.video.currentTime);
      progress.disabled = !this.interactive || !Number.isFinite(duration) || duration <= 0;
      this.el.querySelector('.mc-time')!.textContent = `${timeLabel(this.video.currentTime)} / ${timeLabel(duration)}`;
      const play = this.el.querySelector<HTMLButtonElement>('[data-action]')!;
      play.setAttribute('aria-label', c(this.video.paused ? 'play' : 'pause'));
      play.innerHTML = this.video.paused ? '<span aria-hidden="true">▶</span>' : '<span aria-hidden="true">Ⅱ</span>';
      this.el.classList.toggle('mc-playing', !this.video.paused);
    };
    this.video.addEventListener('timeupdate', paint, { signal });
    this.video.addEventListener('durationchange', paint, { signal });
    this.video.addEventListener('loadedmetadata', () => { clearTimeout(this.loadTimer); this.hideMessage(); paint(); this.applyLatest(); this.onReady(); }, { signal });
    this.video.addEventListener('playing', () => { this.hideMessage(); paint(); this.wake(); this.onAdvance(); }, { signal });
    this.video.addEventListener('pause', () => { this.video.playbackRate = 1; paint(); this.wake(); this.onAdvance(); }, { signal });
    this.video.addEventListener('canplay', () => this.onAdvance(), { signal });
    this.video.addEventListener('waiting', () => { this.showMessage(c('buffering')); this.onAdvance(); }, { signal });
    this.video.addEventListener('ended', () => this.onAction('PAUSE', this.video.currentTime), { signal });
    this.video.addEventListener('error', () => { clearTimeout(this.loadTimer); this.fail(source); }, { signal });
    this.el.querySelector('[data-action]')!.addEventListener('click', () => this.toggle(), { signal });
    this.el.querySelectorAll<HTMLButtonElement>('[data-seek]').forEach(b => b.addEventListener('click', () => this.seekBy(Number(b.dataset.seek)), { signal }));
    progress.addEventListener('change', () => this.interactive && this.onAction('SEEK', Number(progress.value)), { signal });
    this.el.querySelector('[data-mute]')!.addEventListener('click', () => this.mute(), { signal });
    this.el.querySelector<HTMLInputElement>('.mc-volume')!.addEventListener('input', e => { this.video.volume = Number((e.target as HTMLInputElement).value); this.video.muted = false; }, { signal });
    this.el.querySelector('[data-fullscreen]')!.addEventListener('click', () => void this.fullscreen(), { signal });
    this.el.querySelector('.mc-native')!.addEventListener('click', () => { this.video.controls = !this.video.controls; }, { signal });
    // Native fallback events originate locally, but remote application is guarded by desired state.
    this.video.addEventListener('play', () => { if (this.video.controls && !this.expectedEvents.delete('play') && !this.applying) this.onAction('PLAY', this.video.currentTime); }, { signal });
    this.video.addEventListener('pause', () => { if (this.video.controls && !this.expectedEvents.delete('pause') && !this.applying) this.onAction('PAUSE', this.video.currentTime); }, { signal });
    this.video.addEventListener('seeked', () => { if (this.video.controls && !this.expectedEvents.delete('seeked') && !this.applying) this.onAction('SEEK', this.video.currentTime); }, { signal });
    this.el.addEventListener('pointermove', () => this.wake(), { signal });
    this.el.addEventListener('pointerdown', () => this.wake(), { signal });
    document.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || document.querySelector('dialog[open]') || (e.target instanceof Element && e.target.closest('input,textarea,select,button,a,[contenteditable]'))) return;
      const key = e.key.toLowerCase();
      if (![' ', 'arrowleft', 'arrowright', 'm', 'f'].includes(key)) return;
      e.preventDefault(); this.wake();
      if (key === ' ') this.toggle(); else if (key === 'arrowleft') this.seekBy(-10); else if (key === 'arrowright') this.seekBy(10); else if (key === 'm') this.mute(); else void this.fullscreen();
    }, { signal });
    this.showMessage(c('loadingVideo')); this.loadTimer = setTimeout(() => this.fail(source), 20000); this.video.src = mediaUrl(source);
  }
  private applying = false;
  private applyGeneration = 0;
  private wake() { this.el.classList.remove('mc-idle'); clearTimeout(this.hideTimer); this.hideTimer = setTimeout(() => this.el.classList.add('mc-idle'), 3000); }
  private hideMessage() { this.message.hidden = true; }
  private showMessage(text: string) { this.message.hidden = false; this.message.textContent = text; }
  private fail(source: VideoSource) {
    this.showMessage(c(source.provider === 'google-drive' ? 'driveError' : 'videoError'));
    const link = document.createElement('a'); link.href = '?page=cinema&view=create&source=direct'; link.textContent = c('otherSource'); link.className = 'mc-error-link'; this.message.append(link);
  }
  setInteractive(enabled: boolean) {
    this.interactive = enabled;
    this.el.querySelectorAll<HTMLButtonElement>('[data-action],[data-seek],.mc-native').forEach(b => b.disabled = !enabled);
    this.el.querySelector<HTMLInputElement>('.mc-progress')!.disabled = !enabled || !Number.isFinite(this.video.duration);
    if (!enabled) this.video.controls = false;
  }
  toggle() { if (this.interactive && !this.video.error) this.onAction(this.video.paused ? 'PLAY' : 'PAUSE', this.video.currentTime); }
  seekBy(delta: number) { if (this.interactive && Number.isFinite(this.video.duration)) this.onAction('SEEK', Math.max(0, Math.min(this.video.duration, this.video.currentTime + delta))); }
  mute() { this.video.muted = !this.video.muted; this.el.querySelector('[data-mute]')!.setAttribute('aria-pressed', String(this.video.muted)); }
  private async fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (this.el.requestFullscreen) await this.el.requestFullscreen();
      else { this.video.controls = true; this.showMessage(c('fullscreenFallback')); }
    } catch { this.video.controls = true; this.showMessage(c('fullscreenFallback')); }
  }
  private setTime(time: number) {
    const target = Math.max(0, Math.min(Number.isFinite(this.video.duration) ? this.video.duration : Infinity,time));
    if (Math.abs(this.video.currentTime - target) > .01) {
      if (this.video.controls) this.expectedEvents.add("seeked");
      this.video.currentTime = target;
    }
  }
  private pause() { if (!this.video.paused && this.video.controls) this.expectedEvents.add("pause"); this.video.pause(); }
  async local(action: Action, time: number) {
    this.applying = true;
    const generation = ++this.applyGeneration;
    try {
      if (Number.isFinite(this.video.duration)) this.setTime(time);
      if (action === 'PLAY') await this.start(); else if (action === 'PAUSE') this.pause();
    } finally { if (generation === this.applyGeneration) this.applying = false; }
  }
  async start() {
    try { if (this.video.paused && this.video.controls) this.expectedEvents.add("play"); await this.video.play(); } catch {
      this.showMessage(''); const button = document.createElement('button'); button.textContent = c('tapPlay');
      button.addEventListener('click', async () => { try { await this.video.play(); this.hideMessage(); this.onReady(); } catch { this.showMessage(c('videoError')); } }, { once: true, signal: this.abort.signal });
      this.message.append(button);
    }
  }
  apply(state: PlaybackState, offset: number) { this.latest = { state, offset }; this.applyLatest(); }
  private applyLatest() {
    if (!this.latest || this.video.readyState < 1) return;
    const { state, offset } = this.latest;
    const target = projectedTime(state, Date.now(), offset, this.video.duration);
    const effectivePlaying = state.playing && state.advancing;
    const result = state.type === 'SYNC' ? correction(this.video.currentTime, target, effectivePlaying) : { seek: target, rate: 1 };
    this.applying = true;
    const generation = ++this.applyGeneration;
    this.video.playbackRate = result.rate;
    if (result.seek !== undefined) this.setTime(result.seek);
    if (!effectivePlaying) { this.pause(); this.video.playbackRate = 1; }
    if (effectivePlaying && this.video.paused) void this.start().finally(() => { if (generation === this.applyGeneration) this.applying = false; });
    else queueMicrotask(() => { if (generation === this.applyGeneration) this.applying = false; });
  }
  reaction(emoji: string) {
    const layer = this.el.querySelector('.mc-floating')!;
    if (layer.children.length >= 8) return;
    const node = document.createElement('span'); node.textContent = emoji; node.style.left = `${15 + Math.random() * 65}%`; layer.append(node);
    const timer = setTimeout(() => { node.remove(); this.reactionTimers.delete(timer); }, 2200); this.reactionTimers.add(timer);
  }
  destroy() { this.abort.abort(); this.reactionTimers.forEach(clearTimeout); this.reactionTimers.clear(); clearTimeout(this.hideTimer); clearTimeout(this.loadTimer); this.video.pause(); this.video.playbackRate = 1; this.video.removeAttribute('src'); this.video.load(); this.el.remove(); }
}
