import { createIcons, ArrowLeft, ArrowRight, X } from 'lucide';
import { getLocale, t } from '../data/i18n';
import { localize } from './localize';
import type { TimeMode } from '../systems/TimeOfDay';
import type { PetState } from '../pet/types';
import { petStatuses, roomStatuses } from './copy';
import { setThemeColor } from './theme';

export function icons() {
  createIcons({ icons: { ArrowLeft, ArrowRight, X }, attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
}

export interface ReadingPage { eyebrow: string; lines: string[]; secondary: string; page: number; total: number }

const guideSteps = [
  { glyph: '看', text: '拖动环顾小屋，滚轮或双指靠近。' },
  { glyph: '圈', text: '物件被墨圈圈住时，轻点就能打开：书、便签、音乐盒……' },
  { glyph: '册', text: '每个小发现都会在「册」里盖一枚印章。' },
];

/** One control in the seal dock: a hanzi chip, with a short label on wide screens. */
const dock = (attrs: string, glyph: string, label: string) =>
  `<button class="dock-button" ${attrs}><span class="dock-glyph" aria-hidden="true">${glyph}</span><span class="dock-label">${label}</span></button>`;

export class UI {
  readonly root: HTMLElement;
  private toastTimer = 0;
  private guideStep = 0;
  private onGuideDone?: () => void;
  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="world" role="application" aria-label="Sữa Bea 的互动小屋。拖动旋转，滚轮缩放。也可以从小屋介绍中使用物件按钮。"><canvas id="world-canvas" data-live-copy aria-label="可探索的三维小屋" tabindex="0"></canvas></div>
      <main class="ui">
        <header class="house-header" data-exploration>
          <a class="back-home" href="?page=choose"><i data-lucide="arrow-left"></i><span>返回首页</span></a>
          <span class="header-rule" aria-hidden="true"></span>
          <div class="brand"><h1 aria-label="Sữa Bea 的小屋">Sữa Bea</h1><span class="seal-chip brand-seal" aria-hidden="true">家</span></div>
          <p class="status" id="room-status" data-live-copy></p>
        </header>
        <div class="language-control lang-switch" role="group" aria-label="中文 / Tiếng Việt" data-live-copy>
          <button data-locale="vi" lang="vi" aria-label="Tiếng Việt" aria-pressed="false">VI</button><span aria-hidden="true">/</span><button data-locale="zh" lang="zh-CN" aria-label="中文" aria-pressed="false">中文</button>
        </div>
        <div class="pet-status" data-exploration><strong>Mochi</strong><span id="pet-status" data-live-copy></span></div>
        <div class="instructions" data-exploration><span class="desktop-hint">拖动环顾<span class="dots">·</span>滚轮靠近<span class="dots">·</span>轻点，发现小惊喜</span></div>
        <nav class="dock" data-exploration aria-label="小屋设置">
          <div class="dock-group" role="group" aria-label="选择时间">
            ${dock('data-time="day" aria-pressed="false" aria-label="日光" title="日光"', '日', '日光')}
            ${dock('data-time="golden" aria-pressed="false" aria-label="黄昏" title="黄昏"', '昏', '黄昏')}
            ${dock('data-time="night" aria-pressed="false" aria-label="夜晚" title="夜晚"', '夜', '夜晚')}
          </div>
          <div class="dock-group">
            ${dock('id="weather" data-live-copy aria-pressed="false" aria-label="切换下雨" title="切换下雨"', '雨', '下雨')}
            ${dock('id="sound" data-live-copy aria-pressed="false" aria-label="打开声音" title="打开声音"', '音', '声音')}
          </div>
          <div class="dock-group">
            ${dock('id="collection" aria-label="打开小屋手记" title="打开小屋手记" aria-controls="drawer" aria-expanded="false"', '册', '手记<small data-live-copy id="discovery-summary"></small>')}
            ${dock('id="reset" aria-label="重置视角" title="回到最初的视角"', '回', '视角')}
            ${dock('id="about" aria-label="关于小屋与无障碍探索" title="关于小屋" aria-controls="drawer" aria-expanded="false"', '序', '关于')}
          </div>
        </nav>
        <div class="ink-ring" id="ink-ring" aria-hidden="true" hidden><svg viewBox="0 0 100 62" preserveAspectRatio="none"><path class="ink-main" pathLength="1" d="M52 5 C80 3 97 15 96 31 C95 48 75 59 48 58 C22 57 4 46 5 30 C6 16 24 6 57 7"/><path class="ink-echo" pathLength="1" d="M30 9 C55 3 86 8 93 24"/></svg></div>
        <div class="tooltip" id="tooltip" data-live-copy hidden></div>
        <div class="toast" id="toast" data-live-copy role="status" aria-live="polite" aria-atomic="true"></div>
        <div class="focus-label" id="focus-label" data-live-copy hidden></div>
        <article class="reading-page" id="reading-page" data-live-copy aria-live="polite" hidden></article>
        <div class="focus-controls paper-group" id="focus-controls" hidden><button id="leave-focus"><i data-lucide="arrow-left"></i>回到小屋</button><button id="next-page">再读一页<i data-lucide="arrow-right"></i></button></div>
        <section class="guide" id="guide" role="dialog" aria-modal="false" aria-labelledby="guide-text" data-live-copy hidden></section>
        <section class="drawer" id="drawer" role="dialog" aria-modal="false" aria-labelledby="drawer-title" hidden></section>
      </main>
      <div class="loading" id="loading"><span class="seal-chip loader-mark" aria-hidden="true">家</span><p>正在把小屋的灯点亮</p></div>`;
    this.root = container.querySelector('.ui')!;
    icons();
    if (matchMedia('(pointer: coarse)').matches) container.querySelector('.desktop-hint')!.innerHTML = '单指环顾<span class="dots">·</span>双指靠近<span class="dots">·</span>轻点，发现小惊喜';
    container.querySelector('#guide')!.addEventListener('click', event => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.guide;
      if (action === 'next') this.showGuideStep(this.guideStep + 1);
      if (action === 'skip') this.finishGuide();
    });
    this.refreshLanguage();
  }
  refreshLanguage() {
    localize(document.querySelector<HTMLElement>('#app')!);
    document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN';
    document.title = getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea · Một chút bình yên' : 'Sữa Bea 的小屋';
    document.querySelector('meta[name=description]')?.setAttribute('content', getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea. Đọc sách, ngắm sóc bay, hoặc chẳng làm gì cả.' : 'Sữa Bea 的小屋。一间可以读书、看看小飞鼠，或者什么都不做的数字小屋。');
    document.querySelectorAll<HTMLButtonElement>('button[data-locale]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === getLocale())));
    document.querySelector('#toast')?.classList.remove('visible');
    this.hideHover();
    const guide = document.querySelector<HTMLElement>('#guide');
    if (guide && !guide.hidden) this.showGuideStep(this.guideStep);
  }
  setTime(mode: TimeMode) {
    document.body.dataset.time = mode;
    setThemeColor(mode === 'night' ? 'dark' : 'light');
    document.querySelector('#room-status')!.textContent = t(roomStatuses[mode]);
    document.querySelectorAll<HTMLButtonElement>('button[data-time]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time === mode)));
  }
  setPetState(state: PetState) { document.querySelector('#pet-status')!.textContent = t(petStatuses[state]); }
  setDiscoveries(count: number, total: number) { document.querySelector('#discovery-summary')!.textContent = `${count} / ${total}`; }
  setWeather(raining: boolean) {
    const button = document.querySelector<HTMLButtonElement>('#weather')!;
    const label = t(raining ? '切换晴天' : '切换下雨');
    button.setAttribute('aria-pressed', String(raining));
    button.setAttribute('aria-label', label);
    button.title = `${t(raining ? '正在下雨' : '晴天')} · ${label}`;
    button.querySelector('.dock-label')!.textContent = t('下雨');
  }
  setSound(on: boolean) {
    const button = document.querySelector<HTMLButtonElement>('#sound')!;
    const label = t(on ? '关闭声音' : '打开声音');
    button.setAttribute('aria-pressed', String(on)); button.setAttribute('aria-label', label); button.title = label;
    button.querySelector('.dock-label')!.textContent = t('声音');
  }
  dismissInstructions() { document.querySelector('.instructions')?.classList.add('faded'); }
  showInstructions() { document.querySelector('.instructions')?.classList.remove('faded'); }
  showTooltip(label: string, x: number, y: number) {
    const tooltip = document.querySelector<HTMLElement>('#tooltip')!;
    tooltip.textContent = t(label);
    tooltip.hidden = false;
    const bounds = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(x - bounds.width / 2, innerWidth - bounds.width - 8))}px`;
    const top = y - bounds.height - 16;
    tooltip.style.top = `${Math.max(8, Math.min(top < 8 ? y + 16 : top, innerHeight - bounds.height - 8))}px`;
  }
  /** A flattened ink ellipse drawn around the hovered object, with its name tag just above; redrawn only when the target changes. */
  showRing(id: string, label: string, x: number, y: number, size: number) {
    const ring = document.querySelector<HTMLElement>('#ink-ring')!;
    if (ring.dataset.target !== id) { ring.dataset.target = id; ring.classList.remove('drawing'); void ring.offsetWidth; ring.classList.add('drawing'); }
    ring.hidden = false;
    ring.style.setProperty('--size', `${Math.round(size)}px`);
    ring.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    this.showTooltip(label, x, y - size * .31);
  }
  hideHover() {
    (document.querySelector('#tooltip') as HTMLElement | null)?.setAttribute('hidden', '');
    const ring = document.querySelector<HTMLElement>('#ink-ring');
    if (ring) { ring.hidden = true; ring.dataset.target = ''; }
  }
  /** A quiet notice; with a glyph it lands as a seal stamp, for new discoveries. */
  toast(message: string, glyph?: string) {
    clearTimeout(this.toastTimer);
    const el = document.querySelector<HTMLElement>('#toast')!;
    el.classList.remove('visible', 'stamped');
    el.replaceChildren();
    if (glyph) {
      const seal = document.createElement('span'); seal.className = 'seal-chip toast-seal'; seal.setAttribute('aria-hidden', 'true'); seal.textContent = glyph;
      el.append(seal);
    }
    const text = document.createElement('span'); text.textContent = t(message); el.append(text);
    void el.offsetWidth;
    el.classList.add('visible'); if (glyph) el.classList.add('stamped');
    this.toastTimer = window.setTimeout(() => el.classList.remove('visible'), 4200);
  }
  focus(label?: string, pages = true) {
    this.root.classList.toggle('focus-active', !!label);
    this.root.querySelectorAll<HTMLElement>('[data-exploration]').forEach(el => { el.inert = !!label; });
    (document.querySelector('#focus-label') as HTMLElement).hidden = !label;
    document.querySelector('#focus-label')!.textContent = label ? t(label) : '';
    (document.querySelector('#focus-controls') as HTMLElement).hidden = !label;
    (document.querySelector('#next-page') as HTMLElement).hidden = !pages;
    if (!label) this.hidePage();
    this.hideHover();
  }
  /** The note is real HTML on a paper leaf, so it stays crisp, selectable and readable by screen readers. */
  showPage(page: ReadingPage, turn: boolean) {
    const article = document.querySelector<HTMLElement>('#reading-page')!;
    const leaf = document.createElement('div'); leaf.className = `reading-leaf${turn ? ' turning' : ''}`;
    const eyebrow = document.createElement('p'); eyebrow.className = 'reading-eyebrow'; eyebrow.textContent = page.eyebrow;
    const quote = document.createElement('h2'); quote.className = 'reading-quote';
    page.lines.forEach((line, i) => { if (i) quote.append(document.createElement('br')); quote.append(line); });
    const secondary = document.createElement('p'); secondary.className = 'reading-secondary'; secondary.textContent = page.secondary;
    const footer = document.createElement('footer'); footer.className = 'reading-footer';
    const signature = document.createElement('span'); signature.textContent = '— Sữa Bea —';
    const seal = document.createElement('span'); seal.className = 'seal-chip reading-seal'; seal.setAttribute('aria-hidden', 'true'); seal.textContent = '家';
    const count = document.createElement('span'); count.className = 'reading-count'; count.textContent = page.total > 1 ? `${page.page} / ${page.total}` : '';
    footer.append(signature, seal, count);
    leaf.append(eyebrow, quote, secondary, footer);
    article.replaceChildren(leaf); article.hidden = false;
  }
  hidePage() { const article = document.querySelector<HTMLElement>('#reading-page'); if (article) { article.hidden = true; article.replaceChildren(); } }
  startGuide(onDone: () => void) { this.onGuideDone = onDone; this.dismissInstructions(); this.showGuideStep(0); }
  private showGuideStep(step: number) {
    if (step >= guideSteps.length) { this.finishGuide(); return; }
    this.guideStep = step;
    const guide = document.querySelector<HTMLElement>('#guide')!, last = step === guideSteps.length - 1;
    guide.innerHTML = `<span class="seal-chip guide-seal" aria-hidden="true">${guideSteps[step].glyph}</span>
      <div><p class="guide-count">${step + 1} / ${guideSteps.length}</p><p id="guide-text">${t(guideSteps[step].text)}</p>
      <div class="guide-actions"><button class="guide-primary" data-guide="next">${t(last ? '开始吧' : '下一步')}</button>${last ? '' : `<button data-guide="skip">${t('跳过')}</button>`}</div></div>`;
    guide.hidden = false;
    guide.querySelector<HTMLButtonElement>('[data-guide="next"]')?.focus({ preventScroll: true });
  }
  private finishGuide() {
    (document.querySelector('#guide') as HTMLElement).hidden = true;
    this.onGuideDone?.(); this.onGuideDone = undefined;
  }
  ready() {
    document.querySelector('#loading')?.classList.add('leaving');
    setTimeout(() => document.querySelector('#loading')?.remove(), 600);
  }
}
