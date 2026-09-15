import { createIcons, House, Sun, Sunset, Moon, Volume2, VolumeX, RotateCcw, BookOpen, X, ArrowLeft, ArrowRight, CloudRain, Leaf, Sparkles, Heart, Info, Check, Circle, Wind } from 'lucide';
import { getLocale, t } from '../data/i18n';
import { localize } from './localize';
import { timePresets, type TimeMode } from '../systems/TimeOfDay';
export function icons() { createIcons({ icons: { House, Sun, Sunset, Moon, Volume2, VolumeX, RotateCcw, BookOpen, X, ArrowLeft, ArrowRight, CloudRain, Leaf, Sparkles, Heart, Info, Check, Circle, Wind }, attrs: { 'stroke-width': 1.5 } }); }
export class UI {
  readonly root: HTMLElement;
  private toastTimer = 0;
  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="world" role="application" aria-label="Sữa Bea 的互动小屋。拖动旋转，滚轮缩放。也可以从小屋介绍中使用物件按钮。"><canvas id="world-canvas" data-live-copy aria-label="可探索的三维小屋" tabindex="0"></canvas></div>
      <main class="ui">
        <div class="focus-shade" aria-hidden="true"></div>
        <header class="brand"><div class="eyebrow"><i data-lucide="house"></i> A LITTLE HOUSE, A LITTLE PEACE</div><h1>Sữa Bea<span>的小屋</span></h1><p class="status" id="room-status" data-live-copy></p></header>
        <nav class="top-controls" aria-label="小屋氛围">
          <button class="icon-button" id="sound" data-live-copy aria-label="打开声音" aria-pressed="false" title="打开声音"><i data-lucide="volume-x"></i></button>
          <div class="time-control" aria-label="选择时间"><button data-time="day" aria-pressed="false" aria-label="日光"><i data-lucide="sun"></i><span>日光</span></button><button data-time="golden" aria-pressed="false" aria-label="黄昏"><i data-lucide="sunset"></i><span>黄昏</span></button><button data-time="night" aria-pressed="false" aria-label="夜晚"><i data-lucide="moon"></i><span>夜晚</span></button></div>
        </nav>
        <div class="language-control" role="group" aria-label="中文 / Tiếng Việt" data-live-copy><button data-locale="zh" lang="zh-CN" aria-pressed="true">中文</button><span aria-hidden="true">/</span><button data-locale="vi" lang="vi" aria-pressed="false">Tiếng Việt</button></div>
        <div class="weather-label"><i data-lucide="wind"></i><span id="weather-label" data-live-copy>微风，和一点安静</span></div>
        <div class="pet-status"><strong>Mochi</strong><br><span id="pet-status" data-live-copy>正在慢慢醒来</span></div>
        <div class="lower-left"><button class="collection-button" id="collection" aria-label="打开今日发现"><i data-lucide="book-open"></i><div><span>今日的小小发现 <em>·</em> <b id="discovery-count">0</b><em> / 12</em></span><small>LITTLE MOMENTS, JUST FOR YOU</small></div></button><span class="home-caption">Make yourself at home.</span></div>
        <div class="instructions"><p>不用做什么，待一会儿就好。</p><span class="desktop-hint">拖动环顾<span class="dots">·</span>滚轮靠近<span class="dots">·</span>轻点，发现小惊喜</span></div>
        <nav class="bottom-right" aria-label="小屋设置"><button class="icon-button" id="weather" data-live-copy aria-label="切换下雨" aria-pressed="false" title="听一场雨"><i data-lucide="cloud-rain"></i></button><button class="icon-button" id="reset" aria-label="重置视角" title="回到最初的视角"><i data-lucide="rotate-ccw"></i></button><button class="icon-button" id="about" aria-label="关于小屋与无障碍探索" title="关于小屋"><i data-lucide="info"></i></button></nav>
        <div class="tooltip" id="tooltip" data-live-copy hidden></div><div class="toast" id="toast" data-live-copy role="status" aria-live="polite"></div>
        <div class="focus-label" id="focus-label" data-live-copy hidden></div><div class="focus-controls" id="focus-controls" hidden><button id="leave-focus"><i data-lucide="arrow-left"></i>回到小屋</button><button id="next-page">再读一页<i data-lucide="arrow-right"></i></button></div>
        <section class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="小屋手记" hidden></section>
      </main><div class="loading" id="loading"><div class="loader-mark"></div><p>正在把小屋的灯点亮</p><small>A little pause before a little peace.</small></div>`;
    this.root = container.querySelector('.ui')!; icons();
    if (matchMedia('(pointer: coarse)').matches) container.querySelector('.desktop-hint')!.innerHTML = '单指环顾<span class="dots">·</span>双指靠近<span class="dots">·</span>轻点，发现小惊喜';
    this.refreshLanguage();
  }
  refreshLanguage() {
    localize(document.querySelector<HTMLElement>('#app')!);
    document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN';
    document.title = getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea · Một chút bình yên' : 'Sữa Bea 的小屋 · A little house that heals with you';
    document.querySelector('meta[name=description]')?.setAttribute('content', getLocale() === 'vi' ? 'Nhà nhỏ của Sữa Bea. Đọc sách, ngắm sóc bay, hoặc chẳng làm gì cả.' : 'Sữa Bea 的小屋。一间可以读书、看看小飞鼠，或者什么都不做的数字小屋。');
    document.querySelectorAll<HTMLButtonElement>('button[data-locale]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === getLocale())));
    document.querySelector('#toast')?.classList.remove('visible');
    (document.querySelector('#tooltip') as HTMLElement).hidden = true;
  }
  setTime(mode: TimeMode) { document.body.dataset.time = mode; document.querySelector('#room-status')!.textContent = t(timePresets[mode].status); document.querySelectorAll<HTMLButtonElement>('button[data-time]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time === mode))); }
  toast(message: string) { clearTimeout(this.toastTimer); const el = document.querySelector('#toast')!; el.textContent = t(message); el.classList.add('visible'); this.toastTimer = window.setTimeout(() => el.classList.remove('visible'), 4200); }
  focus(label?: string, pages = true) { this.root.classList.toggle('focus-active', !!label); (document.querySelector('#focus-label') as HTMLElement).hidden = !label; document.querySelector('#focus-label')!.textContent = label ? t(label) : ''; (document.querySelector('#focus-controls') as HTMLElement).hidden = !label; (document.querySelector('#next-page') as HTMLElement).hidden = !pages; }
  ready() { document.querySelector('#loading')?.classList.add('leaving'); setTimeout(() => document.querySelector('#loading')?.remove(), 900); }
}
