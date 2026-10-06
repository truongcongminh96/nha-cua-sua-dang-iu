import type { TimeMode } from './TimeOfDay';
export class RoomAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private wind?: GainNode;
  private rain?: GainNode;
  private noise?: AudioBuffer;
  private filter?: BiquadFilterNode;
  private enabled = false;
  private rainAmount = false;
  private timeMode: TimeMode = 'day';
  private birdTimer = 0;
  private musicTimer = 0;
  private noteIndex = 0;
  music = false;
  get on() { return this.enabled; }
  private create() {
    const context = new AudioContext(); this.context = context;
    this.master = context.createGain(); this.master.gain.value = 0; this.master.connect(context.destination);
    const noise = context.createBuffer(1, context.sampleRate * 4, context.sampleRate), samples = noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < samples.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; samples[i] = last * 3.5; }
    this.noise = noise;
    for (const kind of ['wind', 'rain'] as const) {
      const source = context.createBufferSource(); source.buffer = noise; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = kind === 'wind' ? 'lowpass' : 'highpass'; filter.frequency.value = kind === 'wind' ? 560 : 600;
      const gain = context.createGain(); gain.gain.value = kind === 'wind' ? .13 : 0;
      source.connect(filter).connect(gain).connect(this.master); source.start(); this[kind] = gain;
      if (kind === 'wind') this.filter = filter;
    }
  }
  async toggle() {
    if (!this.context) this.create();
    await this.context!.resume(); this.enabled = !this.enabled;
    this.master!.gain.setTargetAtTime(this.enabled ? .3 : 0, this.context!.currentTime, .45); return this.enabled;
  }
  setWeather(rain: boolean) { this.rainAmount = rain; }
  setTime(mode: TimeMode) { this.timeMode = mode; }
  private tone(frequency: number, length: number, volume: number, delay = 0) {
    if (!this.context || !this.master || !this.enabled) return;
    const ctx = this.context, start = ctx.currentTime + delay, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .03); gain.gain.exponentialRampToValueAtTime(.0001, start + length);
    oscillator.connect(gain).connect(this.master); oscillator.start(start); oscillator.stop(start + length + .05);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  private rustle(length: number, volume: number, frequency: number) {
    if (!this.context || !this.master || !this.enabled) return;
    const ctx = this.context, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = this.noise!; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .5;
    gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + .015); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + length);
    source.connect(filter).connect(gain).connect(this.master); source.start(0, Math.random()); source.stop(ctx.currentTime + length);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  page() { this.rustle(.55, .3, 2100); }
  /** Tea pouring: a soft stream of filtered noise with a rising pitch as the cup fills. */
  pour() { [0, .35, .7, 1.05, 1.4].forEach((delay, i) => setTimeout(() => this.rustle(.5, .07, 900 + i * 180), delay * 1000)); }
  click() { this.tone(880, .12, .04); }
  step() { this.rustle(.075, .045, 550); }
  cloth() { this.rustle(.3, .06, 1100); }
  shutter() { this.rustle(.09, .22, 1600); }
  musicBox() { [523.25, 659.25, 783.99, 659.25, 587.33, 523.25].forEach((f, i) => this.tone(f, 1.7, .09, i * .5)); }
  update(dt: number, elapsed: number) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    this.rain!.gain.setTargetAtTime(this.rainAmount ? .5 : 0, now, 1.3);
    this.wind!.gain.setTargetAtTime(this.timeMode === 'night' ? .06 : .12, now, 1.3);
    this.filter!.frequency.setTargetAtTime(480 + Math.sin(elapsed * .2) * 160, now, 1);
    this.birdTimer -= dt; this.musicTimer -= dt;
    if (this.birdTimer <= 0 && this.timeMode !== 'night' && !this.rainAmount) {
      this.birdTimer = 18 + Math.random() * 28; this.tone(1900, .18, .027); this.tone(2350, .24, .018, .18);
    }
    if (this.music && this.musicTimer <= 0) {
      this.musicTimer = 2.4; const notes = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66];
      this.tone(notes[this.noteIndex++ % notes.length], 4.2, .055);
    }
  }
  async visibility(hidden: boolean) { if (hidden) await this.context?.suspend(); else if (this.enabled) await this.context?.resume(); }
  dispose() { void this.context?.close(); }
}
