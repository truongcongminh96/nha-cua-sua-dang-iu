import { getLocale, t } from '../data/i18n';
import { localize } from './localize';
import { discoveries, type Discovery } from '../systems/Discovery';
import type { InteractableRegistry } from '../systems/Interactable';
import { icons } from './UI';
export class Journal {
  private drawer = document.querySelector<HTMLElement>('#drawer')!;
  private returnFocus?: HTMLElement;
  private mode: 'collection' | 'about' = 'collection';
  constructor(private discovery: Discovery, private interactions: InteractableRegistry, private activate: (id: string) => void, private toggleMusic: () => boolean, private musicEnabled: () => boolean) {
    document.querySelector('#collection')!.addEventListener('click', () => this.open('collection'));
    document.querySelector('#about')!.addEventListener('click', () => this.open('about'));
    this.drawer.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (target?.dataset.action === 'close') this.close();
      if (target?.dataset.object) { this.close(); this.activate(target.dataset.object); }
      if (target?.dataset.action === 'music') { const music = this.toggleMusic(); target.textContent = t(music ? '轻音乐 · 已打开' : '轻音乐 · 已关闭'); target.setAttribute('aria-pressed', String(music)); }
    });
    this.drawer.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); this.close(); }
    });
  }
  open(mode: 'collection' | 'about') {
    this.returnFocus = document.activeElement as HTMLElement; this.mode = mode; this.render(); this.drawer.hidden = false;
    this.drawer.querySelector<HTMLButtonElement>('button')?.focus();
  }
  close() { this.drawer.hidden = true; this.returnFocus?.focus(); }
  get isOpen() { return !this.drawer.hidden; }
  refresh() { if (this.isOpen) { const scroll = this.drawer.scrollTop; this.render(); this.drawer.scrollTop = scroll; } }
  private render() {
    const close = '<button class="icon-button close" data-action="close" aria-label="关闭手记"><i data-lucide="x"></i></button>';
    if (this.mode === 'collection') {
      this.drawer.innerHTML = `${close}<div class="eyebrow">A POCKETFUL OF LITTLE THINGS</div><h2>今天，留住的温柔</h2><p>有些瞬间，遇见就很好。<br>没有需要完成的事，也不用刻意寻找。</p><ul class="moment-list">${discoveries.map(d => `<li class="${this.discovery.has(d.id) ? '' : 'unknown'}"><i data-lucide="${this.discovery.has(d.id) ? 'check' : 'circle'}"></i><span>${this.discovery.has(d.id) ? d.label : d.hint}</span></li>`).join('')}</ul><p class="drawer-footer">${this.discovery.count} / 12 ${getLocale() === 'vi' ? 'khoảnh khắc nhỏ' : 'little moments'}<br>${this.discovery.persistent ? '手记只保存在这台设备里，每天轻轻翻开新的一页。' : '这次的发现会留在当前页面里。浏览器暂时无法保存手记。'}</p>`;
    } else {
      this.drawer.innerHTML = `${close}<div class="eyebrow">YOU CAN JUST BE HERE</div><h2>欢迎来 Sữa Bea 的小屋</h2><p>这里没有待办事项。你可以翻一本书，听一场雨，陪 Mochi 看看窗外，也可以什么都不做。</p><p>Mochi 是一只小飞鼠，白天常常犯困，到了晚上就想四处探索。它有自己的节奏，不用喂养，也不用担心离开。</p><button class="text-button" data-action="music" aria-pressed="${this.musicEnabled()}">${this.musicEnabled() ? '轻音乐 · 已打开' : '轻音乐 · 已关闭'}</button><p>拖动环顾，滚轮或双指缩放。点开书后可以再读一页，按 Esc 回到小屋。</p><p>也可以从这里选择想靠近的物件：</p><div class="accessible-objects">${this.interactions.entries.map(entry => `<button data-object="${entry.id}">${entry.label}</button>`).join('')}</div><p class="about-footer">A little house<br>that heals with you.</p>`;
    }
    localize(this.drawer); icons();
  }
}
