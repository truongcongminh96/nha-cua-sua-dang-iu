import { createIcons, House, Sun, Sunset, Moon, Volume2, VolumeX, RotateCcw, BookOpen, X, ArrowLeft, ArrowRight, CloudRain, Info } from 'lucide';
import { getLocale, t } from '../data/i18n';
import { localize } from './localize';
import type { TimeMode } from '../systems/TimeOfDay';
import type { PetState } from '../pet/types';
import { petStatuses, roomStatuses } from './copy';
import { setThemeColor } from './theme';

export function icons() {
  createIcons({ icons: { House, Sun, Sunset, Moon, Volume2, VolumeX, RotateCcw, BookOpen, X, ArrowLeft, ArrowRight, CloudRain, Info }, attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
}

export class UI {
  readonly root: HTMLElement;
  private toastTimer = 0;
  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="world" role="application" aria-label="Sữa Bea 的互动小屋。拖动旋转，滚轮缩放。也可以从小屋介绍中使用物件按钮。"><canvas id="world-canvas" data-live-copy aria-label="可探索的三维小屋" tabindex="0"></canvas></div>
      <main class="ui">
        <header class="brand" data-exploration>
          <a class="back-home" href="?page=choose"><i data-lucide="arrow-left"></i><span>返回首页</span></a>
          <div class="brand-caption"><i data-lucide="house"></i><span>一间小屋</span></div>
          <h1 aria-label="Sữa Bea 的小屋">Sữa Bea</h1>
          <p class="status" id="room-status" data-live-copy></p>
        </header>
        <nav class="top-controls paper-group" data-exploration aria-label="小屋氛围">
          <button class="icon-button" id="sound" data-live-copy aria-label="打开声音" aria-pressed="false" title="打开声音"><i data-lucide="volume-x"></i></button>
          <div class="time-control" role="group" aria-label="选择时间">
            <button data-time="day" aria-pressed="false" aria-label="日光" title="日光"><i data-lucide="sun"></i><span>日光</span></button>
            <button data-time="golden" aria-pressed="false" aria-label="黄昏" title="黄昏"><i data-lucide="sunset"></i><span>黄昏</span></button>
            <button data-time="night" aria-pressed="false" aria-label="夜晚" title="夜晚"><i data-lucide="moon"></i><span>夜晚</span></button>
          </div>
        </nav>
        <div class="language-control lang-switch" role="group" aria-label="中文 / Tiếng Việt" data-live-copy>
          <button data-locale="vi" lang="vi" aria-label="Tiếng Việt" aria-pressed="false">VI</button><span aria-hidden="true">/</span><button data-locale="zh" lang="zh-CN" aria-label="中文" aria-pressed="false">中文</button>
        </div>
        <div class="pet-status" data-exploration><strong>Mochi</strong><span id="pet-status" data-live-copy></span></div>
        <div class="lower-left" data-exploration>
          <button class="collection-button" id="collection" aria-label="打开小屋手记" aria-controls="drawer" aria-expanded="false"><i data-lucide="book-open"></i><span>手记</span><small data-live-copy id="discovery-summary"></small></button>
        </div>
        <div class="instructions" data-exploration><span class="desktop-hint">拖动环顾<span class="dots">·</span>滚轮靠近<span class="dots">·</span>轻点，发现小惊喜</span></div>
        <nav class="bottom-right paper-group" data-exploration aria-label="小屋设置">
          <button class="icon-button" id="weather" data-live-copy aria-label="切换下雨" aria-pressed="false" title="切换下雨"><i data-lucide="cloud-rain"></i></button>
          <button class="icon-button" id="reset" aria-label="重置视角" title="回到最初的视角"><i data-lucide="rotate-ccw"></i></button>
          <button class="icon-button" id="about" aria-label="关于小屋与无障碍探索" title="关于小屋" aria-controls="drawer" aria-expanded="false"><i data-lucide="info"></i></button>
        </nav>
        <div class="tooltip" id="tooltip" data-live-copy hidden></div>
        <div class="toast" id="toast" data-live-copy role="status" aria-live="polite" aria-atomic="true"></div>
        <div class="focus-label" id="focus-label" data-live-copy hidden></div>
        <div class="focus-controls paper-group" id="focus-controls" hidden><button id="leave-focus"><i data-lucide="arrow-left"></i>回到小屋</button><button id="next-page">再读一页<i data-lucide="arrow-right"></i></button></div>
        <section class="drawer" id="drawer" role="dialog" aria-modal="false" aria-labelledby="drawer-title" hidden></section>
      </main>
      <div class="loading" id="loading"><i class="loader-mark" data-lucide="house" aria-hidden="true"></i><p>正在把小屋的灯点亮</p></div>`;
    this.root = container.querySelector('.ui')!;
    icons();
    if (matchMedia('(pointer: coarse)').matches) container.querySelector('.desktop-hint')!.innerHTML = '单指环顾<span class="dots">·</span>双指靠近<span class="dots">·</span>轻点，发现小惊喜';
    this.refreshLanguage();
  }
  refreshLanguage() {
    localize(document.querySelector<HTMLElement>('#app')!);
    document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN';
    document.title = getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea · Một chút bình yên' : 'Sữa Bea 的小屋';
    document.querySelector('meta[name=description]')?.setAttribute('content', getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea. Đọc sách, ngắm sóc bay, hoặc chẳng làm gì cả.' : 'Sữa Bea 的小屋。一间可以读书、看看小飞鼠，或者什么都不做的数字小屋。');
    document.querySelectorAll<HTMLButtonElement>('button[data-locale]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === getLocale())));
    document.querySelector('#toast')?.classList.remove('visible');
    (document.querySelector('#tooltip') as HTMLElement).hidden = true;
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
  toast(message: string) {
    clearTimeout(this.toastTimer);
    const el = document.querySelector('#toast')!;
    el.textContent = t(message);
    el.classList.add('visible');
    this.toastTimer = window.setTimeout(() => el.classList.remove('visible'), 4200);
  }
  focus(label?: string, pages = true) {
    this.root.classList.toggle('focus-active', !!label);
    this.root.querySelectorAll<HTMLElement>('[data-exploration]').forEach(el => { el.inert = !!label; });
    (document.querySelector('#focus-label') as HTMLElement).hidden = !label;
    document.querySelector('#focus-label')!.textContent = label ? t(label) : '';
    (document.querySelector('#focus-controls') as HTMLElement).hidden = !label;
    (document.querySelector('#next-page') as HTMLElement).hidden = !pages;
  }
  ready() {
    document.querySelector('#loading')?.classList.add('leaving');
    setTimeout(() => document.querySelector('#loading')?.remove(), 600);
  }
}
