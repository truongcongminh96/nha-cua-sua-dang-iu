import { localize } from './localize';
import { icons } from './UI';

const STORAGE_KEY = 'sua-house-calligraphy';

/**
 * Write one character on xuan paper. Slow strokes lay down more ink, fast strokes thin out, and every
 * stroke tapers where the brush lifts. The finished character can hang on the scroll in the reading corner.
 */
export class Calligraphy {
  private panel: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private drawing = false;
  private last?: { x: number; y: number; time: number; width: number };
  private dirty = false;
  private opener?: HTMLElement | null;
  isOpen = false;

  constructor(root: HTMLElement, private hang: (image: HTMLCanvasElement) => void, private restore: () => void, private hasCustom: () => boolean, private closed: () => void) {
    this.panel = document.createElement('section');
    this.panel.className = 'calligraphy'; this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog'); this.panel.setAttribute('aria-modal', 'true'); this.panel.setAttribute('aria-labelledby', 'calligraphy-title');
    this.panel.innerHTML = `<header class="calligraphy-header"><div><span class="seal-chip calligraphy-seal" aria-hidden="true">墨</span><h2 id="calligraphy-title">写一个字</h2></div>
        <button class="icon-button" data-calligraphy="close" aria-label="关闭"><i data-lucide="x"></i></button></header>
      <p class="calligraphy-hint">慢慢写，笔画会更浓；写快一点，笔画会更细。</p>
      <div class="calligraphy-paper"><canvas width="720" height="720" aria-label="书写区" role="img"></canvas></div>
      <div class="calligraphy-actions"><button class="guide-primary" data-calligraphy="hang">挂到墙上</button><button data-calligraphy="clear">重写</button><button data-calligraphy="restore">换回「慢」</button></div>`;
    root.append(this.panel);
    this.canvas = this.panel.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.panel.addEventListener('click', event => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.calligraphy;
      if (action === 'close') this.close();
      if (action === 'clear') this.clear();
      if (action === 'restore') { this.restore(); try { localStorage.removeItem(STORAGE_KEY); } catch { /* Nothing stored. */ } this.close(); }
      if (action === 'hang' && this.dirty) { this.hang(this.canvas); this.save(); this.close(); }
    });
    this.panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); this.close(); } });
    this.canvas.addEventListener('pointerdown', event => this.start(event));
    this.canvas.addEventListener('pointermove', event => this.move(event));
    for (const end of ['pointerup', 'pointercancel', 'pointerleave'] as const) this.canvas.addEventListener(end, () => this.end());
  }

  open() {
    this.opener = document.activeElement as HTMLElement | null;
    this.clear(); this.isOpen = true; this.panel.hidden = false;
    localize(this.panel); icons();
    (this.panel.querySelector('[data-calligraphy="restore"]') as HTMLElement).hidden = !this.hasCustom();
    this.panel.querySelector<HTMLButtonElement>('[data-calligraphy="close"]')?.focus({ preventScroll: true });
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false; this.panel.hidden = true; this.drawing = false;
    this.opener?.focus?.({ preventScroll: true }); this.closed();
  }
  refreshLanguage() { if (this.isOpen) localize(this.panel); }

  /** Load a character written on an earlier visit, if this device kept one. */
  static load(): Promise<HTMLImageElement | null> {
    let data: string | null = null;
    try { data = localStorage.getItem(STORAGE_KEY); } catch { return Promise.resolve(null); }
    if (!data?.startsWith('data:image/png')) return Promise.resolve(null);
    return new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = data!; });
  }

  private save() { try { localStorage.setItem(STORAGE_KEY, this.canvas.toDataURL('image/png')); } catch { /* It still hangs for this visit. */ } }
  private clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); this.dirty = false; this.updateHang(); }
  private updateHang() { (this.panel.querySelector('[data-calligraphy="hang"]') as HTMLButtonElement).disabled = !this.dirty; }
  private point(event: PointerEvent) {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width * this.canvas.width, y: (event.clientY - bounds.top) / bounds.height * this.canvas.height, time: event.timeStamp };
  }
  private start(event: PointerEvent) {
    event.preventDefault(); this.canvas.setPointerCapture(event.pointerId);
    this.drawing = true; const p = this.point(event);
    this.last = { ...p, width: 10 };
    this.dot(p.x, p.y, 9);
  }
  private move(event: PointerEvent) {
    if (!this.drawing || !this.last) return;
    const p = this.point(event), last = this.last;
    const distance = Math.hypot(p.x - last.x, p.y - last.y);
    if (distance < 1.5) return;
    const speed = distance / Math.max(p.time - last.time, 8);
    // A pen's pressure wins when present; otherwise speed decides how much ink the brush lets go.
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : Math.max(0, 1 - speed / 3.2);
    const target = 4 + pressure * 26;
    const width = last.width + (target - last.width) * .35;
    const steps = Math.ceil(distance / 2);
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      this.dot(last.x + (p.x - last.x) * k, last.y + (p.y - last.y) * k, last.width + (width - last.width) * k);
    }
    this.last = { ...p, width };
    this.dirty = true; this.updateHang();
  }
  private end() {
    if (!this.drawing || !this.last) { this.drawing = false; return; }
    // Lift the brush with a short taper so stroke ends look written rather than stamped.
    const { x, y, width } = this.last;
    for (let i = 1; i <= 6; i++) this.dot(x + i * .6, y + i * .4, width * (1 - i / 7));
    this.drawing = false; this.last = undefined;
  }
  private dot(x: number, y: number, radius: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(28,26,23,.9)';
    ctx.beginPath(); ctx.arc(x, y, radius / 2, 0, Math.PI * 2); ctx.fill();
    // A little dry-brush fray along the edge.
    ctx.fillStyle = 'rgba(28,26,23,.18)';
    ctx.beginPath(); ctx.arc(x + (Math.random() - .5) * radius * .5, y + (Math.random() - .5) * radius * .5, radius * .55, 0, Math.PI * 2); ctx.fill();
  }
}
