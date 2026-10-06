import { getLocale, t } from '../data/i18n';
import { localize } from './localize';
import { discoveries, localDate, type Discovery } from '../systems/Discovery';
import type { InteractableRegistry } from '../systems/Interactable';
import { icons } from './UI';

export class Journal {
  private drawer = document.querySelector<HTMLElement>('#drawer')!;
  private returnFocus?: HTMLElement;
  private mode: 'collection' | 'about' = 'collection';
  constructor(private discovery: Discovery, private interactions: InteractableRegistry, private activate: (id: string) => void, private toggleMusic: () => boolean, private musicEnabled: () => boolean, private look?: { get: () => boolean; toggle: () => boolean }) {
    document.querySelector('#collection')!.addEventListener('click', () => this.open('collection'));
    document.querySelector('#about')!.addEventListener('click', () => this.open('about'));
    this.drawer.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (target?.dataset.action === 'close') this.close();
      if (target?.dataset.object) { this.close(); this.activate(target.dataset.object); }
      if (target?.dataset.action === 'music') {
        const music = this.toggleMusic();
        target.textContent = t(music ? '轻音乐 · 已打开' : '轻音乐 · 已关闭');
        target.setAttribute('aria-pressed', String(music));
      }
      if (target?.dataset.action === 'look' && this.look) {
        const paper = this.look.toggle();
        target.textContent = t(paper ? '画风 · 水彩' : '画风 · 原版');
        target.setAttribute('aria-pressed', String(paper));
      }
    });
    this.drawer.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); this.close(); }
    });
  }
  open(mode: 'collection' | 'about') {
    // An explicit opener also works when a pointer click does not focus its button.
    this.returnFocus = document.querySelector<HTMLElement>(mode === 'collection' ? '#collection' : '#about')!;
    this.mode = mode;
    this.render();
    this.drawer.hidden = false;
    document.querySelector('.ui')?.classList.add('drawer-open');
    this.updateExpanded();
    this.drawer.querySelector<HTMLButtonElement>('[data-action="close"]')?.focus({ preventScroll: true });
  }
  close() {
    if (!this.isOpen) return;
    this.drawer.hidden = true;
    document.querySelector('.ui')?.classList.remove('drawer-open');
    this.updateExpanded();
    if (!this.returnFocus?.closest('[inert]')) this.returnFocus?.focus({ preventScroll: true });
  }
  get isOpen() { return !this.drawer.hidden; }
  refresh() {
    if (!this.isOpen) return;
    const body = this.drawer.querySelector<HTMLElement>('.drawer-body')!;
    const scroll = body.scrollTop;
    const focused = document.activeElement as HTMLElement | null;
    const ownedFocus = !!focused && this.drawer.contains(focused);
    const action = focused?.dataset.action, object = focused?.dataset.object;
    this.render();
    if (ownedFocus) {
      const replacement = [...this.drawer.querySelectorAll<HTMLButtonElement>('button')].find(button =>
        (action && button.dataset.action === action) || (object && button.dataset.object === object));
      (replacement ?? this.drawer.querySelector<HTMLButtonElement>('[data-action="close"]'))?.focus({ preventScroll: true });
    }
    this.drawer.querySelector<HTMLElement>('.drawer-body')!.scrollTop = scroll;
  }
  private updateExpanded() {
    document.querySelector('#collection')!.setAttribute('aria-expanded', String(this.isOpen && this.mode === 'collection'));
    document.querySelector('#about')!.setAttribute('aria-expanded', String(this.isOpen && this.mode === 'about'));
  }
  private render() {
    const date = new Date();
    const dateLabel = date.toLocaleDateString(getLocale() === 'vi' ? 'vi-VN' : 'zh-CN', { day: 'numeric', month: 'long', year: 'numeric' });
    const heading = this.mode === 'collection' ? '小屋手记' : '关于小屋';
    const header = `<header class="drawer-header"><div><time data-live-copy datetime="${localDate(date)}">${dateLabel}</time><h2 id="drawer-title">${heading}</h2></div><button class="icon-button close" data-action="close" aria-label="关闭面板"><i data-lucide="x"></i></button></header>`;
    if (this.mode === 'collection') {
      const seen = discoveries.filter(d => this.discovery.has(d.id));
      this.drawer.innerHTML = `${header}<div class="drawer-body">
        ${seen.length ? `<ul class="moment-list">${seen.map(d => `<li data-moment="${d.id}">${d.label}</li>`).join('')}</ul>` : '<div class="empty-journal"><p>今天还没有记录。</p><p>可以翻一本书，或陪 Mochi 待一会儿。</p></div>'}
        <footer class="drawer-footer"><p class="moment-summary" data-live-copy>${this.discovery.count} / ${discoveries.length} · ${t('小小的记录')}</p><p>${this.discovery.persistent ? '手记只保存在这台设备里，每天轻轻翻开新的一页。' : '这次的发现会留在当前页面里。浏览器暂时无法保存手记。'}</p></footer>
      </div>`;
    } else {
      this.drawer.innerHTML = `${header}<div class="drawer-body">
        <div class="welcome"><span class="home-seal seal-chip" aria-hidden="true">家</span><p>来坐一会儿吧。</p></div>
        <p>可以翻一本书，听听雨，或者什么也不做。</p>
        <p>Mochi 是这里的小飞鼠室友。白天爱睡觉，晚上喜欢四处逛逛。你离开时，它也会照顾好自己。</p>
        <button class="text-button" data-action="music" aria-pressed="${this.musicEnabled()}">${this.musicEnabled() ? '轻音乐 · 已打开' : '轻音乐 · 已关闭'}</button>
        ${this.look ? `<button class="text-button" data-action="look" aria-pressed="${this.look.get()}">${this.look.get() ? '画风 · 水彩' : '画风 · 原版'}</button>` : ''}
        <h3>在小屋里走走</h3><p>拖动环顾，滚轮或双指缩放。点开书后可以再读一页，按 Esc 回到小屋。</p>
        <p>也可以直接选择一个物件：</p>
        <div class="accessible-objects">${this.interactions.entries.map(entry => `<button data-object="${entry.id}"><span>${entry.label}</span><i data-lucide="arrow-right"></i></button>`).join('')}</div>
      </div>`;
    }
    localize(this.drawer);
    icons();
  }
}
